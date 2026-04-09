import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { GraduationCap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

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
      <div className="px-5 pt-6 pb-6">
        <h1 className="text-2xl font-display font-black text-foreground mb-5">Enrolment Queue</h1>
        {enrolments.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No applications" description="New cleaner applications will appear here" />
        ) : (
          <div className="space-y-3">
            {enrolments.map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-card rounded-2xl p-4 shadow-soft border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{e.full_name}</h3>
                    <p className="text-xs text-muted-foreground">{e.phone} · {e.experience} yrs exp</p>
                  </div>
                  <Badge variant="outline" className="rounded-lg text-[9px] capitalize shrink-0">{e.status.replace('-', ' ')}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mb-3">Submitted {new Date(e.submitted_at).toLocaleDateString('en-GB')}</p>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 rounded-xl text-xs font-bold h-9 bg-primary text-primary-foreground">Approve</Button>
                  <Button size="sm" variant="outline" className="flex-1 rounded-xl text-xs font-bold h-9 text-destructive border-destructive/20">Reject</Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
