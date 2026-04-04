import { PoundSterling, CalendarDays, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import CleanerLayout from '@/components/layout/CleanerLayout';
import PageTransition from '@/components/PageTransition';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function CleanerDashboard() {
  const { user } = useAuth();

  const { data: bookings = [] } = useQuery({
    queryKey: ['cleaner-bookings', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: true });
      return data || [];
    },
  });

  const todayBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));

  return (
    <CleanerLayout>
      <PageTransition>
        <div className="gradient-hero px-5 pt-6 pb-12 rounded-b-[2rem]">
          <p className="text-primary-foreground/70 text-sm">Welcome back,</p>
          <h1 className="text-xl font-bold text-primary-foreground">{user?.name || 'Cleaner'}</h1>
        </div>

        <div className="px-5 -mt-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: CalendarDays, label: 'Today', value: todayBookings.length.toString() },
              { icon: PoundSterling, label: 'This Week', value: '£486' },
              { icon: Clock, label: 'Hours', value: '32' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.35 }} className="glass-card-elevated rounded-2xl p-4 text-center shadow-apple">
                <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center mx-auto mb-2">
                  <stat.icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
                </div>
                <div className="text-lg font-bold text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <section>
            <h3 className="font-bold text-foreground mb-3 text-sm">Today's Jobs</h3>
            {todayBookings.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No jobs today" description="Enjoy your day off!" />
            ) : (
              <div className="space-y-3">
                {todayBookings.map(b => (
                  <div key={b.id} className="glass-card rounded-2xl p-4 shadow-apple">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-semibold text-foreground text-sm">{b.service_name}</h4>
                      <Badge className="bg-primary/10 text-primary text-xs rounded-lg">{b.status.replace('-', ' ')}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{b.customer_name}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" strokeWidth={1.5} /> {b.time} · {b.duration}h</span>
                      <span>{b.address_postcode}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </PageTransition>
    </CleanerLayout>
  );
}
