import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { playNotificationSound } from '@/lib/notificationSound';

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
  const prevStatusRef = useRef<string | null>(null);

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
          const newStatus = (payload.new as any).status;
          // Play sound on status change
          if (prevStatusRef.current && prevStatusRef.current !== newStatus) {
            playNotificationSound();
          }
          prevStatusRef.current = newStatus;
          queryClient.invalidateQueries({ queryKey: ['active-booking-floater'] });
          if (newStatus === 'completed') {
            navigate('/rate-service', { state: { bookingId: activeBooking.id } });
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeBooking?.id, queryClient, navigate]);

  // Track status for sound
  useEffect(() => {
    if (activeBooking?.status) prevStatusRef.current = activeBooking.status;
  }, [activeBooking?.status]);

  if (!activeBooking) return null;

  const label = statusLabels[activeBooking.status] || activeBooking.status;
  const isInProgress = activeBooking.status === 'in-progress';

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('bookings').update({ status: 'cancelled' as any }).eq('id', activeBooking.id);
    queryClient.invalidateQueries({ queryKey: ['active-booking-floater'] });
    toast.success('Booking cancelled');
    setExpanded(false);
  };

  const handleTap = () => {
    navigate(
      activeBooking.status === 'pending'
        ? '/searching-cleaner'
        : '/active-booking',
      { state: { bookingId: activeBooking.id } }
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="fixed bottom-[88px] right-4 z-40"
      >
        <motion.div className="flex flex-col items-end gap-2">
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

          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleTap}
            onContextMenu={(e) => { e.preventDefault(); setExpanded(!expanded); }}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-elevated relative bg-primary"
          >
            <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
            {isInProgress ? (
              <Loader2 className="h-6 w-6 text-primary-foreground animate-spin" strokeWidth={2} />
            ) : (
              <Sparkles className="h-6 w-6 text-primary-foreground" strokeWidth={2} />
            )}
          </motion.button>
          
          <div className="bg-foreground/90 backdrop-blur-md text-background text-[10px] font-bold px-3 py-1 rounded-full shadow-sm max-w-[160px] truncate">
            {label}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
