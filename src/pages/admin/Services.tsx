import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layout/AdminLayout';
import { services as mockServices } from '@/data/mockData';

export default function AdminServices() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Services & Pricing</h1>
        <Button className="gradient-blue text-primary-foreground rounded-xl shadow-blue">Add Service</Button>
      </div>
      <div className="glass-card-elevated rounded-2xl overflow-hidden shadow-apple">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Service</TableHead><TableHead>Category</TableHead><TableHead>Rate/hr</TableHead><TableHead>Duration</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {mockServices.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell><Badge variant="outline" className="capitalize rounded-lg">{s.category}</Badge></TableCell>
                <TableCell className="font-bold">£{s.ratePerHour}</TableCell>
                <TableCell>{s.minDuration}-{s.maxDuration}h</TableCell>
                <TableCell><Button size="sm" variant="outline" className="rounded-xl">Edit</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
