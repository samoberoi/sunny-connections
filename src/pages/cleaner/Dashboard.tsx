import { useEffect, useMemo } from 'react';
import { PoundSterling, CalendarDays, Clock, Zap, Briefcase, ChevronRight, ToggleLeft, ToggleRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import CleanerLayout from '@/components/layout/CleanerLayout';
import PageTransition from '@/components/PageTransition';
import SimulatedMap, { generateClientMarkers } from '@/components/SimulatedMap';
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
    const channel = supabase.channel('cleaner-dash-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        queryClient.invalidateQueries({ queryKey: ['cleaner-my-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['cleaner-pending-jobs'] });
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const toggleAvailability = useMutation({
    mutationFn: async () => {
      if (!cleanerRecord) return;
      await supabase.from('cleaners').update({ available: !cleanerRecord.available }).eq('id', cleanerRecord.id);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-cleaner-record'] }); toast.success(cleanerRecord?.available ? 'You\'re offline' : 'You\'re online!'); },
  });

  const activeJobs = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const upcomingJobs = bookings.filter(b => ['assigned', 'en-route'].includes(b.status));
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEarnings = bookings.filter(b => b.status === 'completed' && new Date(b.date) >= weekStart).reduce((s, b) => s + Number(b.total_cost), 0);
  const isOnline = cleanerRecord?.available;

  const mapMarkers = useMemo(() => {
    return generateClientMarkers(Math.min(pendingJobs.length || 3, 5));
  }, [pendingJobs]);

  return (
    <CleanerLayout>
      <PageTransition>
        <div className="relative min-h-screen">
          {/* Fixed map background */}
          <div className="sticky top-0 z-0">
            <SimulatedMap markers={mapMarkers} height={420} className="">
              <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-transparent to-background pointer-events-none" />
            </SimulatedMap>

            {/* Header on map */}
            <div className="absolute top-0 left-0 right-0 px-5 pt-14 z-20">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-display font-black text-white leading-none">{user?.name || 'Cleaner'}</h1>
                  <p className="text-[11px] text-white/50 font-medium mt-1">Dashboard</p>
                </div>
                <motion.button whileTap={{ scale: 0.93 }} onClick={() => toggleAvailability.mutate()}
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all shadow-md ${isOnline ? 'bg-primary text-primary-foreground' : 'bg-white/20 backdrop-blur-md text-white/70'}`}>
                  {isOnline ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  {isOnline ? 'Online' : 'Offline'}
                </motion.button>
              </div>
            </div>

            {/* Bottom badges on map */}
            <div className="absolute bottom-6 left-5 right-5 z-20 flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 shadow-sm border border-border">
                <MapPin className="h-3.5 w-3.5 text-primary-ink" strokeWidth={2} />
                <span className="text-[11px] font-bold text-foreground/70">{pendingJobs.length} requests nearby</span>
              </div>
              <div className="bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 shadow-sm border border-border">
                <span className="text-[11px] font-bold text-primary-ink">£{weekEarnings} earned</span>
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="relative z-10 bg-background rounded-t-[2rem] -mt-8 px-5 pt-6 pb-4 space-y-5 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Briefcase, label: 'Active', value: activeJobs.length },
                { icon: Clock, label: 'Done', value: completedCount },
                { icon: PoundSterling, label: 'Pending', value: pendingJobs.length },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-3xl p-4 text-center shadow-soft border border-border">
                  <stat.icon className="h-4 w-4 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
                  <div className="text-2xl font-display font-black text-foreground">{stat.value}</div>
                  <div className="text-[9px] text-muted-foreground font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Upcoming */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-foreground text-sm">Upcoming Jobs</h3>
                {upcomingJobs.length > 0 && <button onClick={() => navigate('/cleaner/jobs')} className="text-[11px] font-bold text-primary-ink">View all →</button>}
              </div>
              {upcomingJobs.length === 0 ? (
                <div className="bg-card rounded-3xl p-6 text-center shadow-soft border border-border">
                  <CalendarDays className="h-5 w-5 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-xs text-muted-foreground">No upcoming jobs</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingJobs.slice(0, 3).map(b => (
                    <motion.div key={b.id} whileTap={{ scale: 0.98 }} onClick={() => navigate('/cleaner/jobs')}
                      className="flex items-center gap-3 bg-card rounded-3xl p-4 cursor-pointer border border-border shadow-soft">
                      <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                        <CalendarDays className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{b.service_name}</p>
                        <p className="text-[11px] text-muted-foreground">{b.customer_name} · {b.date}</p>
                      </div>
                      <span className="text-sm font-display font-black text-foreground">£{b.total_cost}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* New Requests */}
            {pendingJobs.length > 0 && (
              <section className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-foreground text-sm">New Requests</h3>
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                  <button onClick={() => navigate('/cleaner/jobs')} className="text-[11px] font-bold text-primary-ink">View all →</button>
                </div>
                <div className="space-y-2.5">
                  {pendingJobs.slice(0, 3).map(b => {
                    const isExpress = b.service_name?.toLowerCase().includes('express');
                    return (
                      <motion.div key={b.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/cleaner/jobs')} className="bg-foreground rounded-3xl p-5 cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-background text-sm">{b.service_name}</h4>
                            {isExpress && <Badge className="bg-primary text-primary-foreground text-[9px] rounded-full font-bold border-0"><Zap className="h-2.5 w-2.5 mr-0.5" /> Express</Badge>}
                          </div>
                          <span className="text-lg font-display font-black text-primary">£{b.total_cost}</span>
                        </div>
                        <p className="text-[11px] text-background/40">{b.customer_name} · {b.address_postcode} · {b.duration}h</p>
                        <div className="flex items-center justify-end text-[11px] text-primary font-bold mt-2">View & Accept <ChevronRight className="h-3 w-3 ml-0.5" /></div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </PageTransition>
    </CleanerLayout>
  );
}
