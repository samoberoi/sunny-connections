import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';
import { enrolments } from '@/data/mockData';

const statusColors: Record<string, string> = {
  submitted: 'bg-muted text-muted-foreground',
  'under-review': 'bg-secondary/20 text-secondary-foreground',
  interview: 'bg-accent text-accent-foreground',
  training: 'bg-primary/20 text-primary',
  active: 'bg-primary text-primary-foreground',
  rejected: 'bg-destructive/20 text-destructive',
};

export default function AdminEnrolments() {
  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Enrolment Queue</h1>
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrolments.map(e => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.fullName}</TableCell>
                <TableCell>{e.phone}</TableCell>
                <TableCell>{e.experience} yrs</TableCell>
                <TableCell><Badge className={statusColors[e.status]}>{e.status.replace('-', ' ')}</Badge></TableCell>
                <TableCell>{new Date(e.submittedAt).toLocaleDateString('en-GB')}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" className="gradient-primary text-primary-foreground">Approve</Button>
                  <Button size="sm" variant="outline" className="text-destructive">Reject</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
