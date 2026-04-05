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

  // Real revenue data grouped by month
  const { revenueData, totalRevenue, growthPercent } = useMemo(() => {
    const monthMap: Record<string, number> = {};
    completedBookings.forEach(b => {
      const d = new Date(b.date);
      const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      monthMap[key] = (monthMap[key] || 0) + Number(b.total_cost);
    });

    // Also include pending/in-progress bookings for projected revenue
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

    // Calculate MoM growth
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
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${growthPercent >= 0 ? 'bg-primary/10' : 'bg-destructive/10'}`}>
            <GrowthIcon className={`h-3.5 w-3.5 ${growthPercent >= 0 ? 'text-primary' : 'text-destructive'}`} strokeWidth={1.5} />
            <span className={`text-xs font-semibold ${growthPercent >= 0 ? 'text-primary' : 'text-destructive'}`}>{growthPercent >= 0 ? '+' : ''}{growthPercent}%</span>
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
            className="border border-border rounded-2xl p-5"
          >
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
              <stat.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            <p className="text-2xl font-display font-black text-foreground mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="border border-border rounded-2xl p-6">
        <h3 className="font-display font-semibold text-foreground mb-4 text-sm">Revenue Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={revenueData}>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 70%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 70%)" />
            <Tooltip formatter={(value: number) => [`£${value}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AdminLayout>
  );
}
