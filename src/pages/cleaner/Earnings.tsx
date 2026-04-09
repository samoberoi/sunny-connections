import { useState, useMemo } from 'react';
import { PoundSterling, Briefcase, Star, Clock, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import CleanerLayout from '@/components/layout/CleanerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

type DateRange = 'week' | 'month' | 'all';

export default function CleanerEarnings() {
  const { user } = useAuth();
  const [range, setRange] = useState<DateRange>('month');

  const { data: cleanerRecord } = useQuery({
    queryKey: ['my-cleaner-record', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('cleaners').select('*').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: allCompleted = [] } = useQuery({
    queryKey: ['cleaner-completed', cleanerRecord?.id],
    queryFn: async () => {
      if (!cleanerRecord?.id) return [];
      const { data } = await supabase.from('bookings').select('*').eq('cleaner_id', cleanerRecord.id).eq('status', 'completed').order('date', { ascending: false }).limit(5000);
      return data || [];
    },
    enabled: !!cleanerRecord?.id,
  });

  const { data: photos = [] } = useQuery({
    queryKey: ['cleaner-job-photos', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('job_photos').select('*').eq('uploaded_by', user.id).order('uploaded_at', { ascending: false }).limit(50);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const filteredBookings = useMemo(() => {
    const now = new Date();
    return allCompleted.filter(b => {
      if (range === 'all') return true;
      const d = new Date(b.date);
      if (range === 'week') { const w = new Date(now); w.setDate(w.getDate() - 7); return d >= w; }
      if (range === 'month') { const m = new Date(now); m.setMonth(m.getMonth() - 1); return d >= m; }
      return true;
    });
  }, [allCompleted, range]);

  const totalEarnings = filteredBookings.reduce((s, b) => s + Number(b.total_cost), 0);
  const totalHours = filteredBookings.reduce((s, b) => s + b.duration, 0);
  const rated = filteredBookings.filter(b => b.rating);
  const avgRating = rated.length > 0 ? (rated.reduce((s, b) => s + (b.rating || 0), 0) / rated.length).toFixed(1) : '—';

  // Projected monthly earnings
  const projectedMonthly = useMemo(() => {
    if (range !== 'month' || filteredBookings.length === 0) return null;
    const now = new Date();
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Math.round((totalEarnings / dayOfMonth) * daysInMonth);
  }, [filteredBookings, totalEarnings, range]);

  const dayMap: Record<string, number> = {};
  filteredBookings.forEach(b => { const day = new Date(b.date).toLocaleDateString('en-GB', { weekday: 'short' }); dayMap[day] = (dayMap[day] || 0) + Number(b.total_cost); });
  const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => ({ day: d, amount: dayMap[d] || 0 }));
  const max = Math.max(...weeklyData.map(d => d.amount), 1);

  const ranges: { key: DateRange; label: string }[] = [{ key: 'week', label: 'Week' }, { key: 'month', label: 'Month' }, { key: 'all', label: 'All' }];

  const photoMap: Record<string, any[]> = {};
  photos.forEach((p: any) => { if (!photoMap[p.booking_id]) photoMap[p.booking_id] = []; photoMap[p.booking_id].push(p); });

  return (
    <CleanerLayout>
      <PageTransition>
        <div className="px-5 pt-14 pb-6 space-y-5">
          <div className="flex items-center gap-3">
            <BackButton to="/cleaner" />
            <h1 className="text-2xl font-display font-black text-foreground">Earnings</h1>
          </div>

          {/* Range toggle */}
          <div className="flex bg-foreground rounded-full p-1">
            {ranges.map(r => (
              <motion.button key={r.key} whileTap={{ scale: 0.97 }} onClick={() => setRange(r.key)}
                className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all ${range === r.key ? 'bg-primary text-primary-foreground' : 'text-background/40'}`}>
                {r.label}
              </motion.button>
            ))}
          </div>

          {/* Balance */}
          <div className="bg-foreground rounded-3xl p-6 text-center">
            <p className="text-[10px] text-background/40 font-bold uppercase tracking-wider mb-1">
              {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'Total'}
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-display font-black text-primary">£{totalEarnings}</span>
              <span className="text-sm text-background/30">.00</span>
            </div>
            {projectedMonthly && (
              <p className="text-[10px] text-background/40 mt-1">Projected: £{projectedMonthly} this month</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Briefcase, value: filteredBookings.length, label: 'Jobs' },
              { icon: Clock, value: totalHours, label: 'Hours' },
              { icon: Star, value: avgRating, label: 'Rating' },
            ].map(stat => (
              <div key={stat.label} className="bg-card rounded-3xl p-4 text-center shadow-soft border border-border">
                <stat.icon className="h-4 w-4 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
                <div className="text-xl font-display font-black text-foreground">{stat.value}</div>
                <div className="text-[9px] text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-foreground rounded-3xl p-5">
            <h3 className="text-xs font-bold text-background/40 uppercase tracking-wider mb-4">Weekly</h3>
            <div className="flex items-end gap-2 h-36">
              {weeklyData.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-bold text-background/40">£{d.amount}</span>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${max > 0 ? (d.amount / max) * 100 : 0}%` }}
                    className="w-full rounded-xl bg-primary" style={{ minHeight: '4px' }} />
                  <span className="text-[9px] font-bold text-background/40">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Job-by-job breakdown */}
          {filteredBookings.length > 0 && (
            <div className="bg-card rounded-3xl p-5 shadow-soft border border-border">
              <h3 className="font-display font-bold text-foreground text-sm mb-3">Job Breakdown</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
                {filteredBookings.slice(0, 30).map(b => {
                  const jobPhotos = photoMap[b.id] || [];
                  return (
                    <div key={b.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-foreground">{b.service_name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {format(new Date(b.date), 'dd MMM yyyy')} · {b.duration}h · {b.address_postcode}
                          </p>
                        </div>
                        <span className="font-display font-black text-foreground">£{b.total_cost}</span>
                      </div>
                      {b.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-primary" fill="currentColor" />
                          <span className="text-xs font-bold">{b.rating}/5</span>
                          {b.review && <span className="text-[10px] text-muted-foreground ml-1">"{b.review}"</span>}
                        </div>
                      )}
                      {jobPhotos.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {jobPhotos.map((p: any) => (
                            <div key={p.id} className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted">
                              <Camera className="h-4 w-4 text-muted-foreground absolute inset-0 m-auto" />
                              <span className="absolute bottom-0 left-0 right-0 bg-foreground/80 text-background text-[7px] text-center font-bold">
                                {p.photo_type}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </CleanerLayout>
  );
}
