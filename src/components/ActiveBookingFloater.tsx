import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const statusLabels: Record<string, string> = {
  pending: 'Finding cleaner…',
  assigned: 'Cleaner assigned',
  'en-route': 'Cleaner on the way',
  'otp-verified': 'Verified',
  'in-progress': 'Cleaning in progress',
};

export default function ActiveBookingFloater() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: activeBooking } = useQuery({
    queryKey: ['active-booking-floater', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('bookings')
        .select('id, status, service_name, cleaner_name')
        .eq('customer_id', user.id)
        .not('status', 'in', '("completed","cancelled")')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 5000,
  });

  // Listen for realtime updates
  useEffect(() => {
    if (!activeBooking?.id) return;
    const channel = supabase
      .channel(`floater-${activeBooking.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${activeBooking.id}` },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['active-booking-floater'] });
          // Auto-navigate to rating when completed
          if ((payload.new as any).status === 'completed') {
            navigate('/rate-service', { state: { bookingId: activeBooking.id } });
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeBooking?.id, queryClient, navigate]);

  if (!activeBooking) return null;

  const label = statusLabels[activeBooking.status] || activeBooking.status;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="fixed bottom-[88px] left-4 right-4 z-40"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/active-booking', { state: { bookingId: activeBooking.id } })}
          className="w-full bg-foreground rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-elevated"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-bold text-background truncate">{activeBooking.service_name}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] text-background/50 font-medium">{label}</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-background/30 shrink-0" strokeWidth={1.5} />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
