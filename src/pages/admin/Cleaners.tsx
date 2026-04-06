import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminLayout from '@/components/layout/AdminLayout';
import StarRating from '@/components/StarRating';
import EmptyState from '@/components/EmptyState';
import { UserCheck, Briefcase, PoundSterling, CalendarOff, Star } from 'lucide-react';
import { useCleaners } from '@/hooks/useCleaners';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminCleaners() {
  const { data: cleaners = [] } = useCleaners();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-cleaner-bookings'],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('cleaner_id, total_cost, status, date, service_name');
      return data || [];
    },
  });

  const { data: leaves = [] } = useQuery({
    queryKey: ['admin-cleaner-leaves'],
    queryFn: async () => {
      const { data } = await supabase.from('cleaner_leaves').select('*');
      return data || [];
    },
  });

  const selected = cleaners.find(c => c.id === selectedId);
  const cleanerBookings = bookings.filter((b: any) => b.cleaner_id === selectedId);
  const completed = cleanerBookings.filter((b: any) => b.status === 'completed');
  const earnings = completed.reduce((s: number, b: any) => s + Number(b.total_cost), 0);
  const cleanerLeaves = leaves.filter((l: any) => l.cleaner_id === selectedId);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-display font-black text-foreground mb-6">Cleaners</h1>

      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader><DialogTitle className="font-display font-bold">{selected?.name || 'Cleaner'}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-xl">
                  {selected.name[0]}
                </div>
                <div>
                  <p className="font-bold text-foreground">{selected.name}</p>
                  <div className="flex items-center gap-1 mt-0.5"><Star className="h-3 w-3 text-primary" fill="hsl(78,85%,65%)" /><span className="text-xs text-muted-foreground">{selected.rating} ({selected.review_count} reviews)</span></div>
                  <p className="text-[10px] text-muted-foreground">{selected.experience} years · {selected.verified ? '✓ Verified' : 'Unverified'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-primary/10 rounded-2xl p-3 text-center">
                  <Briefcase className="h-4 w-4 mx-auto mb-1 text-foreground" strokeWidth={1.5} />
                  <div className="text-lg font-display font-black text-foreground">{completed.length}</div>
                  <div className="text-[9px] text-muted-foreground">Jobs Done</div>
                </div>
                <div className="bg-primary/10 rounded-2xl p-3 text-center">
                  <PoundSterling className="h-4 w-4 mx-auto mb-1 text-foreground" strokeWidth={1.5} />
                  <div className="text-lg font-display font-black text-foreground">£{earnings}</div>
                  <div className="text-[9px] text-muted-foreground">Earned</div>
                </div>
                <div className="bg-primary/10 rounded-2xl p-3 text-center">
                  <CalendarOff className="h-4 w-4 mx-auto mb-1 text-foreground" strokeWidth={1.5} />
                  <div className="text-lg font-display font-black text-foreground">{cleanerLeaves.length}</div>
                  <div className="text-[9px] text-muted-foreground">Leaves</div>
                </div>
              </div>

              {selected.specialisations.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-foreground mb-2">Specialisations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.specialisations.map((s: string) => (
                      <Badge key={s} className="rounded-full text-[10px] bg-primary/15 text-foreground border-0">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {cleaners.length === 0 ? (
        <EmptyState icon={UserCheck} title="No cleaners yet" description="Cleaners will appear once they are added" />
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden">
          <Table>
            <TableHeader><TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Rating</TableHead>
              <TableHead className="font-semibold">Jobs</TableHead>
              <TableHead className="font-semibold">Earned</TableHead>
              <TableHead className="font-semibold">Experience</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold w-20"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {cleaners.map(c => {
                const cb = bookings.filter((b: any) => b.cleaner_id === c.id && b.status === 'completed');
                const e = cb.reduce((s: number, b: any) => s + Number(b.total_cost), 0);
                return (
                  <TableRow key={c.id} className="hover:bg-accent/50">
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell><StarRating rating={Math.round(c.rating)} readonly size="sm" /></TableCell>
                    <TableCell className="text-sm">{cb.length}</TableCell>
                    <TableCell className="font-display font-bold text-foreground">£{e}</TableCell>
                    <TableCell className="text-sm">{c.experience} yrs</TableCell>
                    <TableCell><Badge className={`rounded-lg text-[10px] border-0 ${c.available ? 'bg-primary/10 text-primary-ink' : 'bg-muted text-muted-foreground'}`}>{c.available ? 'Online' : 'Offline'}</Badge></TableCell>
                    <TableCell><Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => setSelectedId(c.id)}>View</Button></TableCell>
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
