import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';
import StarRating from '@/components/StarRating';
import EmptyState from '@/components/EmptyState';
import { UserCheck } from 'lucide-react';
import { useCleaners } from '@/hooks/useCleaners';

export default function AdminCleaners() {
  const { data: cleaners = [] } = useCleaners();

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Manage Cleaners</h1>
      {cleaners.length === 0 ? (
        <EmptyState icon={UserCheck} title="No cleaners yet" description="Cleaners will appear once they are added" />
      ) : (
        <div className="glass-card-elevated rounded-2xl overflow-hidden shadow-apple">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Rating</TableHead><TableHead>Experience</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {cleaners.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell><StarRating rating={Math.round(c.rating)} readonly size="sm" /></TableCell>
                  <TableCell>{c.experience} yrs</TableCell>
                  <TableCell><Badge className={`rounded-lg text-xs ${c.available ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{c.available ? 'Available' : 'Unavailable'}</Badge></TableCell>
                  <TableCell><Button size="sm" variant="outline" className="rounded-xl text-xs">View</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
}
