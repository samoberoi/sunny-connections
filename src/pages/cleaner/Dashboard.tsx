import { useEffect } from 'react';
import { PoundSterling, CalendarDays, Clock, Zap, Briefcase, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import CleanerLayout from '@/components/layout/CleanerLayout';
import PageTransition from '@/components/PageTransition';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function CleanerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cleanerRecord } = useQuery({
    queryKey: ['my-cleaner-record', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('cleaners').select('*').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['cleaner-my-bookings', cleanerRecord?.id],
    queryFn: async () => {
      if (!cleanerRecord?.id) return [];
      const { data } = await supabase.from('bookings').select('*').eq('cleaner_id', cleanerRecord.id).order('date', { ascending: true });
      return data || [];
    },
    enabled: !!cleanerRecord?.id,
  });

  const { data: pendingJobs = [] } = useQuery({
    queryKey: ['cleaner-pending-jobs'],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('*').is('cleaner_id', null).eq('status', 'pending').order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!cleanerRecord,
  });

  useEffect(() => {
    const channel = supabase
      .channel('cleaner-dash-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        queryClient.invalidateQueries({ queryKey: ['cleaner-my-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['cleaner-pending-jobs'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const toggleAvailability = useMutation({
    mutationFn: async () => {
      if (!cleanerRecord) return;
      await supabase.from('cleaners').update({ available: !cleanerRecord.available }).eq('id', cleanerRecord.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-cleaner-record'] });
      toast.success(cleanerRecord?.available ? 'You\'re offline' : 'You\'re online!');
    },
  });

  const activeJobs = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const upcomingJobs = bookings.filter(b => ['assigned', 'en-route'].includes(b.status));
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const weekEarnings = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + Number(b.total_cost), 0);

  const isOnline = cleanerRecord?.available;

  return (
    <CleanerLayout>
      <PageTransition>
        <div className="px-5 pt-8 pb-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest">Dashboard</p>
              <h1 className="text-2xl font-display font-black text-foreground tracking-tight">{user?.name || 'Cleaner'}</h1>
            </div>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => toggleAvailability.mutate()}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                isOnline
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {isOnline ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              {isOnline ? 'Online' : 'Offline'}
            </motion.button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Briefcase, label: 'Active', value: activeJobs.length },
              { icon: PoundSterling, label: 'Earned', value: `£${weekEarnings}` },
              { icon: Clock, label: 'Done', value: completedCount },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-muted/50 rounded-2xl p-4 text-center"
              >
                <stat.icon className="h-4 w-4 text-muted-foreground mx-auto mb-1.5" strokeWidth={1.5} />
                <div className="text-xl font-display font-black text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Upcoming Jobs */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Upcoming Jobs</h3>
              {upcomingJobs.length > 0 && (
                <button onClick={() => navigate('/cleaner/jobs')} className="text-[11px] font-medium text-primary">
                  View all
                </button>
              )}
            </div>
            {upcomingJobs.length === 0 ? (
              <div className="bg-muted/30 rounded-2xl p-6 text-center">
                <CalendarDays className="h-5 w-5 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">No upcoming jobs</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingJobs.slice(0, 3).map(b => (
                  <motion.div
                    key={b.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/cleaner/jobs')}
                    className="flex items-center gap-3 bg-muted/30 rounded-2xl p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <CalendarDays className="h-4 w-4 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{b.service_name}</p>
                      <p className="text-[11px] text-muted-foreground">{b.customer_name} · {b.date} at {b.time}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge className="bg-primary/10 text-primary text-[9px] rounded-lg font-medium border-0 capitalize mb-0.5">
                        {b.status.replace('-', ' ')}
                      </Badge>
                      <p className="text-xs font-bold text-foreground">£{b.total_cost}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* New Requests */}
          {pendingJobs.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">New Requests</h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </div>
                <button onClick={() => navigate('/cleaner/jobs')} className="text-[11px] font-medium text-primary">
                  View all
                </button>
              </div>
              <div className="space-y-2">
                {pendingJobs.slice(0, 3).map(b => {
                  const isExpress = b.service_name?.toLowerCase().includes('express');
                  return (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/cleaner/jobs')}
                      className="border border-primary/15 bg-primary/[0.03] rounded-2xl p-4 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground text-sm">{b.service_name}</h4>
                          {isExpress && (
                            <Badge className="bg-amber-500/10 text-amber-600 text-[9px] rounded-lg font-semibold border-0">
                              <Zap className="h-2.5 w-2.5 mr-0.5" /> Express
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm font-display font-black text-primary">£{b.total_cost}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-2">{b.customer_name} · {b.address_postcode} · {b.duration}h</p>
                      <div className="flex items-center justify-end text-[11px] text-primary font-medium">
                        View & Accept <ChevronRight className="h-3 w-3 ml-0.5" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </PageTransition>
    </CleanerLayout>
  );
}
