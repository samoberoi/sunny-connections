import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminLayout from '@/components/layout/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PoundSterling, TrendingUp, MapPin, Briefcase, Users, Star, Percent } from 'lucide-react';

const COLORS = ['hsl(78,85%,45%)', 'hsl(215,80%,55%)', 'hsl(160,65%,48%)', 'hsl(42,80%,55%)', 'hsl(0,60%,55%)', 'hsl(280,60%,55%)'];

export default function AdminReports() {
  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-report-bookings'],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('total_cost, status, date, service_name, address_postcode, customer_id, cleaner_id, cleaner_name, duration').limit(5000);
      return data || [];
    },
  });

  const { data: cleaners = [] } = useQuery({
    queryKey: ['admin-report-cleaners'],
    queryFn: async () => {
      const { data } = await supabase.from('cleaners').select('id, name, rating, review_count');
      return data || [];
    },
  });

  const completed = bookings.filter((b: any) => b.status === 'completed');
  const totalRevenue = completed.reduce((s: number, b: any) => s + Number(b.total_cost), 0);
  const avgBookingValue = completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0;

  // Customer retention
  const retentionRate = useMemo(() => {
    const customerBookings: Record<string, number> = {};
    completed.forEach((b: any) => { customerBookings[b.customer_id] = (customerBookings[b.customer_id] || 0) + 1; });
    const total = Object.keys(customerBookings).length;
    const repeat = Object.values(customerBookings).filter(c => c > 1).length;
    return total > 0 ? Math.round((repeat / total) * 100) : 0;
  }, [completed]);

  // Cleaner utilization
  const utilizationRate = useMemo(() => {
    const totalCleaners = cleaners.length;
    const activeCleanerIds = new Set(completed.map((b: any) => b.cleaner_id).filter(Boolean));
    return totalCleaners > 0 ? Math.round((activeCleanerIds.size / totalCleaners) * 100) : 0;
  }, [completed, cleaners]);

  // Monthly revenue
  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    completed.forEach((b: any) => {
      const d = new Date(b.date);
      const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      map[key] = (map[key] || 0) + Number(b.total_cost);
    });
    return Object.entries(map).sort((a, b) => {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const parseDate = (k: string) => { const parts = k.split(' '); return parseInt('20' + parts[1]) * 12 + months.indexOf(parts[0]); };
      return parseDate(a[0]) - parseDate(b[0]);
    }).slice(-6).map(([month, revenue]) => ({ month, revenue }));
  }, [completed]);

  const growth = monthlyData.length >= 2 ? (() => {
    const curr = monthlyData[monthlyData.length - 1].revenue;
    const prev = monthlyData[monthlyData.length - 2].revenue;
    return prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;
  })() : 0;

  // Revenue by service
  const byService = useMemo(() => {
    const map: Record<string, number> = {};
    completed.forEach((b: any) => { map[b.service_name] = (map[b.service_name] || 0) + Number(b.total_cost); });
    return Object.entries(map).map(([name, value]) => ({ name: name.length > 16 ? name.slice(0, 16) + '…' : name, value })).sort((a, b) => b.value - a.value);
  }, [completed]);

  // Revenue by area
  const byArea = useMemo(() => {
    const map: Record<string, number> = {};
    completed.forEach((b: any) => {
      const area = (b.address_postcode || 'Unknown').split(' ')[0];
      map[area] = (map[area] || 0) + Number(b.total_cost);
    });
    return Object.entries(map).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [completed]);

  // Top cleaners leaderboard
  const topCleaners = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; jobs: number; hours: number }> = {};
    completed.forEach((b: any) => {
      if (!b.cleaner_id) return;
      if (!map[b.cleaner_id]) map[b.cleaner_id] = { name: b.cleaner_name || 'Unknown', revenue: 0, jobs: 0, hours: 0 };
      map[b.cleaner_id].revenue += Number(b.total_cost);
      map[b.cleaner_id].jobs += 1;
      map[b.cleaner_id].hours += b.duration || 0;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [completed]);

  return (
    <AdminLayout>
      <div className="px-5 pt-6 pb-6">
        <h1 className="text-2xl font-display font-black text-foreground mb-5">Revenue & Reports</h1>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card rounded-2xl p-3 text-center border border-border">
            <PoundSterling className="h-4 w-4 mx-auto mb-1 text-primary" strokeWidth={1.5} />
            <p className="text-lg font-display font-black text-foreground">£{totalRevenue.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Total Revenue</p>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center border border-border">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" strokeWidth={1.5} />
            <p className={`text-lg font-display font-black ${growth >= 0 ? 'text-primary' : 'text-destructive'}`}>{growth >= 0 ? '+' : ''}{growth}%</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">MoM Growth</p>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center border border-border">
            <Briefcase className="h-4 w-4 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-lg font-display font-black text-foreground">£{avgBookingValue}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Avg Booking</p>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center border border-border">
            <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-lg font-display font-black text-foreground">{retentionRate}%</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Retention</p>
          </div>
        </div>

        {/* Utilization */}
        <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20 mb-6 flex items-center gap-3">
          <Percent className="h-5 w-5 text-primary" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-bold text-foreground">Cleaner Utilization: {utilizationRate}%</p>
            <p className="text-[10px] text-muted-foreground">{cleaners.length} registered cleaners</p>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        {monthlyData.length > 0 && (
          <div className="bg-foreground rounded-3xl p-5 mb-6">
            <h3 className="font-display font-bold text-background/40 mb-4 text-sm">Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} stroke="rgba(255,255,255,0.1)" />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} stroke="rgba(255,255,255,0.1)" />
                <Tooltip formatter={(v: number) => [`£${v}`, 'Revenue']} contentStyle={{ background: '#1a1a1a', border: 'none', borderRadius: '16px', color: '#fff' }} />
                <Bar dataKey="revenue" fill="hsl(78, 85%, 65%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Cleaners Leaderboard */}
        {topCleaners.length > 0 && (
          <div className="bg-card rounded-3xl p-5 border border-border mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-primary" strokeWidth={1.5} />
              <h3 className="font-display font-bold text-foreground text-sm">Top Cleaners</h3>
            </div>
            <div className="space-y-3">
              {topCleaners.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.jobs} jobs · {c.hours}h</p>
                  </div>
                  <span className="font-display font-black text-foreground text-sm">£{c.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue by Service */}
        {byService.length > 0 && (
          <div className="bg-card rounded-3xl p-5 border border-border mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-4 w-4 text-primary" strokeWidth={1.5} />
              <h3 className="font-display font-bold text-foreground text-sm">Revenue by Service</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byService} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {byService.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`£${v}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Revenue by Area */}
        {byArea.length > 0 && (
          <div className="bg-card rounded-3xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-primary" strokeWidth={1.5} />
              <h3 className="font-display font-bold text-foreground text-sm">Revenue by Area</h3>
            </div>
            <div className="space-y-2">
              {byArea.map((area, i) => {
                const maxRev = byArea[0].revenue;
                const pct = maxRev > 0 ? (area.revenue / maxRev) * 100 : 0;
                return (
                  <div key={area.name} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-foreground w-14 shrink-0">{area.name}</span>
                    <div className="flex-1 h-6 bg-muted/30 rounded-lg overflow-hidden">
                      <div className="h-full rounded-lg flex items-center px-2" style={{ width: `${Math.max(pct, 10)}%`, background: COLORS[i % COLORS.length] }}>
                        <span className="text-[10px] font-bold text-white">£{area.revenue}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
