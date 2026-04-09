import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { CalendarDays, MapPin, MoreHorizontal, XCircle, UserCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  assigned: 'bg-blue-100 text-blue-800 border-blue-200',
  'en-route': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'otp-verified': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'in-progress': 'bg-primary/10 text-primary border-primary/20',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export default function AdminBookings() {
  const queryClient = useQueryClient();

  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-all-bookings'],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('admin-bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const cancelBooking = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bookings').update({ status: 'cancelled' as any }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] });
      toast.success('Booking cancelled');
    },
  });

  const unassignCleaner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bookings').update({
        cleaner_id: null, cleaner_name: null, cleaner_avatar: null, status: 'pending' as any,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] });
      toast.success('Cleaner unassigned — booking is back in the pool');
    },
  });

  return (
    <AdminLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-display font-black text-foreground">Live Bookings</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time view of all bookings</p>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary">Live</span>
          </div>
        </div>

        {bookings.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No bookings yet" description="Bookings will appear here once customers start booking" />
        ) : (
          <div className="space-y-3">
            {bookings.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-card rounded-2xl p-4 shadow-soft border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-foreground text-sm truncate">{b.customer_name}</h3>
                      <Badge className={`text-[9px] rounded-lg font-medium border capitalize shrink-0 ${statusColors[b.status] || 'bg-muted text-foreground'}`}>
                        {b.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{b.service_name} · {b.property_type} · {b.duration}h</p>
                  </div>
                  {!['completed', 'cancelled'].includes(b.status) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        {b.cleaner_id && (
                          <DropdownMenuItem onClick={() => unassignCleaner.mutate(b.id)} className="text-xs">
                            <UserCheck className="h-3.5 w-3.5 mr-2" /> Reassign
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => cancelBooking.mutate(b.id)} className="text-xs text-destructive focus:text-destructive">
                          <XCircle className="h-3.5 w-3.5 mr-2" /> Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{b.address_postcode}</span>
                    <span>{b.date} {b.time}</span>
                  </div>
                  <span className="font-display font-black text-primary text-sm">£{b.total_cost}</span>
                </div>
                {b.cleaner_name && (
                  <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                    Cleaner: <span className="font-semibold text-foreground">{b.cleaner_name}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
