import { useNavigate } from 'react-router-dom';
import { CalendarDays, Tag, Bell } from 'lucide-react';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import EmptyState from '@/components/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

const typeIcons = { booking: CalendarDays, promo: Tag, system: Bell };

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <BackButton />
            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          </div>

          {notifications.length === 0 ? (
            <EmptyState icon={Bell} title="All caught up" description="You have no notifications right now" />
          ) : (
            <div className="space-y-3">
              {notifications.map(n => {
                const Icon = typeIcons[n.type as keyof typeof typeIcons] || Bell;
                return (
                  <div key={n.id} className={`glass-card rounded-2xl p-4 flex gap-3 shadow-apple transition-all ${!n.read ? 'border-l-4 border-l-primary' : ''}`}>
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{n.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      <p className="text-xs text-muted-foreground/50 mt-1">{new Date(n.created_at).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
