import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';
import { enrolments } from '@/data/mockData';

export default function AdminEnrolments() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Enrolment Queue</h1>
      <div className="glass-card-elevated rounded-2xl overflow-hidden shadow-apple">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Experience</TableHead><TableHead>Status</TableHead><TableHead>Submitted</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {enrolments.map(e => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.fullName}</TableCell>
                <TableCell>{e.phone}</TableCell>
                <TableCell>{e.experience} yrs</TableCell>
                <TableCell><Badge variant="outline" className="rounded-lg">{e.status.replace('-', ' ')}</Badge></TableCell>
                <TableCell>{new Date(e.submittedAt).toLocaleDateString('en-GB')}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" className="gradient-blue text-primary-foreground rounded-xl">Approve</Button>
                  <Button size="sm" variant="outline" className="text-destructive rounded-xl">Reject</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
