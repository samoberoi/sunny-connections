import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { GraduationCap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminEnrolments() {
  const { data: enrolments = [] } = useQuery({
    queryKey: ['admin-enrolments-list'],
    queryFn: async () => {
      const { data } = await supabase.from('enrolment_applications').select('*').order('submitted_at', { ascending: false });
      return data || [];
    },
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Enrolment Queue</h1>
      {enrolments.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No applications" description="New cleaner applications will appear here" />
      ) : (
        <div className="glass-card-elevated rounded-2xl overflow-hidden shadow-apple">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Experience</TableHead><TableHead>Status</TableHead><TableHead>Submitted</TableHead><TableHead>Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {enrolments.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.full_name}</TableCell>
                  <TableCell>{e.phone}</TableCell>
                  <TableCell>{e.experience} yrs</TableCell>
                  <TableCell><Badge variant="outline" className="rounded-lg text-xs">{e.status.replace('-', ' ')}</Badge></TableCell>
                  <TableCell>{new Date(e.submitted_at).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" className="gradient-blue text-primary-foreground rounded-xl text-xs">Approve</Button>
                    <Button size="sm" variant="outline" className="text-destructive rounded-xl text-xs">Reject</Button>
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
