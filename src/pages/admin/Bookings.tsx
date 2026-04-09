import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import BackButton from '@/components/BackButton';
import { CalendarDays, MapPin, MoreHorizontal, XCircle, UserCheck, Clock, Star, Camera, CreditCard, Tag, ChevronRight } from 'lucide-react';
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

  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-all-bookings'],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
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
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cleaner</span>
              <span className="font-bold text-foreground">{selected.cleaner_name || 'Unassigned'}</span>
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
                <span className="text-amber-600 font-bold">👑 Premium</span>
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
                          {b.cleaner_id && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); unassignCleaner.mutate(b.id); }} className="text-xs">
                              <UserCheck className="h-3.5 w-3.5 mr-2" /> Reassign
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
                  <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                    Cleaner: <span className="font-semibold text-foreground">{b.cleaner_name}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
