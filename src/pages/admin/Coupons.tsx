import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/components/layout/AdminLayout';
import { coupons } from '@/data/mockData';

export default function AdminCoupons() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Coupons & Promotions</h1>
        <Button className="gradient-primary text-primary-foreground">Create Coupon</Button>
      </div>
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Expires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-mono font-bold">{c.code}</TableCell>
                <TableCell>{c.description}</TableCell>
                <TableCell>{c.discountPercent}%</TableCell>
                <TableCell>{c.usedCount}/{c.maxUses}</TableCell>
                <TableCell><Switch checked={c.active} /></TableCell>
                <TableCell>{c.expiresAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
