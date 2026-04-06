import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { Users, CalendarDays, PoundSterling, MapPin, Heart, Crown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminCustomers() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const selected = profiles.find((p: any) => p.user_id === selectedId);
  const customerBookings = bookings.filter((b: any) => b.customer_id === selectedId);
  const completedBookings = customerBookings.filter((b: any) => b.status === 'completed');
  const totalSpent = completedBookings.reduce((s: number, b: any) => s + Number(b.total_cost), 0);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-display font-black text-foreground mb-6">Customers</h1>

      {/* Detail drawer */}
      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
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
                  <div className="text-lg font-display font-black text-foreground">{completedBookings.length}</div>
                  <div className="text-[9px] text-muted-foreground">Bookings</div>
                </div>
                <div className="bg-primary/10 rounded-2xl p-3 text-center">
                  <PoundSterling className="h-4 w-4 mx-auto mb-1 text-foreground" strokeWidth={1.5} />
                  <div className="text-lg font-display font-black text-foreground">£{totalSpent}</div>
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
                    {customerBookings.slice(0, 10).map((b: any) => (
                      <div key={b.date + b.service_name} className="flex justify-between text-xs py-1">
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

      {profiles.length === 0 ? (
        <EmptyState icon={Users} title="No customers yet" description="Customers will appear once they sign up" />
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden">
          <Table>
            <TableHeader><TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Bookings</TableHead>
              <TableHead className="font-semibold">Spent</TableHead>
              <TableHead className="font-semibold">Tier</TableHead>
              <TableHead className="font-semibold">Joined</TableHead>
              <TableHead className="font-semibold w-20"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {profiles.map((c: any) => {
                const cb = bookings.filter((b: any) => b.customer_id === c.user_id && b.status === 'completed');
                const spent = cb.reduce((s: number, b: any) => s + Number(b.total_cost), 0);
                return (
                  <TableRow key={c.id} className="hover:bg-accent/50">
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-sm">{c.phone}</TableCell>
                    <TableCell className="text-sm">{cb.length}</TableCell>
                    <TableCell className="font-display font-bold text-foreground">£{spent}</TableCell>
                    <TableCell><Badge className="text-[9px] rounded-lg border-0 capitalize bg-primary/10 text-primary-ink">{c.budget_preference || 'standard'}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString('en-GB')}</TableCell>
                    <TableCell><Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => setSelectedId(c.user_id)}>View</Button></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
}
