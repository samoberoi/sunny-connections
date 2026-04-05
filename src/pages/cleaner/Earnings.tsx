import { useState, useMemo } from 'react';
import { TrendingUp, PoundSterling, Briefcase, Star, Clock, CalendarDays } from 'lucide-react';
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
      if (range === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
      }
      if (range === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return d >= monthAgo;
      }
      return true;
    });
  }, [allCompleted, range]);

  const totalEarnings = filteredBookings.reduce((s, b) => s + Number(b.total_cost), 0);
  const totalHours = filteredBookings.reduce((s, b) => s + b.duration, 0);
  const avgRating = filteredBookings.filter(b => b.rating).length > 0
    ? (filteredBookings.filter(b => b.rating).reduce((s, b) => s + (b.rating || 0), 0) / filteredBookings.filter(b => b.rating).length).toFixed(1)
    : '—';

  const dayMap: Record<string, number> = {};
  filteredBookings.forEach(b => {
    const day = new Date(b.date).toLocaleDateString('en-GB', { weekday: 'short' });
    dayMap[day] = (dayMap[day] || 0) + Number(b.total_cost);
  });
  const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => ({
    day: d, amount: dayMap[d] || 0,
  }));
  const max = Math.max(...weeklyData.map(d => d.amount), 1);

  const ranges: { key: DateRange; label: string }[] = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' },
  ];

  return (
    <CleanerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <BackButton to="/cleaner" />
            <h1 className="text-xl font-display font-black text-foreground">Earnings</h1>
          </div>

          {/* Date range filter */}
          <div className="flex gap-2 mb-5">
            {ranges.map(r => (
              <motion.button
                key={r.key}
                whileTap={{ scale: 0.97 }}
                onClick={() => setRange(r.key)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                  range === r.key ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                {r.label}
              </motion.button>
            ))}
          </div>

          <div className="bg-foreground rounded-2xl p-8 text-center mb-6">
            <PoundSterling className="h-6 w-6 text-primary-foreground/40 mx-auto mb-2" strokeWidth={1.5} />
            <div className="text-4xl font-display font-black text-primary-foreground">£{totalEarnings}</div>
            <p className="text-sm text-primary-foreground/40 mt-1 font-medium">
              {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'Total'} Earnings
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: Briefcase, value: filteredBookings.length, label: 'Jobs' },
              { icon: Clock, value: totalHours, label: 'Hours' },
              { icon: Star, value: avgRating, label: 'Rating' },
            ].map(stat => (
              <div key={stat.label} className="border border-border rounded-2xl p-3 text-center">
                <stat.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />
                <div className="text-lg font-display font-black text-foreground">{stat.value}</div>
                <div className="text-[10px] font-medium text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="border border-border rounded-2xl p-5 mb-6">
            <h3 className="font-display font-semibold text-foreground mb-5 text-sm">Weekly Breakdown</h3>
            <div className="flex items-end gap-2 h-40">
              {weeklyData.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground">£{d.amount}</span>
                  <div className="w-full rounded-lg bg-primary" style={{ height: `${max > 0 ? (d.amount / max) * 100 : 0}%`, minHeight: '4px' }} />
                  <span className="text-[10px] font-medium text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent jobs list */}
          {filteredBookings.length > 0 && (
            <div className="border border-border rounded-2xl p-5">
              <h3 className="font-display font-semibold text-foreground mb-3 text-sm">Recent Jobs</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filteredBookings.slice(0, 20).map(b => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{b.service_name}</p>
                      <p className="text-xs text-muted-foreground">{b.date} · {b.customer_name}</p>
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
