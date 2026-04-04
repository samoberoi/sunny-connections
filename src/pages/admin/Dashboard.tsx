import { PoundSterling, Users, CalendarDays, UserPlus, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '@/components/layout/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const revenueData = [
  { month: 'Jan', revenue: 4200 }, { month: 'Feb', revenue: 5100 }, { month: 'Mar', revenue: 6300 },
  { month: 'Apr', revenue: 5800 }, { month: 'May', revenue: 7200 }, { month: 'Jun', revenue: 8100 },
];

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
  const activeCleaners = cleaners.filter((c: any) => c.available);

  const stats = [
    { icon: CalendarDays, label: 'Active Bookings', value: activeBookings.length.toString() },
    { icon: PoundSterling, label: 'Revenue (Month)', value: '£8,100' },
    { icon: Users, label: 'Active Cleaners', value: activeCleaners.length.toString() },
    { icon: UserPlus, label: 'Applications', value: enrolments.length.toString() },
  ];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-black text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your cleaning empire</p>
        </div>
        <div className="flex items-center gap-2 border border-border rounded-full px-3 py-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-foreground" strokeWidth={1.5} />
          <span className="text-xs font-semibold text-foreground">+12%</span>
        </div>
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
            <stat.icon className="h-5 w-5 text-muted-foreground mb-3" strokeWidth={1.5} />
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
            <Tooltip />
            <Bar dataKey="revenue" fill="hsl(0, 0%, 10%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AdminLayout>
  );
}
