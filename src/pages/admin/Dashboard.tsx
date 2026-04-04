import { PoundSterling, Users, CalendarDays, UserPlus } from 'lucide-react';
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
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }} className="glass-card-elevated rounded-2xl p-5 shadow-apple">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card-elevated rounded-2xl p-6 shadow-apple">
        <h3 className="font-bold text-foreground mb-4">Revenue Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={revenueData}>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="revenue" fill="hsl(215, 95%, 55%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AdminLayout>
  );
}
