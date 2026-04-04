import { TrendingUp, PoundSterling, Briefcase, Star, Clock } from 'lucide-react';
import CleanerLayout from '@/components/layout/CleanerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function CleanerEarnings() {
  const { user } = useAuth();

  const { data: cleanerRecord } = useQuery({
    queryKey: ['my-cleaner-record', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('cleaners').select('*').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: completedBookings = [] } = useQuery({
    queryKey: ['cleaner-completed', cleanerRecord?.id],
    queryFn: async () => {
      if (!cleanerRecord?.id) return [];
      const { data } = await supabase.from('bookings').select('*').eq('cleaner_id', cleanerRecord.id).eq('status', 'completed').order('date', { ascending: false });
      return data || [];
    },
    enabled: !!cleanerRecord?.id,
  });

  const totalEarnings = completedBookings.reduce((s, b) => s + Number(b.total_cost), 0);
  const totalHours = completedBookings.reduce((s, b) => s + b.duration, 0);
  const avgRating = completedBookings.filter(b => b.rating).length > 0
    ? (completedBookings.filter(b => b.rating).reduce((s, b) => s + (b.rating || 0), 0) / completedBookings.filter(b => b.rating).length).toFixed(1)
    : '—';

  const dayMap: Record<string, number> = {};
  completedBookings.forEach(b => {
    const day = new Date(b.date).toLocaleDateString('en-GB', { weekday: 'short' });
    dayMap[day] = (dayMap[day] || 0) + Number(b.total_cost);
  });
  const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => ({
    day: d, amount: dayMap[d] || 0,
  }));
  const max = Math.max(...weeklyData.map(d => d.amount), 1);

  return (
    <CleanerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <BackButton />
            <h1 className="text-xl font-display font-black text-foreground">Earnings</h1>
          </div>

          <div className="bg-foreground rounded-2xl p-8 text-center mb-6">
            <PoundSterling className="h-6 w-6 text-primary-foreground/40 mx-auto mb-2" strokeWidth={1.5} />
            <div className="text-4xl font-display font-black text-primary-foreground">£{totalEarnings}</div>
            <p className="text-sm text-primary-foreground/40 mt-1 font-medium">Total Earnings</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: Briefcase, value: completedBookings.length, label: 'Jobs' },
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

          <div className="border border-border rounded-2xl p-5">
            <h3 className="font-display font-semibold text-foreground mb-5 text-sm">Weekly Breakdown</h3>
            <div className="flex items-end gap-2 h-40">
              {weeklyData.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground">£{d.amount}</span>
                  <div className="w-full rounded-lg bg-foreground" style={{ height: `${max > 0 ? (d.amount / max) * 100 : 0}%`, minHeight: '4px' }} />
                  <span className="text-[10px] font-medium text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    </CleanerLayout>
  );
}
