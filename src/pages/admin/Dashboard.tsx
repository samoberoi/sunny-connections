import { useMemo, useState, useEffect } from 'react';
import { PoundSterling, Users, CalendarDays, UserPlus, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '@/components/layout/AdminLayout';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SimulatedMap, { generateCleanerMarkers, generateClientMarkers } from '@/components/SimulatedMap';

export default function AdminDashboard() {
  const [mapView, setMapView] = useState<'requests' | 'cleaners'>('requests');
  const queryClient = useQueryClient();

  const { data: bookings = [] } = useQuery({ queryKey: ['admin-bookings'], queryFn: async () => { const { data } = await supabase.from('bookings').select('*').limit(1000); return data || []; } });
  const { data: cleaners = [] } = useQuery({ queryKey: ['admin-cleaners'], queryFn: async () => { const { data } = await supabase.from('cleaners').select('*').limit(500); return data || []; } });
  const { data: enrolments = [] } = useQuery({ queryKey: ['admin-enrolments'], queryFn: async () => { const { data } = await supabase.from('enrolment_applications').select('*').limit(500); return data || []; } });

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cleaners' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-cleaners'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enrolment_applications' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-enrolments'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const activeBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const activeCleaners = cleaners.filter((c: any) => c.available);
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  const mapMarkers = useMemo(() => {
    if (mapView === 'cleaners') return generateCleanerMarkers(Math.min(activeCleaners.length || 4, 8));
    return generateClientMarkers(Math.min(pendingBookings.length || 3, 6));
  }, [mapView, activeCleaners.length, pendingBookings.length]);

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
      <div className="relative min-h-[calc(100vh-4rem)]">
        {/* Sticky map - top half, same style as customer view */}
        <div className="sticky top-0 z-[5]">
          <SimulatedMap markers={mapMarkers} height={380} className="">
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background pointer-events-none" />
          </SimulatedMap>

          {/* Header overlay */}
          <div className="absolute top-0 left-0 right-0 px-6 pt-6 z-20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-display font-black text-foreground leading-none">Dashboard</h1>
                <p className="text-xs text-muted-foreground mt-1">Your cleaning empire</p>
              </div>
              <div className="flex items-center gap-2">
                {totalRevenue > 0 && (
                  <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${growthPercent >= 0 ? 'bg-primary' : 'bg-destructive/10'}`}>
                    <GrowthIcon className={`h-3.5 w-3.5 ${growthPercent >= 0 ? 'text-primary-foreground' : 'text-destructive'}`} strokeWidth={1.5} />
                    <span className={`text-xs font-bold ${growthPercent >= 0 ? 'text-primary-foreground' : 'text-destructive'}`}>{growthPercent >= 0 ? '+' : ''}{growthPercent}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map toggle overlay */}
          <div className="absolute bottom-14 left-0 right-0 z-30 flex justify-center">
            <div className="flex bg-foreground/80 backdrop-blur-md rounded-full p-1 shadow-lg">
              <button onClick={() => setMapView('requests')}
                className={`text-[11px] font-bold px-4 py-2 rounded-full transition-all ${mapView === 'requests' ? 'bg-primary text-primary-foreground' : 'text-background/60'}`}>
                Requests ({pendingBookings.length})
              </button>
              <button onClick={() => setMapView('cleaners')}
                className={`text-[11px] font-bold px-4 py-2 rounded-full transition-all ${mapView === 'cleaners' ? 'bg-primary text-primary-foreground' : 'text-background/60'}`}>
                Cleaners ({activeCleaners.length})
              </button>
            </div>
          </div>

          {/* Live indicator */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5 bg-foreground/70 backdrop-blur-md rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-background">LIVE</span>
          </div>
        </div>

        {/* Scrollable content over map */}
        <div className="relative z-10 bg-background rounded-t-[2rem] -mt-8 pt-6 px-5 pb-8 min-h-[60vh]">
          <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-5" />

          <div className="grid grid-cols-2 gap-3 mb-6">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-3xl p-4 shadow-soft border border-border">
                <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center mb-2">
                  <stat.icon className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                </div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-display font-black text-foreground mt-0.5">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-foreground rounded-3xl p-5">
            <h3 className="font-display font-bold text-background/40 mb-4 text-sm">Revenue</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} stroke="rgba(255,255,255,0.1)" />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} stroke="rgba(255,255,255,0.1)" />
                <Tooltip formatter={(value: number) => [`£${value}`, 'Revenue']} contentStyle={{ background: '#1a1a1a', border: 'none', borderRadius: '16px', color: '#fff' }} />
                <Bar dataKey="revenue" fill="hsl(78, 85%, 65%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
