import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';
import StarRating from '@/components/StarRating';
import { cleaners } from '@/data/mockData';

export default function AdminCleaners() {
  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Manage Cleaners</h1>
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cleaners.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell><StarRating rating={Math.round(c.rating)} readonly size="sm" /></TableCell>
                <TableCell>{c.experience} yrs</TableCell>
                <TableCell>
                  <Badge className={c.available ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}>
                    {c.available ? 'Available' : 'Unavailable'}
                  </Badge>
                </TableCell>
                <TableCell><Button size="sm" variant="outline">View</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
