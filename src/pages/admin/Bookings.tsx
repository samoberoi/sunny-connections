import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { CalendarDays, MapPin, MoreHorizontal, XCircle, UserCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-black text-foreground">Live Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time view of all bookings</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary">Live</span>
        </div>
      </div>

      {bookings.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No bookings yet" description="Bookings will appear here once customers start booking" />
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Service</TableHead>
                <TableHead className="font-semibold">Cleaner</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Total</TableHead>
                <TableHead className="font-semibold w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map(b => (
                <TableRow key={b.id} className="hover:bg-accent/50 transition-colors">
                  <TableCell className="font-medium">{b.customer_name}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{b.service_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{b.property_type} · {b.duration}h</p>
                    </div>
                  </TableCell>
                  <TableCell>{b.cleaner_name || <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" strokeWidth={1.5} />
                      {b.address_postcode}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{b.date} {b.time}</TableCell>
                  <TableCell>
                    <Badge className={`rounded-lg text-[10px] font-semibold border capitalize ${statusColors[b.status] || 'bg-muted text-foreground'}`}>
                      {b.status.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-display font-black text-primary">£{b.total_cost}</TableCell>
                  <TableCell>
                    {!['completed', 'cancelled'].includes(b.status) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          {b.cleaner_id && (
                            <DropdownMenuItem onClick={() => unassignCleaner.mutate(b.id)} className="text-xs">
                              <UserCheck className="h-3.5 w-3.5 mr-2" /> Reassign Cleaner
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => cancelBooking.mutate(b.id)} className="text-xs text-destructive focus:text-destructive">
                            <XCircle className="h-3.5 w-3.5 mr-2" /> Cancel Booking
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
}
