import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Plus, Check, X, Calendar, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AdminOffers() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [code, setCode] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [maxClaims, setMaxClaims] = useState(100);

  const { data: offers = [] } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: async () => {
      const { data } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const createOffer = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('offers').insert({
        title, description, discount_percent: discountPercent,
        code: code.toUpperCase() || null, valid_from: validFrom, valid_until: validUntil,
        max_claims: maxClaims,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      setDialogOpen(false);
      setTitle(''); setDescription(''); setCode(''); setValidFrom(''); setValidUntil('');
      toast.success('Offer created!');
    },
    onError: () => toast.error('Failed to create offer'),
  });

  const toggleOffer = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await supabase.from('offers').update({ active }).eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-offers'] }),
  });

  return (
    <AdminLayout>
      <div className="px-5 pt-6 pb-28">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-black text-foreground">Offers</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Seasonal deals & vouchers</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center shadow-soft">
                <Plus className="h-4 w-4 text-background" strokeWidth={1.5} />
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader><DialogTitle className="font-display font-bold">New Offer</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <Input placeholder="Title (e.g. Summer Sale)" value={title} onChange={e => setTitle(e.target.value)} className="h-12 rounded-2xl" />
                <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="h-12 rounded-2xl" />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Discount %" type="number" value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))} className="h-12 rounded-2xl" />
                  <Input placeholder="Code (optional)" value={code} onChange={e => setCode(e.target.value)} className="h-12 rounded-2xl font-mono uppercase" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">From</label>
                    <Input type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)} className="h-12 rounded-2xl mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Until</label>
                    <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="h-12 rounded-2xl mt-1" />
                  </div>
                </div>
                <Input placeholder="Max claims" type="number" value={maxClaims} onChange={e => setMaxClaims(Number(e.target.value))} className="h-12 rounded-2xl" />
                <Button onClick={() => createOffer.mutate()} disabled={!title || !validFrom || !validUntil || createOffer.isPending}
                  className="w-full rounded-full font-bold bg-foreground text-background h-12 disabled:opacity-40">
                  Create Offer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {offers.length === 0 ? (
          <EmptyState icon={Gift} title="No offers yet" description="Create seasonal deals to engage customers" />
        ) : (
          <div className="space-y-3">
            {offers.map((offer: any) => (
              <motion.div key={offer.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-3xl p-5 shadow-soft border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-foreground text-sm">{offer.title}</h3>
                      <Badge className={`text-[9px] rounded-lg font-medium border-0 ${offer.active ? 'bg-primary/10 text-primary-ink' : 'bg-muted text-muted-foreground'}`}>
                        {offer.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{offer.description}</p>
                  </div>
                  <Switch checked={offer.active} onCheckedChange={(checked) => toggleOffer.mutate({ id: offer.id, active: checked })} />
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><Percent className="h-3 w-3" /> {offer.discount_percent}% off</span>
                  {offer.code && <span className="font-mono font-bold text-foreground bg-primary/10 px-2 py-0.5 rounded">{offer.code}</span>}
                  <span>{offer.claimed_count}/{offer.max_claims} claimed</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> {offer.valid_from} → {offer.valid_until}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
