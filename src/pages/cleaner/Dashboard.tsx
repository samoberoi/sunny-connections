import { useEffect, useMemo, useRef } from 'react';
import { playNotificationSound } from '@/lib/notificationSound';
import { PoundSterling, CalendarDays, Clock, Zap, Briefcase, ChevronRight, ToggleLeft, ToggleRight, MapPin, TrendingUp, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import CleanerLayout from '@/components/layout/CleanerLayout';
import PageTransition from '@/components/PageTransition';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getTodayDateOnly, parseDateOnly } from '@/lib/date';

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
  const upcomingJobsRaw = bookings.filter(b => ['assigned', 'en-route'].includes(b.status));
  const upcomingJobs = useMemo(() => {
    const grouped = new Map<string, any[]>();
    upcomingJobsRaw.forEach(b => {
      if (b.recurring && b.recurring !== 'none') {
        const key = `${b.customer_id}|${b.service_name}|${b.recurring}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(b);
      } else {
        grouped.set(b.id, [b]);
      }
    });
    const result: any[] = [];
    grouped.forEach(items => {
      const sorted = items.sort((a: any, b: any) => a.date.localeCompare(b.date));
      result.push({ ...sorted[0], _recurringCount: items.length, _lastDate: sorted[sorted.length - 1].date });
    });
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [upcomingJobsRaw]);
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEarnings = bookings.filter(b => {
    const parsed = parseDateOnly(b.date);
    return b.status === 'completed' && !!parsed && parsed >= weekStart;
  }).reduce((s, b) => s + Number(b.total_cost), 0);
  const totalEarnings = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + Number(b.total_cost), 0);
  const isOnline = cleanerRecord?.available;

  // Daily reminder
  const reminderShown = useRef(false);
  useEffect(() => {
    if (reminderShown.current || !bookings.length) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getTodayDateOnly.call ? '' : '';
    const tomorrowJobs = bookings.filter(b => b.date === tomorrowStr && ['assigned', 'en-route'].includes(b.status));
    const todayStr = new Date().toISOString().split('T')[0];
    const todayJobs = bookings.filter(b => b.date === todayStr && ['assigned', 'en-route', 'otp-verified', 'in-progress'].includes(b.status));

    if (tomorrowJobs.length > 0) {
      reminderShown.current = true;
      setTimeout(() => {
        playNotificationSound();
        toast.info(`📋 You have ${tomorrowJobs.length} job${tomorrowJobs.length > 1 ? 's' : ''} scheduled for tomorrow!`, {
          duration: 6000,
          description: tomorrowJobs.map(j => `${j.service_name} at ${j.time}`).join(' · '),
        });
      }, 1500);
    } else if (todayJobs.length > 0) {
      reminderShown.current = true;
      setTimeout(() => {
        playNotificationSound();
        toast.info(`🔔 You have ${todayJobs.length} job${todayJobs.length > 1 ? 's' : ''} today!`, {
          duration: 6000,
          description: todayJobs.map(j => `${j.service_name} at ${j.time}`).join(' · '),
        });
      }, 1500);
    }
  }, [bookings]);

  // 15-minute pre-job reminder — checks every 30 seconds
  const notifiedJobIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!bookings.length) return;

    const checkUpcoming = () => {
      const now = new Date();
      bookings
        .filter(b => ['assigned', 'en-route'].includes(b.status) && b.date && b.time)
        .forEach(async (b) => {
          if (notifiedJobIds.current.has(b.id)) return;
          const [h, m] = b.time.split(':').map(Number);
          const scheduled = new Date(b.date);
          scheduled.setHours(h, m, 0, 0);
          const diffMs = scheduled.getTime() - now.getTime();
          // Fire when between 0 and 15 minutes away
          if (diffMs > 0 && diffMs <= 15 * 60 * 1000) {
            notifiedJobIds.current.add(b.id);
            const mins = Math.ceil(diffMs / 60000);
            playNotificationSound();
            toast.warning(`⏰ Job starting in ${mins} min!`, {
              duration: 10000,
              description: `${b.service_name} at ${b.time} — ${b.address_line1}`,
            });
            // Persist to notifications table
            if (user?.id) {
              await supabase.from('notifications').insert({
                user_id: user.id,
                title: `Job in ${mins} minutes`,
                message: `${b.service_name} at ${b.time} — ${b.address_line1}. Time to head out!`,
                type: 'booking' as const,
              });
            }
          }
        });
    };

    checkUpcoming();
    const interval = setInterval(checkUpcoming, 30000);
    return () => clearInterval(interval);
  }, [bookings, user?.id]);

  const filteredPending = useMemo(() => {
    const specs = cleanerRecord?.specialisations || [];
    const specFiltered = specs.length
      ? pendingJobs.filter(b => {
          const sLower = (b.service_name || '').toLowerCase().trim();
          return specs.some((spec: string) => {
            const specLower = spec.toLowerCase().trim();
            return sLower === specLower || sLower.includes(specLower) || specLower.includes(sLower);
          });
        })
      : pendingJobs;

    // Group recurring bookings into single cards
    const grouped = new Map<string, any[]>();
    specFiltered.forEach(b => {
      if (b.recurring && b.recurring !== 'none') {
        const key = `${b.customer_id}|${b.service_name}|${b.recurring}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(b);
      } else {
        grouped.set(b.id, [b]);
      }
    });
    const result: any[] = [];
    grouped.forEach(items => {
      const sorted = items.sort((a: any, b: any) => a.date.localeCompare(b.date));
      result.push({ ...sorted[0], _recurringCount: items.length });
    });
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [pendingJobs, cleanerRecord?.specialisations]);

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } };

  return (
    <CleanerLayout>
      <PageTransition>
        <motion.div variants={stagger} initial="hidden" animate="show" className="px-5 pt-14 pb-6 space-y-5">
          {/* Header */}
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-black text-foreground leading-tight">
                Hello, {cleanerRecord?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Cleaner'}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isOnline ? '🟢 You\'re online and visible to customers' : '⚫ You\'re currently offline'}
              </p>
            </div>
            <motion.button whileTap={{ scale: 0.93 }} onClick={() => toggleAvailability.mutate()}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all shadow-sm ${isOnline ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {isOnline ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              {isOnline ? 'Online' : 'Offline'}
            </motion.button>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
            <div className="bg-foreground rounded-3xl p-5">
              <PoundSterling className="h-4 w-4 text-primary mb-2" strokeWidth={1.5} />
              <div className="text-2xl font-display font-black text-background">£{weekEarnings}</div>
              <div className="text-[10px] text-background/50 font-medium">This week</div>
            </div>
            <div className="bg-card rounded-3xl p-5 shadow-soft border border-border">
              <TrendingUp className="h-4 w-4 text-primary mb-2" strokeWidth={1.5} />
              <div className="text-2xl font-display font-black text-foreground">£{totalEarnings}</div>
              <div className="text-[10px] text-muted-foreground font-medium">Total earned</div>
            </div>
          </motion.div>

          {/* Quick Stats Row */}
          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
            {[
              { icon: Briefcase, label: 'Active', value: activeJobs.length, color: 'bg-primary/10' },
              { icon: Clock, label: 'Completed', value: completedCount, color: 'bg-muted/50' },
              { icon: MapPin, label: 'Pending', value: filteredPending.length, color: 'bg-primary/10' },
            ].map((stat, i) => (
              <div key={stat.label} className={`${stat.color} rounded-2xl p-3.5 text-center border border-border`}>
                <stat.icon className="h-4 w-4 text-muted-foreground mx-auto mb-1.5" strokeWidth={1.5} />
                <div className="text-xl font-display font-black text-foreground">{stat.value}</div>
                <div className="text-[9px] text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Rating */}
          {cleanerRecord && Number(cleanerRecord.rating) > 0 && (
            <motion.div variants={fadeUp} className="bg-card rounded-2xl p-4 shadow-soft border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{cleanerRecord.rating} / 5</p>
                <p className="text-[10px] text-muted-foreground">{cleanerRecord.review_count} reviews from customers</p>
              </div>
            </motion.div>
          )}

          {/* Upcoming Jobs */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-foreground text-sm">Upcoming Jobs</h3>
              {upcomingJobs.length > 0 && <button onClick={() => navigate('/cleaner/jobs')} className="text-[11px] font-bold text-primary">View all →</button>}
            </div>
            {upcomingJobs.length === 0 ? (
              <div className="bg-card rounded-2xl p-6 text-center shadow-soft border border-border">
                <CalendarDays className="h-5 w-5 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">No upcoming jobs</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingJobs.slice(0, 3).map(b => (
                  <motion.div key={b.id} whileTap={{ scale: 0.98 }} onClick={() => navigate('/cleaner/jobs')}
                    className="flex items-center gap-3 bg-card rounded-2xl p-4 cursor-pointer border border-border shadow-soft">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <CalendarDays className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{b.service_name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {b.customer_name} · {b._recurringCount > 1
                          ? `${b.date} → ${b._lastDate} · ${b.recurring} (${b._recurringCount} sessions)`
                          : `${b.date} at ${b.time}`}
                      </p>
                    </div>
                    <span className="text-sm font-display font-black text-primary">£{b.total_cost}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* New Requests */}
          {filteredPending.length > 0 && (
            <motion.div variants={fadeUp} className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-foreground text-sm">New Requests</h3>
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
                <button onClick={() => navigate('/cleaner/jobs')} className="text-[11px] font-bold text-primary">View all →</button>
              </div>
              <div className="space-y-2.5">
                {filteredPending.slice(0, 3).map(b => {
                  const isExpress = b.service_name?.toLowerCase().includes('express');
                  return (
                    <motion.div key={b.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/cleaner/jobs')} className="bg-foreground rounded-2xl p-5 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-background text-sm">{b.service_name}</h4>
                          {isExpress && <Badge className="bg-primary text-primary-foreground text-[9px] rounded-full font-bold border-0"><Zap className="h-2.5 w-2.5 mr-0.5" /> Express</Badge>}
                        </div>
                        <span className="text-lg font-display font-black text-primary">£{b.total_cost}</span>
                      </div>
                      <p className="text-[11px] text-background/60">
                        {b.customer_name} · {b.address_postcode} · {b.duration}h
                        {b._recurringCount > 1 && ` · ${b.recurring} (${b._recurringCount} sessions)`}
                      </p>
                      <div className="flex items-center justify-end text-[11px] text-primary font-bold mt-2">View & Accept <ChevronRight className="h-3 w-3 ml-0.5" /></div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      </PageTransition>
    </CleanerLayout>
  );
}
