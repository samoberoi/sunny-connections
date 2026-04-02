import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import AdminLayout from '@/components/layout/AdminLayout';

const revenueData = [
  { month: 'Jan', revenue: 4200 }, { month: 'Feb', revenue: 5100 }, { month: 'Mar', revenue: 6300 },
  { month: 'Apr', revenue: 5800 }, { month: 'May', revenue: 7200 }, { month: 'Jun', revenue: 8100 },
];
const bookingVolume = [
  { month: 'Jan', bookings: 42 }, { month: 'Feb', bookings: 51 }, { month: 'Mar', bookings: 68 },
  { month: 'Apr', bookings: 58 }, { month: 'May', bookings: 75 }, { month: 'Jun', bookings: 89 },
];
const ratingDist = [
  { name: '5★', value: 65 }, { name: '4★', value: 22 }, { name: '3★', value: 8 },
  { name: '2★', value: 3 }, { name: '1★', value: 2 },
];
const COLORS = ['hsl(215,95%,55%)', 'hsl(215,80%,65%)', 'hsl(160,65%,48%)', 'hsl(42,80%,55%)', 'hsl(0,60%,55%)'];

export default function AdminReports() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Reports</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-elevated rounded-2xl p-6 shadow-apple">
          <h3 className="font-bold text-foreground mb-4">Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData}><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="revenue" fill="hsl(215,95%,55%)" radius={[6,6,0,0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card-elevated rounded-2xl p-6 shadow-apple">
          <h3 className="font-bold text-foreground mb-4">Booking Volume</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={bookingVolume}><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="bookings" stroke="hsl(160,65%,48%)" strokeWidth={2} /></LineChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card-elevated rounded-2xl p-6 shadow-apple lg:col-span-2">
          <h3 className="font-bold text-foreground mb-4">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart><Pie data={ratingDist} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
              {ratingDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}
