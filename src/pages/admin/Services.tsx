import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { Settings } from 'lucide-react';
import { useServices } from '@/hooks/useServices';

export default function AdminServices() {
  const { data: services = [] } = useServices();

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Services & Pricing</h1>
        <Button className="gradient-blue text-primary-foreground rounded-xl shadow-blue text-xs">Add Service</Button>
      </div>
      {services.length === 0 ? (
        <EmptyState icon={Settings} title="No services" description="Add your first service to get started" />
      ) : (
        <div className="glass-card-elevated rounded-2xl overflow-hidden shadow-apple">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Service</TableHead><TableHead>Category</TableHead><TableHead>Rate/hr</TableHead><TableHead>Duration</TableHead><TableHead>Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {services.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize rounded-lg text-xs">{s.category}</Badge></TableCell>
                  <TableCell className="font-bold">£{s.rate_per_hour}</TableCell>
                  <TableCell>{s.min_duration}-{s.max_duration}h</TableCell>
                  <TableCell><Button size="sm" variant="outline" className="rounded-xl text-xs">Edit</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
}
