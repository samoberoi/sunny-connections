import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarOff, Check, X, AlertTriangle, UserCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AdminLeaves() {
  const queryClient = useQueryClient();

  const { data: leaves = [] } = useQuery({
    queryKey: ['admin-leaves'],
    queryFn: async () => {
      const { data } = await supabase.from('cleaner_leaves').select('*, cleaners!cleaner_leaves_cleaner_id_fkey(name, user_id, specialisations)').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-leave-bookings'],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('*').in('status', ['assigned', 'en-route']).order('date');
      return data || [];
    },
  });

  const { data: allCleaners = [] } = useQuery({
    queryKey: ['admin-leave-cleaners'],
    queryFn: async () => {
      const { data } = await supabase.from('cleaners').select('id, name, user_id, available, specialisations, address_postcode');
      return data || [];
    },
  });

  // Get active leaves to exclude cleaners already on leave
  const { data: allActiveLeaves = [] } = useQuery({
    queryKey: ['admin-all-active-leaves'],
    queryFn: async () => {
      const { data } = await supabase.from('cleaner_leaves').select('cleaner_id, start_date, end_date')
        .eq('status', 'approved');
      return data || [];
    },
  });

  const { data: activeJobCounts = [] } = useQuery({
    queryKey: ['admin-leave-job-counts'],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('cleaner_id')
        .in('status', ['assigned', 'en-route', 'otp-verified', 'in-progress'])
        .not('cleaner_id', 'is', null);
      return data || [];
    },
  });

  /** Find the best replacement cleaner for a booking during a leave period */
  const findBestReplacement = (booking: any, leaveCleanerId: string, leaveStart: string, leaveEnd: string) => {
    const serviceName = (booking.service_name || '').toLowerCase().trim();

    // Build job count map
    const jobMap = new Map<string, number>();
    activeJobCounts.forEach((b: any) => {
      jobMap.set(b.cleaner_id, (jobMap.get(b.cleaner_id) || 0) + 1);
    });

    // Find cleaners NOT on leave during booking date
    const candidates = allCleaners.filter((c: any) => {
      if (c.id === leaveCleanerId) return false;
      if (!c.available) return false;

      // Check if this cleaner is on leave during the booking date
      const isOnLeave = allActiveLeaves.some((l: any) =>
        l.cleaner_id === c.id && booking.date >= l.start_date && booking.date <= l.end_date
      );
      if (isOnLeave) return false;

      return true;
    });

    if (candidates.length === 0) return null;

    // Score: specialisation match + fewer active jobs
    const scored = candidates.map((c: any) => {
      const specs = c.specialisations || [];
      const specMatch = specs.length === 0 || specs.some((s: string) => {
        const sl = s.toLowerCase().trim();
        return serviceName.includes(sl) || sl.includes(serviceName);
      });

      // Postcode proximity
      const cPrefix = (c.address_postcode || '').replace(/\s+/g, '').slice(0, 3).toUpperCase();
      const bPrefix = (booking.address_postcode || '').replace(/\s+/g, '').slice(0, 3).toUpperCase();
      const nearbyScore = cPrefix === bPrefix ? 0 : 10;

      const jobs = jobMap.get(c.id) || 0;
      const score = (specMatch ? 0 : 20) + nearbyScore + jobs * 3;
      return { cleaner: c, score, specMatch };
    });

    scored.sort((a, b) => a.score - b.score);
    return scored[0]?.cleaner || null;
  };

  const updateLeave = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('cleaner_leaves').update({ status }).eq('id', id);
      if (error) throw error;

      // Auto-reassign bookings if approved
      if (status === 'approved') {
        const leave = leaves.find((l: any) => l.id === id);
        if (leave) {
          const conflicts = getConflicts(leave);
          let reassigned = 0;
          let replacementId: string | null = null;

          for (const booking of conflicts) {
            const replacement = findBestReplacement(booking, leave.cleaner_id, leave.start_date, leave.end_date);
            if (replacement) {
              await supabase.from('bookings').update({
                cleaner_id: replacement.id, cleaner_name: replacement.name,
              }).eq('id', booking.id);

              // Notify customer
              await supabase.from('notifications').insert({
                user_id: booking.customer_id,
                title: 'Cleaner Replacement',
                message: `Your regular cleaner is on leave. ${replacement.name} will cover your booking on ${booking.date}.`,
                type: 'booking',
              });

              // Notify replacement cleaner
              if (replacement.user_id) {
                await supabase.from('notifications').insert({
                  user_id: replacement.user_id,
                  title: 'Cover Job Assigned',
                  message: `You've been assigned to cover a ${booking.service_name} job for ${booking.customer_name} on ${booking.date} at ${booking.time}.`,
                  type: 'booking',
                });
              }

              replacementId = replacement.id;
              reassigned++;
            }
          }

          if (replacementId) {
            await supabase.from('cleaner_leaves').update({ replacement_cleaner_id: replacementId }).eq('id', id);
          }

          if (reassigned > 0) {
            toast.success(`${reassigned} booking(s) auto-reassigned to best matching cleaners`);
          } else if (conflicts.length > 0) {
            toast.warning(`${conflicts.length} booking(s) need manual reassignment — no matching cleaners available`);
          }

          // Notify cleaner on leave
          if (leave.cleaners?.user_id) {
            await supabase.from('notifications').insert({
              user_id: leave.cleaners.user_id,
              title: 'Leave Approved ✅',
              message: `Your leave from ${leave.start_date} to ${leave.end_date} has been approved.${reassigned > 0 ? ` ${reassigned} job(s) have been reassigned.` : ''}`,
              type: 'system',
            });
          }
        }
      }

      // Notify cleaner if rejected
      if (status === 'rejected') {
        const leave = leaves.find((l: any) => l.id === id);
        if (leave?.cleaners?.user_id) {
          await supabase.from('notifications').insert({
            user_id: leave.cleaners.user_id,
            title: 'Leave Rejected ❌',
            message: `Your leave request from ${leave.start_date} to ${leave.end_date} has been rejected. Please contact admin for more information.`,
            type: 'system',
          });
        }
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['admin-leave-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-active-leaves'] });
      toast.success(`Leave ${status}!`);
    },
  });

  const pendingLeaves = leaves.filter((l: any) => l.status === 'pending');
  const otherLeaves = leaves.filter((l: any) => l.status !== 'pending');

  const getConflicts = (leave: any) => {
    return bookings.filter(b =>
      b.cleaner_id === leave.cleaner_id &&
      b.date >= leave.start_date &&
      b.date <= leave.end_date
    );
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600',
    approved: 'bg-primary/10 text-primary-ink',
    rejected: 'bg-destructive/10 text-destructive',
  };

  return (
    <AdminLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="mb-5">
          <h1 className="text-2xl font-display font-black text-foreground">Leave Requests</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage cleaner time off · auto-reassign on approval</p>
        </div>

        {/* Pending requests */}
        {pendingLeaves.length > 0 && (
          <section className="mb-6">
            <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Pending ({pendingLeaves.length})
            </h3>
            <div className="space-y-3">
              {pendingLeaves.map((leave: any) => {
                const conflicts = getConflicts(leave);
                return (
                  <motion.div key={leave.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl p-4 shadow-soft border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-sm shrink-0">
                        {(leave.cleaners?.name || 'C')[0]}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-foreground text-sm truncate">{leave.cleaners?.name || 'Unknown'}</h4>
                        <p className="text-[11px] text-muted-foreground">{leave.start_date} → {leave.end_date}</p>
                      </div>
                    </div>
                    {leave.reason && <p className="text-xs text-muted-foreground mb-2">{leave.reason}</p>}
                    
                    {conflicts.length > 0 && (
                      <div className="bg-amber-500/5 rounded-xl p-3 mb-3">
                        <p className="text-xs font-bold text-amber-600 mb-1">⚠️ {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}</p>
                        {conflicts.map(c => (
                          <div key={c.id} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <ArrowRight className="h-2.5 w-2.5 shrink-0" />
                            <span>{c.service_name} - {c.customer_name} - {c.date}</span>
                          </div>
                        ))}
                        <p className="text-[10px] text-primary font-medium mt-1.5 flex items-center gap-1">
                          <UserCheck className="h-3 w-3" /> Will auto-reassign to best available cleaner on approval
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button onClick={() => updateLeave.mutate({ id: leave.id, status: 'approved' })} size="sm"
                        disabled={updateLeave.isPending}
                        className="flex-1 rounded-xl text-xs font-bold h-9 bg-primary text-primary-foreground">
                        <Check className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button onClick={() => updateLeave.mutate({ id: leave.id, status: 'rejected' })} size="sm" variant="outline"
                        disabled={updateLeave.isPending}
                        className="flex-1 rounded-xl text-xs font-bold h-9 text-destructive border-destructive/20">
                        <X className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* History */}
        {leaves.length === 0 ? (
          <EmptyState icon={CalendarOff} title="No leave requests" description="Cleaners haven't requested any time off yet" />
        ) : otherLeaves.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-display font-bold text-foreground text-sm">History</h3>
            {otherLeaves.map((leave: any) => (
              <div key={leave.id} className="bg-card rounded-2xl p-4 shadow-soft border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-foreground text-sm">{leave.cleaners?.name || 'Unknown'}</span>
                  <Badge className={`text-[9px] rounded-lg font-medium border-0 capitalize ${statusColors[leave.status] || 'bg-muted text-muted-foreground'}`}>
                    {leave.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{leave.start_date} → {leave.end_date}</p>
                {leave.reason && <p className="text-[11px] text-muted-foreground mt-1">{leave.reason}</p>}
                {leave.replacement_cleaner_id && (
                  <p className="text-[10px] text-primary mt-1 flex items-center gap-1">
                    <UserCheck className="h-3 w-3" /> Replacement assigned
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
