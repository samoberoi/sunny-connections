import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Clock, Check, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CleanerLayout from '@/components/layout/CleanerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function CleanerSchedule() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const { data: cleanerRecord } = useQuery({
    queryKey: ['my-cleaner-record', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('cleaners').select('*').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: leaves = [] } = useQuery({
    queryKey: ['my-leaves', cleanerRecord?.id],
    queryFn: async () => {
      if (!cleanerRecord?.id) return [];
      const { data } = await supabase.from('cleaner_leaves').select('*').eq('cleaner_id', cleanerRecord.id).order('start_date', { ascending: false });
      return data || [];
    },
    enabled: !!cleanerRecord?.id,
  });




  const requestLeave = useMutation({
    mutationFn: async () => {
      if (!cleanerRecord?.id) return;
      const { error } = await supabase.from('cleaner_leaves').insert({
        cleaner_id: cleanerRecord.id,
        start_date: startDate,
        end_date: endDate,
        reason: reason || null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      setDialogOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      toast.success('Leave request submitted!');

      // Notify admins
      try {
        const { data: adminRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'admin');
        if (adminRoles?.length) {
          const adminNotifs = adminRoles.map(r => ({
            user_id: r.user_id,
            title: 'New Leave Request',
            message: `${cleanerRecord?.name || 'A cleaner'} has requested leave from ${startDate} to ${endDate}.`,
            type: 'system' as const,
          }));
          await supabase.from('notifications').insert(adminNotifs);
        }

        // Notify affected customers
        if (cleanerRecord?.id) {
          const { data: affected } = await supabase.from('bookings').select('customer_id, customer_name, date, service_name')
            .eq('cleaner_id', cleanerRecord.id).in('status', ['assigned', 'en-route'])
            .gte('date', startDate).lte('date', endDate);
          if (affected?.length) {
            const custNotifs = affected.map(b => ({
              user_id: b.customer_id,
              title: 'Cleaner Leave Notice',
              message: `Your cleaner has requested leave on ${b.date}. We'll assign a replacement if approved.`,
              type: 'booking' as const,
            }));
            await supabase.from('notifications').insert(custNotifs);
          }
        }
      } catch { /* notifications are best-effort */ }
    },
    onError: () => toast.error('Failed to submit leave request'),
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600',
    approved: 'bg-primary/10 text-primary-ink',
    rejected: 'bg-destructive/10 text-destructive',
  };

  return (
    <CleanerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-28 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-display font-black text-foreground">My Leave</h1>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <button className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center shadow-soft">
                  <Plus className="h-4 w-4 text-background" strokeWidth={1.5} />
                </button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl">
                <DialogHeader><DialogTitle className="font-display font-bold">Request Leave</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Start Date</label>
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-12 rounded-2xl mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">End Date</label>
                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-12 rounded-2xl mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reason</label>
                    <Textarea placeholder="Optional reason..." value={reason} onChange={e => setReason(e.target.value)} rows={2} className="rounded-2xl mt-1 resize-none" />
                  </div>
                  <Button onClick={() => requestLeave.mutate()} disabled={!startDate || !endDate || requestLeave.isPending}
                    className="w-full rounded-full font-bold bg-foreground text-background h-12 disabled:opacity-40">
                    Submit Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Upcoming jobs */}
          <section>
            <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" strokeWidth={1.5} /> Upcoming Jobs
            </h3>
            {upcomingJobs.length === 0 ? (
              <div className="bg-card rounded-3xl p-6 text-center shadow-soft border border-border">
                <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">No upcoming jobs</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingJobs.map(job => (
                  <div key={job.id} className="bg-card rounded-2xl p-4 shadow-soft border border-border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{job.service_name}</p>
                      <p className="text-[11px] text-muted-foreground">{job.date} at {job.time}</p>
                    </div>
                    <span className="text-sm font-display font-black text-foreground">£{job.total_cost}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Leave History */}
          <section>
            <h3 className="font-display font-bold text-foreground text-sm mb-3">Leave History</h3>
            {leaves.length === 0 ? (
              <div className="bg-card rounded-3xl p-6 text-center shadow-soft border border-border">
                <p className="text-xs text-muted-foreground">No leave requests yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaves.map(leave => (
                  <div key={leave.id} className="bg-card rounded-2xl p-4 shadow-soft border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-foreground">{leave.start_date} → {leave.end_date}</span>
                      <Badge className={`text-[9px] rounded-lg font-medium border-0 capitalize ${statusColors[leave.status] || 'bg-muted text-muted-foreground'}`}>
                        {leave.status}
                      </Badge>
                    </div>
                    {leave.reason && <p className="text-xs text-muted-foreground">{leave.reason}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </PageTransition>
    </CleanerLayout>
  );
}
