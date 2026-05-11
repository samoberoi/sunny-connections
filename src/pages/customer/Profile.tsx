import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, MapPin, LogOut, Plus, Trash2, Pencil, Check, X, Home, Heart, Bed, ShowerHead, Crown, Clock, Calendar, Star, HelpCircle, Wallet, Shield, Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import ReferralCard from '@/components/ReferralCard';
import DeleteAccountButton from '@/components/DeleteAccountButton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatDateUK } from '@/lib/date';

function BookingHistory({ userId }: { userId?: string }) {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['my-booking-history', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase.from('bookings').select('*').eq('customer_id', userId).order('date', { ascending: false }).limit(20);
      return data || [];
    },
    enabled: !!userId,
  });

  if (isLoading) return null;
  if (history.length === 0) return (
    <div className="bg-card rounded-3xl p-5 shadow-soft border border-border">
      <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2"><Clock className="h-4 w-4" /> Cleaning History</h3>
      <p className="text-sm text-muted-foreground">No bookings yet</p>
    </div>
  );

  return (
    <div className="bg-card rounded-3xl p-5 shadow-soft border border-border">
      <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2"><Clock className="h-4 w-4" /> Cleaning History</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {history.map((b: any) => (
          <div key={b.id} className="flex items-start gap-3 p-3 rounded-2xl bg-muted/50">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4 text-foreground" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{b.service_name}</p>
              <p className="text-[10px] text-muted-foreground">{formatDateUK(b.date)} · {b.duration}h</p>
              {b.cleaner_name && <p className="text-[10px] text-muted-foreground">by {b.cleaner_name}</p>}
            </div>
            <div className="text-right shrink-0">
              <Badge className={`rounded-full text-[9px] px-2 py-0.5 border-0 ${b.status === 'completed' ? 'bg-primary/15 text-primary' : b.status === 'cancelled' ? 'bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                {b.status}
              </Badge>
              {b.rating && (
                <div className="flex items-center gap-0.5 mt-1 justify-end">
                  <Star className="h-3 w-3 text-primary" fill="currentColor" />
                  <span className="text-[10px] font-bold">{b.rating}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addressLabels = ['Home', 'Home 2', 'Office', 'Office 2', 'Other'];
  const [newAddress, setNewAddress] = useState({ label: 'Home', line1: '', postcode: '', city: 'London' });
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user?.id) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setUploadingAvatar(true);
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${user.id}/avatar_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, cacheControl: '3600' });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const avatarUrl = urlData.publicUrl;
      const { error: dbErr } = await supabase.from('profiles').update({ avatar: avatarUrl }).eq('user_id', user.id);
      if (dbErr) throw dbErr;
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      toast.success('Profile picture updated!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const { data: profile } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ['my-addresses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at');
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: bookingStats } = useQuery({
    queryKey: ['my-booking-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, spent: 0 };
      const { data } = await supabase.from('bookings').select('total_cost, status').eq('customer_id', user.id).eq('status', 'completed');
      const completed = data || [];
      return { total: completed.length, spent: completed.reduce((s, b) => s + Number(b.total_cost), 0) };
    },
    enabled: !!user?.id,
  });

  const { data: favCount = 0 } = useQuery({
    queryKey: ['my-fav-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { data } = await supabase.from('favourite_cleaners').select('id').eq('customer_id', user.id);
      return data?.length || 0;
    },
    enabled: !!user?.id,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: { name?: string }) => {
      if (!user?.id) return;
      const { error } = await supabase.from('profiles').update(updates).eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Profile updated!'); queryClient.invalidateQueries({ queryKey: ['my-profile'] }); },
  });

  const addAddress = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      await supabase.from('addresses').insert({ user_id: user.id, ...newAddress });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-addresses'] }); setNewAddress({ label: 'Home', line1: '', postcode: '', city: 'London' }); setAddressDialogOpen(false); toast.success('Address added!'); },
  });

  const deleteAddress = useMutation({
    mutationFn: async (id: string) => { await supabase.from('addresses').delete().eq('id', id); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-addresses'] }); toast.success('Address removed'); },
  });

  const saveName = () => { if (editName.trim()) { updateProfile.mutate({ name: editName.trim() }); setEditingName(false); } };

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-14 pb-6 space-y-5">
          <div className="flex items-center gap-3 mb-4">
            <BackButton to="/home" />
            <h1 className="text-2xl font-display font-black text-foreground">Profile</h1>
          </div>

          {/* Avatar card */}
          <div className="bg-card rounded-3xl p-6 shadow-soft border border-border text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-primary/30" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-3xl">
                  {user?.name?.[0] || 'A'}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                aria-label="Change profile picture"
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md border-2 border-card disabled:opacity-50"
              >
                {uploadingAvatar ? <span className="text-[9px] font-bold">…</span> : <Pencil className="h-4 w-4" strokeWidth={2} />}
              </button>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleAvatarFile} />

            <div className="flex items-center justify-center gap-2 mb-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground text-background text-[11px] font-bold disabled:opacity-50"
              >
                <Camera className="h-3 w-3" strokeWidth={2} /> Scan face
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-foreground text-[11px] font-bold disabled:opacity-50"
              >
                <Upload className="h-3 w-3" strokeWidth={2} /> Upload photo
              </button>
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
            <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mt-1">
              <Smartphone className="h-3 w-3" strokeWidth={1.5} /> {user?.phone || '—'}
            </div>
            
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Cleans', value: bookingStats?.total || 0, icon: Home },
              { label: 'Spent', value: `£${bookingStats?.spent || 0}`, icon: Crown },
              { label: 'Favourites', value: favCount, icon: Heart },
            ].map(stat => (
              <div key={stat.label} className="bg-card rounded-3xl p-4 text-center shadow-soft border border-border">
                <stat.icon className="h-4 w-4 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
                <div className="text-xl font-display font-black text-foreground">{stat.value}</div>
                <div className="text-[9px] text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Property Details from onboarding */}
          {profile && profile.onboarding_completed && (
            <div className="bg-card rounded-3xl p-5 shadow-soft border border-border">
              <h3 className="font-display font-bold text-foreground text-sm mb-3">Property Details</h3>
              <div className="grid grid-cols-2 gap-3">
                {profile.bedrooms && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Bed className="h-3.5 w-3.5 text-foreground" strokeWidth={1.5} />
                    <span>{profile.bedrooms} bedroom{profile.bedrooms > 1 ? 's' : ''}</span>
                  </div>
                )}
                {profile.bathrooms && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShowerHead className="h-3.5 w-3.5 text-foreground" strokeWidth={1.5} />
                    <span>{profile.bathrooms} bathroom{profile.bathrooms > 1 ? 's' : ''}</span>
                  </div>
                )}
                {profile.property_size && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Home className="h-3.5 w-3.5 text-foreground" strokeWidth={1.5} />
                    <span className="capitalize">{profile.property_size}</span>
                  </div>
                )}
                {profile.budget_preference && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Crown className="h-3.5 w-3.5 text-foreground" strokeWidth={1.5} />
                    <span className="capitalize">{profile.budget_preference}</span>
                  </div>
                )}
              </div>
              {profile.preferred_day && <p className="text-xs text-muted-foreground mt-2">Preferred day: <span className="font-bold text-foreground">{profile.preferred_day}</span></p>}
              {profile.pet_info && <p className="text-xs text-muted-foreground mt-1">Pets/Allergies: {profile.pet_info}</p>}
            </div>
          )}

          {/* Addresses */}
          <div className="bg-card rounded-3xl p-5 shadow-soft border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-foreground">Addresses</h3>
              <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
                <DialogTrigger asChild>
                  <button className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center"><Plus className="h-4 w-4 text-background" strokeWidth={1.5} /></button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl">
                  <DialogHeader><DialogTitle>Add Address</DialogTitle></DialogHeader>
                  <div className="space-y-3 pt-2">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground mb-2">Label</p>
                      <div className="flex flex-wrap gap-2">
                        {addressLabels.map(l => (
                          <button key={l} onClick={() => setNewAddress({ ...newAddress, label: l })}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${newAddress.label === l ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'}`}>{l}</button>
                        ))}
                      </div>
                    </div>
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

          {/* Cleaning History */}
          <BookingHistory userId={user?.id} />

          {/* Quick links */}
          <div className="bg-card rounded-3xl p-5 shadow-soft border border-border space-y-2">
            <h3 className="font-display font-bold text-foreground text-sm mb-2">Quick Links</h3>
            {[
              { label: 'Wallet & Coins', icon: Wallet, to: '/wallet' },
              { label: 'Help & Support', icon: HelpCircle, to: '/help' },
              { label: 'Notifications', icon: Calendar, to: '/notifications' },
            ].map(link => (
              <button key={link.to} onClick={() => navigate(link.to)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-colors text-left">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <link.icon className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-bold text-foreground">{link.label}</span>
              </button>
            ))}
          </div>

          <div className="mb-2"><ReferralCard /></div>

          <Button onClick={async () => { await logout(); navigate('/'); }} variant="outline" className="w-full h-12 rounded-full text-destructive border-2 border-destructive/20 hover:bg-destructive/5 font-bold">
            <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} /> Log Out
          </Button>
          <DeleteAccountButton />
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
