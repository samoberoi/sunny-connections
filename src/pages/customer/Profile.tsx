import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, MapPin, LogOut, Plus, Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newAddress, setNewAddress] = useState({ label: 'Home', line1: '', postcode: '', city: 'London' });
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);

  const { data: addresses = [] } = useQuery({
    queryKey: ['my-addresses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at');
      return data || [];
    },
    enabled: !!user?.id,
  });

  const addAddress = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await supabase.from('addresses').insert({
        user_id: user.id, label: newAddress.label, line1: newAddress.line1,
        postcode: newAddress.postcode, city: newAddress.city,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
      setNewAddress({ label: 'Home', line1: '', postcode: '', city: 'London' });
      setAddressDialogOpen(false);
      toast.success('Address added!');
    },
  });

  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
      toast.success('Address removed');
    },
  });

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <BackButton />
            <h1 className="text-2xl font-display font-black text-foreground">Profile</h1>
          </div>

          <div className="gradient-neon rounded-3xl p-8 text-center mb-6 shadow-neon">
            <div className="w-20 h-20 rounded-3xl bg-foreground mx-auto mb-4 flex items-center justify-center text-card font-bold text-2xl">
              {user?.name?.[0] || 'A'}
            </div>
            <h2 className="text-xl font-display font-black text-foreground">{user?.name || 'Guest'}</h2>
            <div className="flex items-center justify-center gap-2 text-sm text-foreground/60 mt-1">
              <Smartphone className="h-3 w-3" strokeWidth={1.5} /> {user?.phone || '07700 900000'}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5 mb-4 shadow-apple">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-foreground text-sm">Saved Addresses</h3>
              <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
                <DialogTrigger asChild>
                  <button className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                  </button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader><DialogTitle>Add Address</DialogTitle></DialogHeader>
                  <div className="space-y-3 pt-2">
                    <Input placeholder="Label (e.g. Home, Office)" value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })} className="h-12 rounded-xl bg-muted/50 border-0" />
                    <Input placeholder="Address line" value={newAddress.line1} onChange={e => setNewAddress({ ...newAddress, line1: e.target.value })} className="h-12 rounded-xl bg-muted/50 border-0" />
                    <Input placeholder="Postcode" value={newAddress.postcode} onChange={e => setNewAddress({ ...newAddress, postcode: e.target.value })} className="h-12 rounded-xl bg-muted/50 border-0" />
                    <Button onClick={() => addAddress.mutate()} disabled={!newAddress.line1 || !newAddress.postcode} className="w-full gradient-neon text-foreground rounded-xl font-bold">Save Address</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved addresses yet</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr: any) => (
                  <div key={addr.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-accent-foreground">{addr.label}</p>
                      <p className="text-sm font-medium text-foreground">{addr.line1}</p>
                      <p className="text-xs text-muted-foreground">{addr.city}, {addr.postcode}</p>
                    </div>
                    <button onClick={() => deleteAddress.mutate(addr.id)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-4 w-4 text-destructive" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="gradient-pink rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                <Share2 className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-foreground text-sm">Refer a Mate</h3>
                <p className="text-xs text-foreground/60">Know someone who hates hoovering? Share Clean Fit.</p>
              </div>
            </div>
          </div>

          <Button onClick={() => { logout(); navigate('/'); }} variant="outline" className="w-full h-12 rounded-2xl text-destructive border-destructive/20 hover:bg-destructive/5 font-bold">
            <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} /> Log Out
          </Button>
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
