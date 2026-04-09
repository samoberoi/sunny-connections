import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { Settings } from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { motion } from 'framer-motion';

export default function AdminServices() {
  const { data: services = [] } = useServices();

  return (
    <AdminLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-display font-black text-foreground">Services</h1>
          <Button className="bg-foreground text-background rounded-full text-xs font-bold h-9 px-4">Add Service</Button>
        </div>
        {services.length === 0 ? (
          <EmptyState icon={Settings} title="No services" description="Add your first service to get started" />
        ) : (
          <div className="space-y-3">
            {services.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-card rounded-2xl p-4 shadow-soft border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{s.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                  </div>
                  <Badge variant="outline" className="capitalize rounded-lg text-[9px] shrink-0">{s.category}</Badge>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-display font-black text-foreground">£{s.rate_per_hour}/hr</span>
                    <span>{s.min_duration}–{s.max_duration}h</span>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-xl text-xs h-8">Edit</Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
