import { PoundSterling, CalendarDays, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import CleanerLayout from '@/components/layout/CleanerLayout';
import { useAuth } from '@/contexts/AuthContext';
import { bookings } from '@/data/mockData';

export default function CleanerDashboard() {
  const { user } = useAuth();
  const todayBookings = bookings.filter(b => b.cleanerId === 'c1' && !['completed', 'cancelled'].includes(b.status));

  return (
    <CleanerLayout>
      <div className="gradient-hero px-6 pt-6 pb-10 rounded-b-3xl">
        <p className="text-primary-foreground/70 text-sm">Welcome back,</p>
        <h1 className="font-display text-xl font-bold text-primary-foreground">{user?.name || 'Emma'} 👋</h1>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: CalendarDays, label: 'Today', value: todayBookings.length.toString() },
            { icon: PoundSterling, label: 'This Week', value: '£486' },
            { icon: Clock, label: 'Hours', value: '32' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card rounded-xl p-4 text-center">
              <stat.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="font-display text-lg font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Today's Jobs */}
        <section>
          <h3 className="font-display font-semibold text-foreground mb-3">Today's Jobs</h3>
          {todayBookings.length === 0 ? (
            <p className="text-muted-foreground text-sm">No bookings for today.</p>
          ) : (
            <div className="space-y-3">
              {todayBookings.map(b => (
                <div key={b.id} className="glass-card rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{b.serviceName}</h4>
                    <Badge className="bg-secondary/20 text-secondary-foreground text-xs">{b.status.replace('-', ' ')}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{b.customerName}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {b.time} · {b.duration}h</span>
                    <span>{b.address.postcode}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </CleanerLayout>
  );
}
