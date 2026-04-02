import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/components/layout/AdminLayout';
import { bookings } from '@/data/mockData';

export default function AdminBookings() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Manage Bookings</h1>
      <div className="glass-card-elevated rounded-2xl overflow-hidden shadow-apple">
        <Table>
          <TableHeader><TableRow>
            <TableHead>ID</TableHead><TableHead>Customer</TableHead><TableHead>Service</TableHead>
            <TableHead>Cleaner</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Total</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {bookings.map(b => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs">{b.id}</TableCell>
                <TableCell className="font-medium">{b.customerName}</TableCell>
                <TableCell>{b.serviceName}</TableCell>
                <TableCell>{b.cleanerName}</TableCell>
                <TableCell>{b.date}</TableCell>
                <TableCell><Badge variant="outline" className="rounded-lg">{b.status}</Badge></TableCell>
                <TableCell className="font-bold">£{b.totalCost}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
