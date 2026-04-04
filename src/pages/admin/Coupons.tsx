import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { Tag } from 'lucide-react';
import { useCoupons } from '@/hooks/useCoupons';

export default function AdminCoupons() {
  const { data: coupons = [] } = useCoupons();

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Coupons & Promotions</h1>
        <Button className="gradient-blue text-primary-foreground rounded-xl shadow-blue text-xs">Create Coupon</Button>
      </div>
      {coupons.length === 0 ? (
        <EmptyState icon={Tag} title="No coupons" description="Create your first promotional coupon" />
      ) : (
        <div className="glass-card-elevated rounded-2xl overflow-hidden shadow-apple">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Code</TableHead><TableHead>Description</TableHead><TableHead>Discount</TableHead><TableHead>Uses</TableHead><TableHead>Active</TableHead><TableHead>Expires</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {coupons.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-bold text-xs">{c.code}</TableCell>
                  <TableCell>{c.description}</TableCell>
                  <TableCell>{c.discount_percent}%</TableCell>
                  <TableCell>{c.used_count}/{c.max_uses}</TableCell>
                  <TableCell><Switch checked={c.active} /></TableCell>
                  <TableCell>{c.expires_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
}
