import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { Tag, Percent, Calendar } from 'lucide-react';
import { useCoupons } from '@/hooks/useCoupons';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function AdminCoupons() {
  const { data: coupons = [] } = useCoupons();

  return (
    <AdminLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-display font-black text-foreground">Coupons</h1>
          <Button className="bg-foreground text-background rounded-full text-xs font-bold h-9 px-4">Create</Button>
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
                    <span className="font-mono font-bold text-foreground text-sm">{c.code}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                  </div>
                  <Switch checked={c.active} />
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
