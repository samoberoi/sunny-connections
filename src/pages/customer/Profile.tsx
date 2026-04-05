import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, MapPin, LogOut, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import ReferralCard from '@/components/ReferralCard';
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
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editingPhone, setEditingPhone] = useState(false);
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  const { data: addresses = [] } = useQuery({
    queryKey: ['my-addresses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at');
      return data || [];
    },
    enabled: !!user?.id,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: { name?: string; phone?: string }) => {
      if (!user?.id) return;
      const { error } = await supabase.from('profiles').update(updates).eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Profile updated!'); queryClient.invalidateQueries({ queryKey: ['profile'] }); },
    onError: () => toast.error('Failed to update profile'),
  });

  const addAddress = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await supabase.from('addresses').insert({ user_id: user.id, label: newAddress.label, line1: newAddress.line1, postcode: newAddress.postcode, city: newAddress.city });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-addresses'] }); setNewAddress({ label: 'Home', line1: '', postcode: '', city: 'London' }); setAddressDialogOpen(false); toast.success('Address added!'); },
  });

  const deleteAddress = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('addresses').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-addresses'] }); toast.success('Address removed'); },
  });

  const saveName = () => { if (editName.trim()) { updateProfile.mutate({ name: editName.trim() }); setEditingName(false); } };
  const savePhone = () => { if (editPhone.trim()) { updateProfile.mutate({ phone: editPhone.trim() }); setEditingPhone(false); } };

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-14 pb-6">
          <div className="flex items-center gap-3 mb-8">
            <BackButton to="/home" />
            <h1 className="text-2xl font-display font-black text-foreground">Profile</h1>
          </div>

          {/* Avatar card */}
          <div className="bg-card rounded-3xl p-6 shadow-soft border border-border text-center mb-5">
            <div className="w-20 h-20 rounded-full bg-foreground mx-auto mb-4 flex items-center justify-center text-background font-bold text-2xl">
              {user?.name?.[0] || 'A'}
            </div>

            {editingName ? (
              <div className="flex items-center justify-center gap-2 mb-1">
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-9 w-48 text-center rounded-full" autoFocus />
                <button onClick={saveName} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><Check className="h-4 w-4 text-primary-foreground" /></button>
                <button onClick={() => setEditingName(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><X className="h-4 w-4 text-foreground" /></button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-display font-black text-foreground">{user?.name || 'Guest'}</h2>
                <button onClick={() => { setEditName(user?.name || ''); setEditingName(true); }} className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center"><Pencil className="h-3 w-3 text-foreground" /></button>
              </div>
            )}

            {editingPhone ? (
              <div className="flex items-center justify-center gap-2 mt-1">
                <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="h-9 w-48 text-center rounded-full" autoFocus />
                <button onClick={savePhone} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><Check className="h-4 w-4 text-primary-foreground" /></button>
                <button onClick={() => setEditingPhone(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><X className="h-4 w-4 text-foreground" /></button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1">
                <Smartphone className="h-3 w-3" strokeWidth={1.5} /> {user?.phone || '—'}
                <button onClick={() => { setEditPhone(user?.phone || ''); setEditingPhone(true); }} className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center"><Pencil className="h-2.5 w-2.5 text-foreground" /></button>
              </div>
            )}
          </div>

          {/* Addresses */}
          <div className="bg-card rounded-3xl p-5 mb-5 shadow-soft border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-foreground">Addresses</h3>
              <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
                <DialogTrigger asChild>
                  <button className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center"><Plus className="h-4 w-4 text-background" strokeWidth={1.5} /></button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl">
                  <DialogHeader><DialogTitle>Add Address</DialogTitle></DialogHeader>
                  <div className="space-y-3 pt-2">
                    <Input placeholder="Label (e.g. Home)" value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })} className="h-12 rounded-2xl" />
                    <Input placeholder="Address line" value={newAddress.line1} onChange={e => setNewAddress({ ...newAddress, line1: e.target.value })} className="h-12 rounded-2xl" />
                    <Input placeholder="Postcode" value={newAddress.postcode} onChange={e => setNewAddress({ ...newAddress, postcode: e.target.value })} className="h-12 rounded-2xl" />
                    <Button onClick={() => addAddress.mutate()} disabled={!newAddress.line1 || !newAddress.postcode} className="w-full rounded-full font-bold bg-foreground text-background">Save</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {addresses.length === 0 ? <p className="text-sm text-muted-foreground">No saved addresses yet</p> : (
              <div className="space-y-3">
                {addresses.map((addr: any) => (
                  <div key={addr.id} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 mt-0.5"><MapPin className="h-4 w-4 text-foreground" strokeWidth={1.5} /></div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground">{addr.label}</p>
                      <p className="text-sm text-muted-foreground">{addr.line1}, {addr.postcode}</p>
                    </div>
                    <button onClick={() => deleteAddress.mutate(addr.id)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" strokeWidth={1.5} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-5"><ReferralCard /></div>

          <Button onClick={() => { logout(); navigate('/'); }} variant="outline" className="w-full h-12 rounded-full text-destructive border-2 border-destructive/20 hover:bg-destructive/5 font-bold">
            <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} /> Log Out
          </Button>
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
