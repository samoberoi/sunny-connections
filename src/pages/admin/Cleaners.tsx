import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AdminLayout from '@/components/layout/AdminLayout';
import StarRating from '@/components/StarRating';
import EmptyState from '@/components/EmptyState';
import { UserCheck, Briefcase, PoundSterling, CalendarOff, Star, ShieldCheck, ChevronRight, Trophy, AlertTriangle, Trash2 } from 'lucide-react';
import { useCleaners } from '@/hooks/useCleaners';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminCleaners() {
  const { data: cleaners = [] } = useCleaners();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('rating');

  const deleteCleaner = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ['cleaners'] });
      setSelectedId(null);
      toast.success('Cleaner deleted');
    },
    onError: (err: any) => toast.error(err.message),
  });

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

  const enriched = useMemo(() => {
    return cleaners.map(c => {
      const cb = bookings.filter((b: any) => b.cleaner_id === c.id && b.status === 'completed');
      const earnings = cb.reduce((s: number, b: any) => s + Number(b.total_cost), 0);
      const cl = leaves.filter((l: any) => l.cleaner_id === c.id);
      return { ...c, jobCount: cb.length, earnings, leaveCount: cl.length };
    });
  }, [cleaners, bookings, leaves]);

  const sorted = useMemo(() => {
    const copy = [...enriched];
    if (sortBy === 'rating') copy.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'jobs') copy.sort((a, b) => b.jobCount - a.jobCount);
    else if (sortBy === 'earnings') copy.sort((a, b) => b.earnings - a.earnings);
    return copy;
  }, [enriched, sortBy]);

  const topRated = enriched.length > 0 ? [...enriched].sort((a, b) => b.rating - a.rating)[0] : null;
  const mostJobs = enriched.length > 0 ? [...enriched].sort((a, b) => b.jobCount - a.jobCount)[0] : null;
  const needsAttention = enriched.filter(c => c.rating > 0 && c.rating < 3);

  const selected = enriched.find(c => c.id === selectedId);

  return (
    <AdminLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-display font-black text-foreground">Cleaners</h1>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 rounded-xl h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="jobs">Most Jobs</SelectItem>
              <SelectItem value="earnings">Highest Earnings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Performance Rankings */}
        {enriched.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-5">
            {topRated && (
              <div className="bg-primary/10 rounded-2xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Trophy className="h-3 w-3 text-primary" strokeWidth={1.5} />
                  <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Top Rated</span>
                </div>
                <p className="font-semibold text-foreground text-sm truncate">{topRated.name}</p>
                <p className="text-[10px] text-muted-foreground">⭐ {topRated.rating}</p>
              </div>
            )}
            {mostJobs && (
              <div className="bg-primary/10 rounded-2xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Briefcase className="h-3 w-3 text-primary" strokeWidth={1.5} />
                  <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Most Jobs</span>
                </div>
                <p className="font-semibold text-foreground text-sm truncate">{mostJobs.name}</p>
                <p className="text-[10px] text-muted-foreground">{mostJobs.jobCount} completed</p>
              </div>
            )}
          </div>
        )}

        {needsAttention.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-3 mb-5 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" strokeWidth={1.5} />
            <p className="text-xs text-destructive">{needsAttention.length} cleaner{needsAttention.length > 1 ? 's' : ''} with low ratings need attention</p>
          </div>
        )}

        {cleaners.length === 0 ? (
          <EmptyState icon={UserCheck} title="No cleaners yet" description="Cleaners will appear once they are added" />
        ) : (
          <div className="space-y-2">
            {sorted.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedId(c.id)}
                className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3 cursor-pointer hover:bg-accent/30 transition-colors">
                <div className="w-11 h-11 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-sm shrink-0 relative">
                  {c.name[0]}
                  {c.verified && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <ShieldCheck className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={2} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground text-sm truncate">{c.name}</p>
                    <Badge className={`text-[8px] rounded-lg border-0 ${c.available ? 'bg-primary/10 text-primary-ink' : 'bg-muted text-muted-foreground'}`}>
                      {c.available ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5 text-primary" fill="hsl(78,85%,65%)" /> {c.rating}</span>
                    <span>{c.jobCount} jobs</span>
                    <span>£{c.earnings}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={!!selectedId} onOpenChange={open => !open && setSelectedId(null)}>
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader><DialogTitle className="font-display font-bold">{selected?.name || 'Cleaner'}</DialogTitle></DialogHeader>
            {selected && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-xl relative">
                    {selected.name[0]}
                    {selected.verified && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <ShieldCheck className="h-3 w-3 text-primary-foreground" strokeWidth={2} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{selected.name}</p>
                    <div className="flex items-center gap-1 mt-0.5"><Star className="h-3 w-3 text-primary" fill="hsl(78,85%,65%)" /><span className="text-xs text-muted-foreground">{selected.rating} ({selected.review_count} reviews)</span></div>
                    <p className="text-[10px] text-muted-foreground">{selected.experience} years · {selected.verified ? '✓ Certified' : 'Uncertified'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-primary/10 rounded-2xl p-3 text-center">
                    <Briefcase className="h-4 w-4 mx-auto mb-1 text-foreground" strokeWidth={1.5} />
                    <div className="text-lg font-display font-black text-foreground">{selected.jobCount}</div>
                    <div className="text-[9px] text-muted-foreground">Jobs Done</div>
                  </div>
                  <div className="bg-primary/10 rounded-2xl p-3 text-center">
                    <PoundSterling className="h-4 w-4 mx-auto mb-1 text-foreground" strokeWidth={1.5} />
                    <div className="text-lg font-display font-black text-foreground">£{selected.earnings}</div>
                    <div className="text-[9px] text-muted-foreground">Earned</div>
                  </div>
                  <div className="bg-primary/10 rounded-2xl p-3 text-center">
                    <CalendarOff className="h-4 w-4 mx-auto mb-1 text-foreground" strokeWidth={1.5} />
                    <div className="text-lg font-display font-black text-foreground">{selected.leaveCount}</div>
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
                {selected.user_id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full rounded-xl text-destructive border-destructive/20 mt-2">
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Cleaner
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display font-bold">Delete this cleaner?</AlertDialogTitle>
                        <AlertDialogDescription>This permanently removes the cleaner and their account.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                        <AlertDialogAction className="rounded-full bg-destructive text-destructive-foreground" onClick={() => deleteCleaner.mutate(selected.user_id!)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
