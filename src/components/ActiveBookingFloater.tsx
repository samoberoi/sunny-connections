import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
  const [expanded, setExpanded] = useState(false);

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

  useEffect(() => {
    if (!activeBooking?.id) return;
    const channel = supabase
      .channel(`floater-${activeBooking.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${activeBooking.id}` },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['active-booking-floater'] });
          if ((payload.new as any).status === 'completed') {
            navigate('/rate-service', { state: { bookingId: activeBooking.id } });
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeBooking?.id, queryClient, navigate]);

  if (!activeBooking) return null;

  const label = statusLabels[activeBooking.status] || activeBooking.status;

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('bookings').update({ status: 'cancelled' as any }).eq('id', activeBooking.id);
    queryClient.invalidateQueries({ queryKey: ['active-booking-floater'] });
    toast.success('Booking cancelled');
    setExpanded(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-40 w-auto max-w-[280px]"
      >
        <motion.div className="flex flex-col items-center gap-2">
          {/* Cancel button when expanded */}
          <AnimatePresence>
            {expanded && (
              <motion.button
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.9 }}
                onClick={handleCancel}
                className="bg-destructive text-destructive-foreground rounded-full px-5 py-2 text-xs font-bold shadow-lg flex items-center gap-1.5"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} /> Cancel Booking
              </motion.button>
            )}
          </AnimatePresence>

          {/* Main pill */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setExpanded(!expanded)}
            onDoubleClick={() => navigate(
              activeBooking.status === 'pending'
                ? '/searching-cleaner'
                : '/active-booking',
              { state: { bookingId: activeBooking.id } }
            )}
            className="bg-primary rounded-full px-5 py-2.5 flex items-center gap-2 shadow-elevated"
          >
            <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse shrink-0" />
            <p className="text-xs font-bold text-primary-foreground whitespace-nowrap">{label}</p>
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
