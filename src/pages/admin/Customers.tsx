import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';

const customers = [
  { id: 'u1', name: 'Alex Morgan', phone: '+447700900000', bookings: 5, joined: '2026-01-01' },
  { id: 'u2', name: 'Sophie Chen', phone: '+447700900010', bookings: 3, joined: '2026-02-15' },
  { id: 'u3', name: 'Oliver Hughes', phone: '+447700900020', bookings: 8, joined: '2025-11-20' },
];

export default function AdminCustomers() {
  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Manage Customers</h1>
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>{c.bookings}</TableCell>
                <TableCell>{c.joined}</TableCell>
                <TableCell><Button size="sm" variant="outline">View</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
