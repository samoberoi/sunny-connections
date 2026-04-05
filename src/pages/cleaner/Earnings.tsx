import { useState, useMemo } from 'react';
import { PoundSterling, Briefcase, Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
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
      const { data } = await supabase.from('bookings').select('*').eq('cleaner_id', cleanerRecord.id).eq('status', 'completed').order('date', { ascending: false });
      return data || [];
    },
    enabled: !!cleanerRecord?.id,
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

  const dayMap: Record<string, number> = {};
  filteredBookings.forEach(b => {
    const day = new Date(b.date).toLocaleDateString('en-GB', { weekday: 'short' });
    dayMap[day] = (dayMap[day] || 0) + Number(b.total_cost);
  });
  const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => ({ day: d, amount: dayMap[d] || 0 }));
  const max = Math.max(...weeklyData.map(d => d.amount), 1);

  const ranges: { key: DateRange; label: string }[] = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'all', label: 'All' },
  ];

  return (
    <CleanerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6 space-y-5">
          <div className="flex items-center gap-3">
            <BackButton to="/cleaner" />
            <h1 className="text-lg font-display font-black text-foreground">Earnings</h1>
          </div>

          {/* Range toggle */}
          <div className="flex bg-muted/50 rounded-xl p-1">
            {ranges.map(r => (
              <motion.button
                key={r.key}
                whileTap={{ scale: 0.97 }}
                onClick={() => setRange(r.key)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  range === r.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                }`}
              >
                {r.label}
              </motion.button>
            ))}
          </div>

          {/* Total */}
          <div className="bg-foreground rounded-2xl p-6 text-center">
            <PoundSterling className="h-5 w-5 text-background/30 mx-auto mb-1" strokeWidth={1.5} />
            <div className="text-3xl font-display font-black text-background">£{totalEarnings}</div>
            <p className="text-xs text-background/40 mt-0.5 font-medium">
              {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'Total'}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Briefcase, value: filteredBookings.length, label: 'Jobs' },
              { icon: Clock, value: totalHours, label: 'Hours' },
              { icon: Star, value: avgRating, label: 'Rating' },
            ].map(stat => (
              <div key={stat.label} className="bg-muted/30 rounded-2xl p-3 text-center">
                <stat.icon className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />
                <div className="text-lg font-display font-black text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-muted/30 rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Weekly</h3>
            <div className="flex items-end gap-2 h-32">
              {weeklyData.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-medium text-muted-foreground">£{d.amount}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${max > 0 ? (d.amount / max) * 100 : 0}%` }}
                    className="w-full rounded-lg bg-primary"
                    style={{ minHeight: '3px' }}
                  />
                  <span className="text-[9px] font-medium text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent */}
          {filteredBookings.length > 0 && (
            <div className="bg-muted/30 rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent</h3>
              <div className="space-y-2.5 max-h-56 overflow-y-auto scrollbar-hide">
                {filteredBookings.slice(0, 20).map(b => (
                  <div key={b.id} className="flex items-center justify-between py-1.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{b.service_name}</p>
                      <p className="text-[11px] text-muted-foreground">{b.date} · {b.customer_name}</p>
                    </div>
                    <span className="font-display font-black text-primary text-sm">£{b.total_cost}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </CleanerLayout>
  );
}
