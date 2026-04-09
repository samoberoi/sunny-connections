import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { Tag, Percent, Calendar, Trash2 } from 'lucide-react';
import { useAllCoupons, useToggleCoupon, useCreateCoupon, useDeleteCoupon } from '@/hooks/useCoupons';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminCoupons() {
  const { data: coupons = [] } = useAllCoupons();
  const toggleCoupon = useToggleCoupon();
  const createCoupon = useCreateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: '', description: '', discount_percent: 10, max_uses: 100, expires_at: '' });

  const handleCreate = () => {
    if (!form.code || !form.description || !form.expires_at) {
      toast.error('Fill all fields');
      return;
    }
    createCoupon.mutate(form, {
      onSuccess: () => {
        toast.success('Coupon created!');
        setOpen(false);
        setForm({ code: '', description: '', discount_percent: 10, max_uses: 100, expires_at: '' });
      },
    });
  };

  return (
    <AdminLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-display font-black text-foreground">Coupons</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-foreground text-background rounded-full text-xs font-bold h-9 px-4">Create</Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-sm mx-4">
              <DialogHeader>
                <DialogTitle className="font-display font-bold">New Coupon</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="CODE (e.g. SAVE20)" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="rounded-2xl font-mono uppercase" />
                <Textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-2xl resize-none" rows={2} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Discount %</label>
                    <Input type="number" min={1} max={100} value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: Number(e.target.value) }))} className="rounded-2xl" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Max Uses</label>
                    <Input type="number" min={1} value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: Number(e.target.value) }))} className="rounded-2xl" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Expires At</label>
                  <Input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} className="rounded-2xl" />
                </div>
                <Button onClick={handleCreate} disabled={createCoupon.isPending} className="w-full h-11 rounded-full font-bold">
                  {createCoupon.isPending ? 'Creating...' : 'Create Coupon'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {coupons.length === 0 ? (
          <EmptyState icon={Tag} title="No coupons" description="Create your first promotional coupon" />
        ) : (
          <div className="space-y-3">
            {coupons.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-card rounded-2xl p-4 shadow-soft border border-border">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground text-sm">{c.code}</span>
                      {!c.active && <Badge variant="secondary" className="text-[8px]">Inactive</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={c.active} onCheckedChange={(checked) => toggleCoupon.mutate({ id: c.id, active: checked })} />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                      onClick={() => {
                        if (confirm('Delete this coupon?')) {
                          deleteCoupon.mutate(c.id, { onSuccess: () => toast.success('Deleted') });
                        }
                      }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><Percent className="h-3 w-3" />{c.discount_percent}% off</span>
                  <span>{c.used_count}/{c.max_uses} used</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{c.expires_at}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
