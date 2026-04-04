import { CalendarDays, Tag, Bell } from 'lucide-react';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import EmptyState from '@/components/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const typeIcons = { booking: CalendarDays, promo: Tag, system: Bell };

function groupByDate(notifications: any[]) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const groups: Record<string, any[]> = {};
  notifications.forEach(n => {
    const d = new Date(n.created_at);
    let label = 'Earlier';
    if (d.toDateString() === today.toDateString()) label = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return groups;
}

export default function Notifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const grouped = groupByDate(notifications);

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <BackButton />
            <h1 className="text-xl font-display font-black text-foreground">Notifications</h1>
          </div>

          {notifications.length === 0 ? (
            <EmptyState icon={Bell} title="All caught up" description="No notifications right now. Lovely." />
          ) : (
            <div className="space-y-5">
              {Object.entries(grouped).map(([label, items]) => (
                <section key={label}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{label}</h3>
                  <div className="space-y-2">
                    {items.map((n: any) => {
                      const Icon = typeIcons[n.type as keyof typeof typeIcons] || Bell;
                      return (
                        <button
                          key={n.id}
                          onClick={() => !n.read && markRead.mutate(n.id)}
                          className={`w-full text-left border border-border rounded-2xl p-4 flex gap-3 transition-all ${!n.read ? 'border-l-4 border-l-foreground' : 'opacity-50'}`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                            <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">{n.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                            <p className="text-xs text-muted-foreground/50 mt-1">{new Date(n.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
