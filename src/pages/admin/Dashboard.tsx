import { useMemo } from 'react';
import { PoundSterling, Users, CalendarDays, UserPlus, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '@/components/layout/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminDashboard() {
  const { data: bookings = [] } = useQuery({ queryKey: ['admin-bookings'], queryFn: async () => { const { data } = await supabase.from('bookings').select('*'); return data || []; } });
  const { data: cleaners = [] } = useQuery({ queryKey: ['admin-cleaners'], queryFn: async () => { const { data } = await supabase.from('cleaners').select('*'); return data || []; } });
  const { data: enrolments = [] } = useQuery({ queryKey: ['admin-enrolments'], queryFn: async () => { const { data } = await supabase.from('enrolment_applications').select('*'); return data || []; } });

  const activeBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const activeCleaners = cleaners.filter((c: any) => c.available);

  const { revenueData, totalRevenue, growthPercent } = useMemo(() => {
    const monthMap: Record<string, number> = {};
    completedBookings.forEach(b => { const d = new Date(b.date); const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }); monthMap[key] = (monthMap[key] || 0) + Number(b.total_cost); });
    bookings.filter(b => !['cancelled'].includes(b.status)).forEach(b => { if (b.status !== 'completed') { const d = new Date(b.date); const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }); if (!monthMap[key]) monthMap[key] = 0; } });
    const entries = Object.entries(monthMap).sort((a, b) => new Date('01 ' + a[0]).getTime() - new Date('01 ' + b[0]).getTime());
    const data = entries.length > 0 ? entries.slice(-6).map(([month, revenue]) => ({ month, revenue })) : [{ month: 'No data', revenue: 0 }];
    const total = completedBookings.reduce((s, b) => s + Number(b.total_cost), 0);
    let growth = 0;
    if (data.length >= 2) { const curr = data[data.length - 1].revenue; const prev = data[data.length - 2].revenue; growth = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0; }
    return { revenueData: data, totalRevenue: total, growthPercent: growth };
  }, [bookings, completedBookings]);

  const stats = [
    { icon: CalendarDays, label: 'Active', value: activeBookings.length.toString() },
    { icon: PoundSterling, label: 'Revenue', value: `£${totalRevenue.toLocaleString()}` },
    { icon: Users, label: 'Cleaners', value: activeCleaners.length.toString() },
    { icon: UserPlus, label: 'Applications', value: enrolments.length.toString() },
  ];

  const GrowthIcon = growthPercent >= 0 ? TrendingUp : TrendingDown;

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-black text-foreground">Dashboard</h1>
          {totalRevenue > 0 && (
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${growthPercent >= 0 ? 'bg-primary' : 'bg-destructive/10'}`}>
              <GrowthIcon className={`h-3.5 w-3.5 ${growthPercent >= 0 ? 'text-primary-foreground' : 'text-destructive'}`} strokeWidth={1.5} />
              <span className={`text-xs font-bold ${growthPercent >= 0 ? 'text-primary-foreground' : 'text-destructive'}`}>{growthPercent >= 0 ? '+' : ''}{growthPercent}%</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">Your cleaning empire</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-3xl p-5 shadow-soft border border-border">
            <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center mb-3">
              <stat.icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-muted-foreground font-bold">{stat.label}</p>
            <p className="text-3xl font-display font-black text-foreground mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-foreground rounded-3xl p-6">
        <h3 className="font-display font-bold text-background/40 mb-4 text-sm">Revenue</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={revenueData}>
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} stroke="rgba(255,255,255,0.1)" />
            <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} stroke="rgba(255,255,255,0.1)" />
            <Tooltip formatter={(value: number) => [`£${value}`, 'Revenue']} contentStyle={{ background: '#1a1a1a', border: 'none', borderRadius: '16px', color: '#fff' }} />
            <Bar dataKey="revenue" fill="hsl(78, 85%, 65%)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AdminLayout>
  );
}
