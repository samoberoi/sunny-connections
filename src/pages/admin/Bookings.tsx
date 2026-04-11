import { useEffect, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import BackButton from '@/components/BackButton';
import { CalendarDays, MapPin, MoreHorizontal, XCircle, UserCheck, Clock, Star, Camera, CreditCard, Tag, ChevronRight, Search, CheckCircle2, User, Briefcase } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/15 text-warning-foreground border-warning/20',
  assigned: 'bg-accent text-accent-foreground border-accent',
  'en-route': 'bg-secondary text-secondary-foreground border-secondary',
  'otp-verified': 'bg-muted text-muted-foreground border-muted',
  'in-progress': 'bg-primary/10 text-primary border-primary/20',
  completed: 'bg-primary/15 text-primary-ink border-primary/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function AdminBookings() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assignDialogBookingId, setAssignDialogBookingId] = useState<string | null>(null);
  const [cleanerSearch, setCleanerSearch] = useState('');

  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-all-bookings'],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(500);
      return data || [];
    },
  });

  const { data: allCleaners = [] } = useQuery({
    queryKey: ['admin-all-cleaners-for-assign'],
    queryFn: async () => {
      const { data } = await supabase.from('cleaners').select('id, name, user_id, specialisations, available, verified, rating, review_count, address_postcode');
      return data || [];
    },
  });

  const { data: cleanerLocations = [] } = useQuery({
    queryKey: ['admin-cleaner-locations'],
    queryFn: async () => {
      const { data } = await supabase.from('cleaner_locations').select('cleaner_id, latitude, longitude');
      return data || [];
    },
  });

  // Count active jobs per cleaner
  const { data: activeJobCounts = [] } = useQuery({
    queryKey: ['admin-cleaner-active-jobs'],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('cleaner_id')
        .in('status', ['assigned', 'en-route', 'otp-verified', 'in-progress'])
        .not('cleaner_id', 'is', null);
      return data || [];
    },
  });

  // Check which cleaners are on leave right now
  const { data: activeLeaves = [] } = useQuery({
    queryKey: ['admin-active-leaves'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase.from('cleaner_leaves').select('cleaner_id, start_date, end_date')
        .eq('status', 'approved')
        .lte('start_date', today)
        .gte('end_date', today);
      return data || [];
    },
  });

  const { data: jobPhotos = [] } = useQuery({
    queryKey: ['admin-job-photos', selectedId],
    queryFn: async () => {
      if (!selectedId) return [];
      const { data } = await supabase.from('job_photos').select('*').eq('booking_id', selectedId).order('uploaded_at');
      return data || [];
    },
    enabled: !!selectedId,
  });

  useEffect(() => {
    const channel = supabase
      .channel('admin-bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['admin-cleaner-active-jobs'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const cancelBooking = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] });
      toast.success('Booking cancelled');
    },
  });

  const unassignCleaner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bookings').update({
        cleaner_id: null, cleaner_name: null, cleaner_avatar: null, status: 'pending',
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] });
      toast.success('Cleaner unassigned');
    },
  });

  const assignCleaner = useMutation({
    mutationFn: async ({ bookingId, cleanerId, cleanerName }: { bookingId: string; cleanerId: string; cleanerName: string }) => {
      const { data: booking } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
      const { error } = await supabase.from('bookings').update({
        cleaner_id: cleanerId, cleaner_name: cleanerName, status: 'assigned',
      }).eq('id', bookingId);
      if (error) throw error;

      // Auto-assign recurring siblings
      if (booking && booking.recurring !== 'none') {
        const { data: siblings } = await supabase.from('bookings').select('id')
          .eq('customer_id', booking.customer_id)
          .eq('service_name', booking.service_name)
          .eq('recurring', booking.recurring)
          .eq('status', 'pending')
          .is('cleaner_id', null)
          .neq('id', bookingId);
        if (siblings && siblings.length > 0) {
          await supabase.from('bookings').update({
            cleaner_id: cleanerId, cleaner_name: cleanerName, status: 'assigned',
          }).in('id', siblings.map(s => s.id));
          toast.success(`Also assigned ${siblings.length} recurring jobs`);
        }
      }

      // Notify customer
      if (booking?.customer_id) {
        await supabase.from('notifications').insert({
          user_id: booking.customer_id, title: 'Cleaner Assigned!',
          message: `${cleanerName} has been assigned to your ${booking.service_name} booking by admin.`,
          type: 'booking',
        });
      }

      // Notify cleaner
      const cleaner = allCleaners.find(c => c.id === cleanerId);
      if (cleaner?.user_id) {
        await supabase.from('notifications').insert({
          user_id: cleaner.user_id, title: 'New Job Assigned',
          message: `Admin has assigned you a ${booking?.service_name} job for ${booking?.customer_name} on ${booking?.date} at ${booking?.time}.`,
          type: 'booking',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cleaner-active-jobs'] });
      toast.success('Cleaner assigned successfully! 🎉');
      setAssignDialogBookingId(null);
      setCleanerSearch('');
    },
  });

  const jobCountMap = useMemo(() => {
    const m = new Map<string, number>();
    activeJobCounts.forEach((b: any) => {
      m.set(b.cleaner_id, (m.get(b.cleaner_id) || 0) + 1);
    });
    return m;
  }, [activeJobCounts]);

  const onLeaveCleanerIds = useMemo(() => new Set(activeLeaves.map((l: any) => l.cleaner_id)), [activeLeaves]);

  const assignDialogBooking = bookings.find((b: any) => b.id === assignDialogBookingId);

  // Sort cleaners: available first, then by specialisation match, then by active job count
  const sortedCleaners = useMemo(() => {
    if (!assignDialogBooking) return allCleaners;
    const serviceName = (assignDialogBooking.service_name || '').toLowerCase().trim();

    return [...allCleaners]
      .filter((c: any) => {
        if (cleanerSearch) {
          return c.name.toLowerCase().includes(cleanerSearch.toLowerCase());
        }
        return true;
      })
      .sort((a: any, b: any) => {
        // On-leave cleaners go to bottom
        const aOnLeave = onLeaveCleanerIds.has(a.id) ? 1 : 0;
        const bOnLeave = onLeaveCleanerIds.has(b.id) ? 1 : 0;
        if (aOnLeave !== bOnLeave) return aOnLeave - bOnLeave;

        // Available first
        const aAvail = a.available ? 0 : 1;
        const bAvail = b.available ? 0 : 1;
        if (aAvail !== bAvail) return aAvail - bAvail;

        // Specialisation match
        const aMatch = (a.specialisations || []).some((s: string) => {
          const sl = s.toLowerCase().trim();
          return serviceName.includes(sl) || sl.includes(serviceName);
        }) ? 0 : 1;
        const bMatch = (b.specialisations || []).some((s: string) => {
          const sl = s.toLowerCase().trim();
          return serviceName.includes(sl) || sl.includes(serviceName);
        }) ? 0 : 1;
        if (aMatch !== bMatch) return aMatch - bMatch;

        // Fewer active jobs first
        const aJobs = jobCountMap.get(a.id) || 0;
        const bJobs = jobCountMap.get(b.id) || 0;
        return aJobs - bJobs;
      });
  }, [allCleaners, assignDialogBooking, cleanerSearch, onLeaveCleanerIds, jobCountMap]);

  const selected = bookings.find((b: any) => b.id === selectedId);
  const beforePhotos = jobPhotos.filter((p: any) => p.photo_type === 'before');
  const afterPhotos = jobPhotos.filter((p: any) => p.photo_type === 'after');

  // Detail View
  if (selected) {
    return (
      <AdminLayout>
        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center gap-3 mb-5">
            <BackButton onClick={() => setSelectedId(null)} />
            <h1 className="text-lg font-display font-black text-foreground">Booking Details</h1>
            <Badge className={`text-[9px] rounded-lg font-medium border capitalize ml-auto ${statusColors[selected.status] || 'bg-muted text-foreground'}`}>
              {selected.status.replace('-', ' ')}
            </Badge>
          </div>

          {/* Customer & Cleaner */}
          <div className="bg-card rounded-2xl p-4 shadow-soft border border-border mb-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-bold text-foreground">{selected.customer_name}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Cleaner</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{selected.cleaner_name || 'Unassigned'}</span>
                {!selected.cleaner_id && !['completed', 'cancelled'].includes(selected.status) && (
                  <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-lg font-bold"
                    onClick={() => { setAssignDialogBookingId(selected.id); }}>
                    <UserCheck className="h-3 w-3 mr-1" /> Assign
                  </Button>
                )}
                {selected.cleaner_id && !['completed', 'cancelled'].includes(selected.status) && (
                  <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-lg font-bold"
                    onClick={() => { setAssignDialogBookingId(selected.id); }}>
                    <UserCheck className="h-3 w-3 mr-1" /> Reassign
                  </Button>
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service</span>
              <span className="font-medium text-foreground">{selected.service_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Property</span>
              <span className="text-foreground capitalize">{selected.property_type} {selected.bedrooms ? `· ${selected.bedrooms}bed ${selected.bathrooms}bath` : ''}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</span>
              <span className="text-foreground">{selected.address_line1}, {selected.address_postcode}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Schedule</span>
              <span className="text-foreground">{selected.date} at {selected.time} · {selected.duration}h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1"><CreditCard className="h-3 w-3" /> Payment</span>
              <span className="text-foreground capitalize">{(selected as any).payment_method || 'card'}</span>
            </div>
            {(selected as any).referral_code && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><Tag className="h-3 w-3" /> Referral</span>
                <span className="font-mono text-foreground">{(selected as any).referral_code}</span>
              </div>
            )}
            {selected.tier && selected.tier !== 'standard' && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tier</span>
                <span className="text-primary-ink font-bold">👑 Premium</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Total</span>
              <span className="text-xl font-display font-black text-primary">£{selected.total_cost}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card rounded-2xl p-4 shadow-soft border border-border mb-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Timeline</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Booked</span><span className="text-foreground">{new Date(selected.created_at).toLocaleString('en-GB')}</span></div>
              {selected.updated_at !== selected.created_at && (
                <div className="flex justify-between"><span>Last Updated</span><span className="text-foreground">{new Date(selected.updated_at).toLocaleString('en-GB')}</span></div>
              )}
            </div>
          </div>

          {/* Before/After Photos */}
          {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
            <div className="bg-card rounded-2xl p-4 shadow-soft border border-border mb-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5" /> Before & After Photos
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {beforePhotos[0] && (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img src={(beforePhotos[0] as any).photo_url} alt="Before" className="w-full h-28 object-cover" />
                    <div className="absolute bottom-1 left-1 bg-foreground/80 text-background text-[9px] font-bold px-2 py-0.5 rounded">BEFORE</div>
                  </div>
                )}
                {afterPhotos[0] && (
                  <div className="relative rounded-xl overflow-hidden border border-primary/30">
                    <img src={(afterPhotos[0] as any).photo_url} alt="After" className="w-full h-28 object-cover" />
                    <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded">AFTER</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Review */}
          {selected.rating && (
            <div className="bg-card rounded-2xl p-4 shadow-soft border border-border mb-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5" /> Review
              </h3>
              <div className="flex items-center gap-2 mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < selected.rating! ? 'text-primary fill-primary' : 'text-border'}`} strokeWidth={1.5} />
                ))}
                <span className="text-sm font-bold text-foreground">{selected.rating}/5</span>
              </div>
              {selected.review && <p className="text-sm text-foreground">{selected.review}</p>}
            </div>
          )}

          {selected.notes && (
            <div className="bg-card rounded-2xl p-4 shadow-soft border border-border mb-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Notes</h3>
              <p className="text-sm text-foreground">{selected.notes}</p>
            </div>
          )}
        </div>

        {/* Assign Cleaner Dialog */}
        <AssignCleanerDialog
          open={!!assignDialogBookingId}
          onOpenChange={(open) => { if (!open) { setAssignDialogBookingId(null); setCleanerSearch(''); } }}
          booking={assignDialogBooking}
          cleaners={sortedCleaners}
          cleanerSearch={cleanerSearch}
          onSearchChange={setCleanerSearch}
          onLeaveCleanerIds={onLeaveCleanerIds}
          jobCountMap={jobCountMap}
          onAssign={(cleanerId, cleanerName) => {
            if (assignDialogBookingId) {
              assignCleaner.mutate({ bookingId: assignDialogBookingId, cleanerId, cleanerName });
            }
          }}
          isPending={assignCleaner.isPending}
        />
      </AdminLayout>
    );
  }

  // List View
  return (
    <AdminLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-display font-black text-foreground">Live Bookings</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time view · tap for details</p>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary">Live</span>
          </div>
        </div>

        {bookings.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No bookings yet" description="Bookings will appear here once customers start booking" />
        ) : (
          <div className="space-y-3">
            {bookings.map((b: any, i: number) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedId(b.id)}
                className="bg-card rounded-2xl p-4 shadow-soft border border-border cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-foreground text-sm truncate">{b.customer_name}</h3>
                      <Badge className={`text-[9px] rounded-lg font-medium border capitalize shrink-0 ${statusColors[b.status] || 'bg-muted text-foreground'}`}>
                        {b.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{b.service_name} · {b.property_type} · {b.duration}h</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    {!['completed', 'cancelled'].includes(b.status) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={e => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setAssignDialogBookingId(b.id); }} className="text-xs">
                            <UserCheck className="h-3.5 w-3.5 mr-2" /> {b.cleaner_id ? 'Reassign Cleaner' : 'Assign Cleaner'}
                          </DropdownMenuItem>
                          {b.cleaner_id && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); unassignCleaner.mutate(b.id); }} className="text-xs">
                              <XCircle className="h-3.5 w-3.5 mr-2" /> Unassign Cleaner
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); cancelBooking.mutate(b.id); }} className="text-xs text-destructive focus:text-destructive">
                            <XCircle className="h-3.5 w-3.5 mr-2" /> Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{b.address_postcode}</span>
                    <span>{b.date} {b.time}</span>
                  </div>
                  <span className="font-display font-black text-primary text-sm">£{b.total_cost}</span>
                </div>
                {b.cleaner_name && (
                  <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
                    <span>Cleaner: <span className="font-semibold text-foreground">{b.cleaner_name}</span></span>
                    {b.rating && (
                      <span className="flex items-center gap-1 text-primary font-semibold">
                        <Star className="h-3 w-3 fill-primary" strokeWidth={1.5} /> {b.rating}/5
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Cleaner Dialog */}
      <AssignCleanerDialog
        open={!!assignDialogBookingId}
        onOpenChange={(open) => { if (!open) { setAssignDialogBookingId(null); setCleanerSearch(''); } }}
        booking={assignDialogBooking}
        cleaners={sortedCleaners}
        cleanerSearch={cleanerSearch}
        onSearchChange={setCleanerSearch}
        onLeaveCleanerIds={onLeaveCleanerIds}
        jobCountMap={jobCountMap}
        onAssign={(cleanerId, cleanerName) => {
          if (assignDialogBookingId) {
            assignCleaner.mutate({ bookingId: assignDialogBookingId, cleanerId, cleanerName });
          }
        }}
        isPending={assignCleaner.isPending}
      />
    </AdminLayout>
  );
}

// Assign Cleaner Dialog Component
function AssignCleanerDialog({
  open, onOpenChange, booking, cleaners, cleanerSearch, onSearchChange,
  onLeaveCleanerIds, jobCountMap, onAssign, isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  cleaners: any[];
  cleanerSearch: string;
  onSearchChange: (v: string) => void;
  onLeaveCleanerIds: Set<string>;
  jobCountMap: Map<string, number>;
  onAssign: (cleanerId: string, cleanerName: string) => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display font-black text-lg">
            {booking?.cleaner_id ? 'Reassign Cleaner' : 'Assign Cleaner'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {booking?.service_name} · {booking?.customer_name} · {booking?.date}
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cleaners..."
            value={cleanerSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 rounded-xl h-10 text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 max-h-[50vh] pr-1">
          {cleaners.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No cleaners found</p>
            </div>
          ) : (
            cleaners.map((c: any) => {
              const isOnLeave = onLeaveCleanerIds.has(c.id);
              const activeJobs = jobCountMap.get(c.id) || 0;
              const isCurrentCleaner = booking?.cleaner_id === c.id;
              const specMatch = booking && (c.specialisations || []).some((s: string) => {
                const sl = s.toLowerCase().trim();
                const bn = (booking.service_name || '').toLowerCase().trim();
                return bn.includes(sl) || sl.includes(bn);
              });

              return (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  disabled={isPending || isCurrentCleaner}
                  onClick={() => onAssign(c.id, c.name)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all ${
                    isCurrentCleaner
                      ? 'bg-primary/5 border-primary/20 cursor-default'
                      : isOnLeave
                        ? 'bg-destructive/5 border-destructive/10 opacity-60'
                        : 'bg-card border-border hover:border-primary/30 hover:bg-primary/5 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      c.available && !isOnLeave ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {c.name?.[0] || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm truncate">{c.name}</span>
                        {isCurrentCleaner && (
                          <Badge className="text-[8px] bg-primary/10 text-primary border-0 rounded-md">Current</Badge>
                        )}
                        {specMatch && !isCurrentCleaner && (
                          <Badge className="text-[8px] bg-primary/10 text-primary border-0 rounded-md">Match</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span className={c.available && !isOnLeave ? 'text-primary font-semibold' : ''}>
                          {isOnLeave ? '🏖️ On Leave' : c.available ? '🟢 Online' : '⚫ Offline'}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5" /> {c.rating || 0}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Briefcase className="h-2.5 w-2.5" /> {activeJobs} active
                        </span>
                      </div>
                      {(c.specialisations || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(c.specialisations as string[]).slice(0, 3).map((s: string) => (
                            <span key={s} className="text-[8px] bg-muted rounded-md px-1.5 py-0.5 text-muted-foreground">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {!isCurrentCleaner && !isOnLeave && (
                      <CheckCircle2 className="h-5 w-5 text-primary/30 shrink-0" />
                    )}
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
