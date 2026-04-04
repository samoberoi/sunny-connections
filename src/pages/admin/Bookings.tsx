import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { CalendarDays } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminBookings() {
  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-all-bookings'],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Manage Bookings</h1>
      {bookings.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No bookings yet" description="Bookings will appear here once customers start booking" />
      ) : (
        <div className="glass-card-elevated rounded-2xl overflow-hidden shadow-apple">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Customer</TableHead><TableHead>Service</TableHead>
              <TableHead>Cleaner</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Total</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {bookings.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.customer_name}</TableCell>
                  <TableCell>{b.service_name}</TableCell>
                  <TableCell>{b.cleaner_name || '—'}</TableCell>
                  <TableCell>{b.date}</TableCell>
                  <TableCell><Badge variant="outline" className="rounded-lg text-xs">{b.status}</Badge></TableCell>
                  <TableCell className="font-bold">£{b.total_cost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
}
