import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminCustomers() {
  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false });
      return data || [];
    },
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Manage Customers</h1>
      {profiles.length === 0 ? (
        <EmptyState icon={Users} title="No customers yet" description="Customers will appear once they sign up" />
      ) : (
        <div className="glass-card-elevated rounded-2xl overflow-hidden shadow-apple">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Email</TableHead><TableHead>Joined</TableHead><TableHead>Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {profiles.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.email || '—'}</TableCell>
                  <TableCell>{new Date(c.created_at).toLocaleDateString('en-GB')}</TableCell>
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
