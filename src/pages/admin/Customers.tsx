import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { Users, CalendarDays, PoundSterling, Crown, ChevronRight, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminCustomers() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('recent');

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      setSelectedId(null);
      toast.success('User deleted');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-all-bookings-stats'],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('customer_id, total_cost, status, date, service_name');
      return data || [];
    },
  });

  const enriched = useMemo(() => {
    return profiles.map((p: any) => {
      const cb = bookings.filter((b: any) => b.customer_id === p.user_id && b.status === 'completed');
      const spent = cb.reduce((s: number, b: any) => s + Number(b.total_cost), 0);
      const services = cb.map((b: any) => b.service_name);
      const topService = services.length > 0 ? services.sort((a: string, b: string) => services.filter((v: string) => v === b).length - services.filter((v: string) => v === a).length)[0] : null;
      return { ...p, bookingCount: cb.length, spent, topService };
    });
  }, [profiles, bookings]);

  const sorted = useMemo(() => {
    const copy = [...enriched];
    if (sortBy === 'bookings') copy.sort((a, b) => b.bookingCount - a.bookingCount);
    else if (sortBy === 'spent') copy.sort((a, b) => b.spent - a.spent);
    else copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return copy;
  }, [enriched, sortBy]);

  const selected = enriched.find((p: any) => p.user_id === selectedId);
  const customerBookings = bookings.filter((b: any) => b.customer_id === selectedId);

  return (
    <AdminLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-display font-black text-foreground">Customers</h1>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 rounded-xl h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="bookings">Most Bookings</SelectItem>
              <SelectItem value="spent">Top Spenders</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-card rounded-2xl p-3 text-center border border-border">
            <p className="text-xl font-display font-black text-foreground">{profiles.length}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Total</p>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center border border-border">
            <p className="text-xl font-display font-black text-foreground">{enriched.filter(e => e.bookingCount > 0).length}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Active</p>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center border border-border">
            <p className="text-xl font-display font-black text-foreground">£{enriched.reduce((s, e) => s + e.spent, 0).toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Revenue</p>
          </div>
        </div>

        {sorted.length === 0 ? (
          <EmptyState icon={Users} title="No customers yet" description="Customers will appear once they sign up" />
        ) : (
          <div className="space-y-2">
            {sorted.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedId(c.user_id)}
                className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3 cursor-pointer hover:bg-accent/30 transition-colors">
                <div className="w-11 h-11 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-sm shrink-0">
                  {c.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">{c.bookingCount} bookings · £{c.spent}</p>
                  {c.topService && <p className="text-[10px] text-primary truncate">{c.topService}</p>}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={!!selectedId} onOpenChange={open => !open && setSelectedId(null)}>
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader><DialogTitle className="font-display font-bold">{selected?.name || 'Customer'}</DialogTitle></DialogHeader>
            {selected && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-xl">
                    {selected.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{selected.name}</p>
                    <p className="text-xs text-muted-foreground">{selected.phone} · {selected.email || 'No email'}</p>
                    <p className="text-[10px] text-muted-foreground">Joined {new Date(selected.created_at).toLocaleDateString('en-GB')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-primary/10 rounded-2xl p-3 text-center">
                    <CalendarDays className="h-4 w-4 mx-auto mb-1 text-foreground" strokeWidth={1.5} />
                    <div className="text-lg font-display font-black text-foreground">{selected.bookingCount}</div>
                    <div className="text-[9px] text-muted-foreground">Bookings</div>
                  </div>
                  <div className="bg-primary/10 rounded-2xl p-3 text-center">
                    <PoundSterling className="h-4 w-4 mx-auto mb-1 text-foreground" strokeWidth={1.5} />
                    <div className="text-lg font-display font-black text-foreground">£{selected.spent}</div>
                    <div className="text-[9px] text-muted-foreground">Spent</div>
                  </div>
                  <div className="bg-primary/10 rounded-2xl p-3 text-center">
                    <Crown className="h-4 w-4 mx-auto mb-1 text-foreground" strokeWidth={1.5} />
                    <div className="text-lg font-display font-black text-foreground capitalize">{selected.budget_preference || 'standard'}</div>
                    <div className="text-[9px] text-muted-foreground">Tier</div>
                  </div>
                </div>
                {selected.onboarding_completed && (
                  <div className="bg-muted/30 rounded-2xl p-4 space-y-1">
                    <p className="text-xs font-bold text-foreground mb-2">Property Info</p>
                    {selected.bedrooms && <p className="text-xs text-muted-foreground">{selected.bedrooms} bed · {selected.bathrooms || 1} bath · {selected.property_size || 'medium'}</p>}
                    {selected.preferred_day && <p className="text-xs text-muted-foreground">Preferred: {selected.preferred_day}</p>}
                    {selected.pet_info && <p className="text-xs text-muted-foreground">Pets: {selected.pet_info}</p>}
                  </div>
                )}
                {customerBookings.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-foreground mb-2">Recent Bookings</p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {customerBookings.slice(0, 10).map((b: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs py-1">
                          <span className="text-muted-foreground truncate mr-2">{b.service_name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-foreground">{b.date}</span>
                            <Badge className={`text-[8px] rounded-lg border-0 capitalize ${b.status === 'completed' ? 'bg-primary/10 text-primary-ink' : b.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>{b.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full rounded-xl text-destructive border-destructive/20 mt-2">
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete User
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display font-bold">Delete this customer?</AlertDialogTitle>
                      <AlertDialogDescription>This permanently removes the user and all their data. This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                      <AlertDialogAction className="rounded-full bg-destructive text-destructive-foreground" onClick={() => selected?.user_id && deleteUser.mutate(selected.user_id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                        <div key={idx} className="flex justify-between text-xs py-1">
                          <span className="text-muted-foreground truncate mr-2">{b.service_name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-foreground">{b.date}</span>
                            <Badge className={`text-[8px] rounded-lg border-0 capitalize ${b.status === 'completed' ? 'bg-primary/10 text-primary-ink' : b.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>{b.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
