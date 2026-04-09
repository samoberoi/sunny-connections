import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Tag, Bell, CheckCheck, Trash2 } from 'lucide-react';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playNotificationSound } from '@/lib/notificationSound';

const typeIcons = { booking: CalendarDays, promo: Tag, system: Bell };

const typeRoutes: Record<string, string> = {
  booking: '/my-bookings',
  promo: '/services',
  system: '/home',
};

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const prevCountRef = useRef(0);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Realtime notifications with sound
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          playNotificationSound();
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  // Play sound when count increases
  useEffect(() => {
    if (notifications.length > prevCountRef.current && prevCountRef.current > 0) {
      playNotificationSound();
    }
    prevCountRef.current = notifications.length;
  }, [notifications.length]);

  const markRead = useMutation({
    mutationFn: async (id: string) => { await supabase.from('notifications').update({ read: true }).eq('id', id); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;
  const grouped = groupByDate(notifications);

  const handleTap = (n: any) => {
    if (!n.read) markRead.mutate(n.id);
    const route = typeRoutes[n.type as string] || '/home';
    navigate(route);
  };

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-14 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BackButton />
              <h1 className="text-2xl font-display font-black text-foreground">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}
                className="text-xs font-bold text-muted-foreground hover:text-foreground rounded-full gap-1.5 h-8">
                <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.5} /> Mark all read
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <EmptyState icon={Bell} title="All caught up" description="No notifications right now." />
          ) : (
            <div className="space-y-5">
              {Object.entries(grouped).map(([label, items]) => (
                <section key={label}>
                  <h3 className="font-display font-bold text-foreground text-sm mb-3">{label}</h3>
                  <div className="space-y-2.5">
                    {items.map((n: any) => {
                      const Icon = typeIcons[n.type as keyof typeof typeIcons] || Bell;
                      return (
                        <button key={n.id} onClick={() => handleTap(n)}
                          className={`w-full text-left bg-card rounded-3xl p-4 flex gap-3 transition-all shadow-soft border ${!n.read ? 'border-primary border-l-4' : 'border-border opacity-60'}`}>
                          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                            <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-foreground">{n.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(n.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
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
