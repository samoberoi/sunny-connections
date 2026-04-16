import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, PoundSterling, Zap, X, CheckCircle2, SkipForward, Home, Building2, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { playNotificationSound } from '@/lib/notificationSound';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const propertyIcons: Record<string, any> = { flat: Building2, house: Home, office: Landmark };

export default function NewJobPopup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [popupJob, setPopupJob] = useState<any>(null);
  const seenJobIds = useRef<Set<string>>(new Set());
  const prevPendingIds = useRef<Set<string>>(new Set());

  // Get cleaner record
  const { data: cleanerRecord } = useQuery({
    queryKey: ['my-cleaner-record', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('cleaners').select('*').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  // Listen for new pending bookings in real-time
  useEffect(() => {
    if (!cleanerRecord) return;

    const channel = supabase.channel('new-job-popup')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
        filter: 'status=eq.pending',
      }, async (payload) => {
        const newJob = payload.new as any;
        if (!newJob || seenJobIds.current.has(newJob.id)) return;
        if (newJob.cleaner_id) return;

        const specs = cleanerRecord?.specialisations || [];
        if (specs.length > 0) {
          const sLower = (newJob.service_name || '').toLowerCase().trim();
          const matches = specs.some((spec: string) => {
            const specLower = spec.toLowerCase().trim();
            return sLower === specLower || sLower.includes(specLower) || specLower.includes(sLower);
          });
          if (!matches) return;
        }

        if (!cleanerRecord?.available) return;

        seenJobIds.current.add(newJob.id);

        // For recurring jobs, find the nearest instance date
        let displayJob = newJob;
        if (newJob.recurring && newJob.recurring !== 'none') {
          const { data: siblings } = await supabase.from('bookings').select('*')
            .eq('customer_id', newJob.customer_id)
            .eq('service_name', newJob.service_name)
            .eq('recurring', newJob.recurring)
            .eq('status', 'pending')
            .is('cleaner_id', null)
            .order('date', { ascending: true })
            .limit(1);
          if (siblings && siblings.length > 0) {
            displayJob = { ...siblings[0], _recurringCount: undefined };
            // Mark all siblings as seen
            const { data: allSiblings } = await supabase.from('bookings').select('id')
              .eq('customer_id', newJob.customer_id)
              .eq('service_name', newJob.service_name)
              .eq('recurring', newJob.recurring)
              .eq('status', 'pending')
              .is('cleaner_id', null);
            allSiblings?.forEach(s => seenJobIds.current.add(s.id));
          }
        }

        playNotificationSound();
        setPopupJob(displayJob);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [cleanerRecord]);

  // Also poll for new pending jobs (fallback for missed realtime events)
  const { data: pendingJobs = [] } = useQuery({
    queryKey: ['popup-pending-jobs'],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('*')
        .is('cleaner_id', null).eq('status', 'pending')
        .order('created_at', { ascending: false }).limit(20);
      return data || [];
    },
    enabled: !!cleanerRecord?.available,
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (!cleanerRecord?.available || !pendingJobs.length) return;
    const currentIds = new Set(pendingJobs.map((j: any) => j.id));
    const specs = cleanerRecord?.specialisations || [];

    for (const job of pendingJobs) {
      if (prevPendingIds.current.has(job.id) || seenJobIds.current.has(job.id)) continue;
      // Check specialisation
      if (specs.length > 0) {
        const sLower = (job.service_name || '').toLowerCase().trim();
        const matches = specs.some((spec: string) => {
          const specLower = spec.toLowerCase().trim();
          return sLower === specLower || sLower.includes(specLower) || specLower.includes(sLower);
        });
        if (!matches) continue;
      }
      seenJobIds.current.add(job.id);
      playNotificationSound();
      setPopupJob(job);
      break; // show one at a time
    }
    prevPendingIds.current = currentIds;
  }, [pendingJobs, cleanerRecord]);

  const acceptJob = useMutation({
    mutationFn: async (bookingId: string) => {
      if (!cleanerRecord || !user) return;
      const { data: booking } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
      const { error } = await supabase.from('bookings').update({
        cleaner_id: cleanerRecord.id, cleaner_name: user.name, status: 'assigned' as any,
      }).eq('id', bookingId);
      if (error) throw error;

      // Auto-assign recurring siblings
      if (booking && booking.recurring !== 'none') {
        const { data: pendingSiblings } = await supabase.from('bookings').select('id')
          .eq('customer_id', booking.customer_id)
          .eq('service_name', booking.service_name)
          .eq('recurring', booking.recurring)
          .eq('status', 'pending')
          .is('cleaner_id', null)
          .neq('id', bookingId);
        if (pendingSiblings && pendingSiblings.length > 0) {
          await supabase.from('bookings').update({
            cleaner_id: cleanerRecord.id, cleaner_name: user.name, status: 'assigned' as any,
          }).in('id', pendingSiblings.map(s => s.id));
          toast.success(`Also assigned ${pendingSiblings.length} future recurring jobs`);
        }
      }

      if (booking?.customer_id) {
        await supabase.from('notifications').insert({
          user_id: booking.customer_id, title: 'Cleaner Assigned!',
          message: `${user.name} has been assigned to your booking.`, type: 'booking',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaner-all-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['cleaner-my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['cleaner-pending-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['popup-pending-jobs'] });
      toast.success('Job accepted! 🎉');
      setPopupJob(null);
    },
    onError: () => {
      toast.error('Failed to accept job. It may have been taken.');
      setPopupJob(null);
    },
  });

  const handleSkip = useCallback(() => {
    setPopupJob(null);
  }, []);

  if (!popupJob) return null;

  const isExpress = (popupJob.service_name || '').toLowerCase().includes('express');
  const PropIcon = propertyIcons[popupJob.property_type] || Home;

  return (
    <AnimatePresence>
      {popupJob && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm px-4 pb-6"
          onClick={handleSkip}
        >
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card rounded-3xl shadow-elevated border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="bg-foreground px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isExpress && <Zap className="h-4 w-4 text-primary" fill="currentColor" />}
                <h3 className="text-base font-display font-black text-background">
                  {isExpress ? 'Express Job!' : 'New Job Available!'}
                </h3>
              </div>
              <button onClick={handleSkip} className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center">
                <X className="h-4 w-4 text-background/70" />
              </button>
            </div>

            {/* Job Details */}
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-foreground">{popupJob.service_name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{popupJob.customer_name}</p>
                </div>
                <span className="text-xl font-display font-black text-primary">£{popupJob.total_cost}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-3">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Date & Time</p>
                    <p className="text-xs font-bold text-foreground">{popupJob.date} · {popupJob.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-3">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Duration</p>
                    <p className="text-xs font-bold text-foreground">{popupJob.duration} hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-3">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Location</p>
                    <p className="text-xs font-bold text-foreground truncate">{popupJob.address_postcode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-3">
                  <PropIcon className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Property</p>
                    <p className="text-xs font-bold text-foreground capitalize">{popupJob.property_type}</p>
                  </div>
                </div>
              </div>

              {popupJob.notes && (
                <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Notes</p>
                  <p className="text-xs text-foreground">{popupJob.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button variant="outline" onClick={handleSkip}
                  className="flex-1 h-12 rounded-2xl text-sm font-bold border-2">
                  <SkipForward className="h-4 w-4 mr-1.5" /> Skip
                </Button>
                <Button onClick={() => acceptJob.mutate(popupJob.id)} disabled={acceptJob.isPending}
                  className="flex-1 h-12 rounded-2xl text-sm font-bold bg-primary text-primary-foreground">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  {acceptJob.isPending ? 'Accepting...' : 'Accept'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
