import { PoundSterling, CalendarDays, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import CleanerLayout from '@/components/layout/CleanerLayout';
import PageTransition from '@/components/PageTransition';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function CleanerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cleanerRecord } = useQuery({
    queryKey: ['my-cleaner-record', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('cleaners').select('*').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['cleaner-my-bookings', cleanerRecord?.id],
    queryFn: async () => {
      if (!cleanerRecord?.id) return [];
      const { data } = await supabase.from('bookings').select('*').eq('cleaner_id', cleanerRecord.id).order('date', { ascending: true });
      return data || [];
    },
    enabled: !!cleanerRecord?.id,
  });

  const toggleAvailability = useMutation({
    mutationFn: async () => {
      if (!cleanerRecord) return;
      await supabase.from('cleaners').update({ available: !cleanerRecord.available }).eq('id', cleanerRecord.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-cleaner-record'] });
      toast.success(cleanerRecord?.available ? 'Set to offline' : 'You\'re online! 🟢');
    },
  });

  const todayBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const weekEarnings = completedBookings.reduce((s, b) => s + Number(b.total_cost), 0);

  return (
    <CleanerLayout>
      <PageTransition>
        {/* Cyan header */}
        <div className="gradient-cyan px-6 pt-8 pb-14 rounded-b-[2rem]">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-foreground/60 text-sm font-medium">Welcome back,</p>
              <h1 className="text-2xl font-display font-black text-foreground">{user?.name || 'Cleaner'}</h1>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleAvailability.mutate()}
              className="flex items-center gap-2 bg-foreground/10 rounded-full px-4 py-2"
            >
              {cleanerRecord?.available ? (
                <ToggleRight className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              ) : (
                <ToggleLeft className="h-5 w-5 text-foreground/50" strokeWidth={1.5} />
              )}
              <span className="text-xs font-bold text-foreground">
                {cleanerRecord?.available ? 'Online' : 'Offline'}
              </span>
            </motion.button>
          </div>
        </div>

        <div className="px-5 -mt-8 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: CalendarDays, label: 'Today', value: todayBookings.length.toString(), color: 'gradient-neon' },
              { icon: PoundSterling, label: 'This Week', value: `£${weekEarnings}`, color: 'gradient-pink' },
              { icon: Clock, label: 'Jobs Done', value: completedBookings.length.toString(), color: 'bg-foreground' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.35 }} className={`${stat.color} rounded-2xl p-4 text-center ${stat.color === 'bg-foreground' ? 'text-card' : 'text-foreground'}`}>
                <stat.icon className="h-5 w-5 mx-auto mb-2" strokeWidth={1.5} />
                <div className="text-lg font-display font-black">{stat.value}</div>
                <div className="text-[10px] font-medium opacity-60">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-foreground text-sm">Today's Jobs</h3>
              <button onClick={() => navigate('/cleaner/jobs')} className="text-xs font-bold text-muted-foreground">View all →</button>
            </div>
            {todayBookings.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No jobs today" description="No jobs today. Cuppa time! ☕" />
            ) : (
              <div className="space-y-3">
                {todayBookings.map(b => (
                  <motion.div key={b.id} whileTap={{ scale: 0.97 }} onClick={() => navigate('/cleaner/jobs')} className="bg-card rounded-2xl p-4 shadow-apple cursor-pointer">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-bold text-foreground text-sm">{b.service_name}</h4>
                      <Badge className="bg-primary/20 text-foreground text-xs rounded-lg font-bold">{b.status.replace('-', ' ')}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{b.customer_name}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" strokeWidth={1.5} /> {b.time} · {b.duration}h</span>
                      <span>{b.address_postcode}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      </PageTransition>
    </CleanerLayout>
  );
}
