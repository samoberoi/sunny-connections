import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { Settings, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useServices, type ServiceRow } from '@/hooks/useServices';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const emptyService = { name: '', description: '', category: 'cleaning' as const, service_mode: 'both', rate_per_hour: 15, min_duration: 1, max_duration: 4, icon: 'Sparkles' };

export default function AdminServices() {
  const { data: services = [] } = useServices();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [form, setForm] = useState(emptyService);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openAdd = () => { setEditing(null); setForm(emptyService); setDialogOpen(true); };
  const openEdit = (s: ServiceRow) => {
    setEditing(s);
    setForm({ name: s.name, description: s.description, category: s.category, service_mode: (s as any).service_mode || 'both', rate_per_hour: s.rate_per_hour, min_duration: s.min_duration, max_duration: s.max_duration, icon: s.icon });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase.from('services').update({
          name: form.name, description: form.description, category: form.category as any,
          service_mode: form.service_mode, rate_per_hour: form.rate_per_hour,
          min_duration: form.min_duration, max_duration: form.max_duration, icon: form.icon,
        }).eq('id', editing.id);
        if (error) throw error;
        toast.success('Service updated');
      } else {
        const { error } = await supabase.from('services').insert({
          name: form.name, description: form.description, category: form.category as any,
          service_mode: form.service_mode, rate_per_hour: form.rate_per_hour,
          min_duration: form.min_duration, max_duration: form.max_duration, icon: form.icon,
        });
        if (error) throw error;
        toast.success('Service created');
      }
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setDialogOpen(false);
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('services').update({ active: false }).eq('id', id);
      if (error) throw error;
      toast.success('Service removed');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setDeleteConfirm(null);
    } catch { toast.error('Failed to delete'); }
  };

  const modeLabel = (mode: string) => mode === 'express' ? '⚡ Express' : mode === 'scheduled' ? '📅 Scheduled' : '🔄 Both';

  return (
    <AdminLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-display font-black text-foreground">Services</h1>
          <Button onClick={openAdd} className="bg-foreground text-background rounded-full text-xs font-bold h-9 px-4">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Service
          </Button>
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
                  <div className="flex gap-1 shrink-0">
                    <Badge variant="outline" className="capitalize rounded-lg text-[9px]">{s.category === 'cleaning' ? 'House Cleaning' : 'Housekeeping'}</Badge>
                    <Badge variant="secondary" className="rounded-lg text-[9px]">{modeLabel((s as any).service_mode || 'both')}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-display font-black text-foreground">£{s.rate_per_hour}/hr</span>
                    <span>{s.min_duration}–{s.max_duration}h</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(s)} className="rounded-xl text-xs h-8">
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    {deleteConfirm === s.id ? (
                      <div className="flex gap-1">
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)} className="rounded-xl text-xs h-8">Yes</Button>
                        <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)} className="rounded-xl text-xs h-8">No</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(s.id)} className="rounded-xl text-xs h-8 text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Service name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))}
                  className="w-full h-10 rounded-xl border border-border bg-card px-3 text-sm">
                  <option value="cleaning">House Cleaning</option>
                  <option value="housekeeping">Housekeeping</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Mode</label>
                <select value={form.service_mode} onChange={e => setForm(f => ({ ...f, service_mode: e.target.value }))}
                  className="w-full h-10 rounded-xl border border-border bg-card px-3 text-sm">
                  <option value="both">Both</option>
                  <option value="express">Express Only</option>
                  <option value="scheduled">Scheduled Only</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-bold text-muted-foreground">£/hr</label>
                <Input type="number" value={form.rate_per_hour} onChange={e => setForm(f => ({ ...f, rate_per_hour: +e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Min hrs</label>
                <Input type="number" value={form.min_duration} onChange={e => setForm(f => ({ ...f, min_duration: +e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Max hrs</label>
                <Input type="number" value={form.max_duration} onChange={e => setForm(f => ({ ...f, max_duration: +e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Icon name</label>
              <Input placeholder="Sparkles" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-xl bg-foreground text-background font-bold">
              {saving ? 'Saving...' : editing ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
