import { useMemo } from 'react';
import { PoundSterling, Users, CalendarDays, UserPlus, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '@/components/layout/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminDashboard() {
  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('*');
      return data || [];
    },
  });

  const { data: cleaners = [] } = useQuery({
    queryKey: ['admin-cleaners'],
    queryFn: async () => {
      const { data } = await supabase.from('cleaners').select('*');
      return data || [];
    },
  });

  const { data: enrolments = [] } = useQuery({
    queryKey: ['admin-enrolments'],
    queryFn: async () => {
      const { data } = await supabase.from('enrolment_applications').select('*');
      return data || [];
    },
  });

  const activeBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const activeCleaners = cleaners.filter((c: any) => c.available);

  const { revenueData, totalRevenue, growthPercent } = useMemo(() => {
    const monthMap: Record<string, number> = {};
    completedBookings.forEach(b => {
      const d = new Date(b.date);
      const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      monthMap[key] = (monthMap[key] || 0) + Number(b.total_cost);
    });

    bookings.filter(b => !['cancelled'].includes(b.status)).forEach(b => {
      if (b.status !== 'completed') {
        const d = new Date(b.date);
        const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
        if (!monthMap[key]) monthMap[key] = 0;
      }
    });

    const entries = Object.entries(monthMap).sort((a, b) => {
      return new Date('01 ' + a[0]).getTime() - new Date('01 ' + b[0]).getTime();
    });

    const data = entries.length > 0
      ? entries.slice(-6).map(([month, revenue]) => ({ month, revenue }))
      : [{ month: 'No data', revenue: 0 }];

    const total = completedBookings.reduce((s, b) => s + Number(b.total_cost), 0);

    let growth = 0;
    if (data.length >= 2) {
      const curr = data[data.length - 1].revenue;
      const prev = data[data.length - 2].revenue;
      growth = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;
    }

    return { revenueData: data, totalRevenue: total, growthPercent: growth };
  }, [bookings, completedBookings]);

  const stats = [
    { icon: CalendarDays, label: 'Active Bookings', value: activeBookings.length.toString() },
    { icon: PoundSterling, label: 'Total Revenue', value: `£${totalRevenue.toLocaleString()}` },
    { icon: Users, label: 'Active Cleaners', value: activeCleaners.length.toString() },
    { icon: UserPlus, label: 'Applications', value: enrolments.length.toString() },
  ];

  const GrowthIcon = growthPercent >= 0 ? TrendingUp : TrendingDown;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-black text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your cleaning empire</p>
        </div>
        {totalRevenue > 0 && (
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${growthPercent >= 0 ? 'bg-primary' : 'bg-destructive/10'}`}>
            <GrowthIcon className={`h-3.5 w-3.5 ${growthPercent >= 0 ? 'text-primary-foreground' : 'text-destructive'}`} strokeWidth={1.5} />
            <span className={`text-xs font-bold ${growthPercent >= 0 ? 'text-primary-foreground' : 'text-destructive'}`}>{growthPercent >= 0 ? '+' : ''}{growthPercent}%</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            className="bg-card border border-border rounded-2xl p-5 shadow-soft"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
              <stat.icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-muted-foreground font-bold">{stat.label}</p>
            <p className="text-2xl font-display font-black text-foreground mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-foreground rounded-2xl p-6">
        <h3 className="font-display font-bold text-background/60 mb-4 text-sm">Revenue Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={revenueData}>
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} stroke="rgba(255,255,255,0.1)" />
            <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} stroke="rgba(255,255,255,0.1)" />
            <Tooltip formatter={(value: number) => [`£${value}`, 'Revenue']} contentStyle={{ background: '#1a1a1a', border: 'none', borderRadius: '12px', color: '#fff' }} />
            <Bar dataKey="revenue" fill="hsl(78, 85%, 65%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AdminLayout>
  );
}
