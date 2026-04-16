import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, CalendarDays, XCircle, RotateCcw, Heart, Crown, MessageSquare, CalendarClock, Zap, Repeat, SkipForward, ChevronDown, ChevronUp, CheckCircle2, CircleDashed } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import EmptyState from '@/components/EmptyState';
import StarRating from '@/components/StarRating';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const statusStyles: Record<string, string> = {
  pending: 'bg-primary/15 text-primary-ink',
  assigned: 'bg-foreground text-background',
  'en-route': 'bg-foreground text-background',
  'otp-verified': 'bg-foreground text-background',
  'in-progress': 'bg-primary text-primary-foreground',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

const CANCEL_REASONS = [
  'Change of plans',
  'Found another service',
  'Cleaner taking too long',
  'Emergency',
  'Wrong details entered',
  'Other',
];

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

function RescheduleButton({ booking, onReschedule }: { booking: any; onReschedule: (date: string, time: string) => void }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date(booking.date));
  const [time, setTime] = useState(booking.time?.slice(0, 5) || '10:00');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-3 w-full rounded-full text-xs h-10 border-2 border-primary/20 text-primary hover:bg-primary/5 font-bold">
          <CalendarClock className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Reschedule
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader><DialogTitle className="font-display font-bold">Reschedule Booking</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2">New Date</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-2xl h-12", !date && "text-muted-foreground")}>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {date ? format(date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate}
                  disabled={d => d < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2">New Time</p>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map(t => (
                <button key={t} onClick={() => setTime(t)}
                  className={`px-3 py-2 rounded-full text-xs font-bold border transition-all ${time === t ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={() => { if (date) { onReschedule(format(date, 'yyyy-MM-dd'), time + ':00'); setOpen(false); } }}
            disabled={!date} className="w-full rounded-full font-bold h-12">
            Confirm Reschedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MyBookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cancelReasons, setCancelReasons] = useState<Record<string, string>>({});
  const [cancelNotes, setCancelNotes] = useState<Record<string, string>>({});
  const [bookingFilter, setBookingFilter] = useState<string>('all');

  const { data: bookings = [] } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('bookings').select('*').eq('customer_id', user.id).order('date', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: favourites = [] } = useQuery({
    queryKey: ['my-favourites', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('favourite_cleaners').select('cleaner_id').eq('customer_id', user.id);
      return (data || []).map((f: any) => f.cleaner_id);
    },
    enabled: !!user?.id,
  });

  const toggleFavourite = useMutation({
    mutationFn: async (cleanerId: string) => {
      if (!user?.id) return;
      if (favourites.includes(cleanerId)) {
        await supabase.from('favourite_cleaners').delete().eq('customer_id', user.id).eq('cleaner_id', cleanerId);
      } else {
        await supabase.from('favourite_cleaners').insert({ customer_id: user.id, cleaner_id: cleanerId });
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-favourites'] }); },
  });

  const rebook = (b: any) => {
    navigate('/schedule-booking', { state: { rebook: true, serviceName: b.service_name, address: b.address_line1, postcode: b.address_postcode } });
    toast.success('Re-booking with previous details!');
  };

  const cancelBooking = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase.from('bookings').update({
        status: 'cancelled',
        notes: `Cancelled by customer: ${reason}`,
      }).eq('id', id);
      if (error) throw error;

      if (user?.id) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'Booking Cancelled',
          message: `Your booking has been cancelled. Reason: ${reason}`,
          type: 'booking',
        });
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Booking cancelled');
      setCancelReasons(prev => { const n = { ...prev }; delete n[variables.id]; return n; });
      setCancelNotes(prev => { const n = { ...prev }; delete n[variables.id]; return n; });
    },
    onError: () => toast.error('Failed to cancel booking'),
  });

  const rescheduleBooking = useMutation({
    mutationFn: async ({ id, date, time }: { id: string; date: string; time: string }) => {
      const { error } = await supabase.from('bookings').update({ date, time }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Booking rescheduled!');
    },
    onError: () => toast.error('Failed to reschedule'),
  });

  const upcoming = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));

  // Group recurring bookings into single representative cards
  const groupedUpcoming = useMemo(() => {
    const grouped = new Map<string, any[]>();
    upcoming.forEach(b => {
      if (b.recurring && b.recurring !== 'none') {
        const key = `${b.service_name}|${b.recurring}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(b);
      } else {
        grouped.set(b.id, [b]);
      }
    });
    const result: any[] = [];
    grouped.forEach(items => {
      const sorted = items.sort((a: any, b: any) => a.date.localeCompare(b.date));
      const nearest = sorted[0];
      result.push({ ...nearest, _recurringCount: items.length, _siblingIds: items.map((bb: any) => bb.id), _nextDate: sorted[0]?.date });
    });
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [upcoming]);

  const filteredUpcoming = groupedUpcoming.filter(b => {
    if (bookingFilter === 'express') {
      const name = (b.service_name || '').toLowerCase();
      return name.includes('express') || name.includes('blitz');
    }
    if (bookingFilter === 'scheduled') return (b.service_name || '').toLowerCase().includes('scheduled');
    return true;
  });
  const past = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-14 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <BackButton to="/home" />
            <h1 className="text-2xl font-display font-black text-foreground">My Bookings</h1>
          </div>

          {bookings.length === 0 && <EmptyState icon={CalendarDays} title="No bookings yet" description="Book your first clean" />}

          {groupedUpcoming.length > 0 && (
            <section className="mb-6">
              <h3 className="font-display font-bold text-foreground text-sm mb-3">Upcoming</h3>
              <div className="mb-3">
                <ToggleGroup type="single" value={bookingFilter} onValueChange={v => setBookingFilter(v || 'all')} className="bg-muted/30 rounded-xl p-1 w-full">
                  <ToggleGroupItem value="all" className="flex-1 rounded-lg text-[11px] font-medium h-8 data-[state=on]:bg-background data-[state=on]:shadow-sm">
                    All ({groupedUpcoming.length})
                  </ToggleGroupItem>
                  <ToggleGroupItem value="express" className="flex-1 rounded-lg text-[11px] font-medium h-8 data-[state=on]:bg-background data-[state=on]:shadow-sm">
                    <Zap className="h-3 w-3 mr-1 text-amber-600" /> Express
                  </ToggleGroupItem>
                  <ToggleGroupItem value="scheduled" className="flex-1 rounded-lg text-[11px] font-medium h-8 data-[state=on]:bg-background data-[state=on]:shadow-sm">
                    <CalendarDays className="h-3 w-3 mr-1" /> Scheduled
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              {filteredUpcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No {bookingFilter} bookings</p>
              ) : (
              <div className="space-y-3">
                {filteredUpcoming.map(b => (
                  <div key={b.id} className="bg-card rounded-3xl p-5 shadow-soft border border-border">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-display font-bold text-foreground">{b.service_name}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          {(b as any).tier === 'premium' && (
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block">👑 Premium</span>
                          )}
                          {b._recurringCount > 1 && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              <Repeat className="h-2.5 w-2.5" strokeWidth={1.5} />
                              {b.recurring} · {b._recurringCount} sessions
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className={`${statusStyles[b.status]} text-[10px] rounded-full font-bold border-0`}>{b.status.replace('-', ' ')}</Badge>
                    </div>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-foreground" strokeWidth={1.5} /> Next: {b.date} at {b.time} · {b.duration}h</div>
                      <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-foreground" strokeWidth={1.5} /> {b.address_line1}, {b.address_postcode}</div>
                    </div>
                    {b.cleaner_name && (
                      <button onClick={() => navigate('/cleaner-detail', { state: { cleanerId: b.cleaner_id } })} className="text-xs text-primary mt-2.5 font-bold underline underline-offset-2">
                        Cleaner: {b.cleaner_name} →
                      </button>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-lg font-display font-black text-foreground">£{b.total_cost}</span>
                      <span className="text-[10px] text-muted-foreground capitalize">{b.recurring !== 'none' ? b.recurring : 'One-time'}</span>
                    </div>

                    {/* Reschedule */}
                    {['pending', 'assigned'].includes(b.status) && (
                      <RescheduleButton booking={b} onReschedule={(date, time) => rescheduleBooking.mutate({ id: b.id, date, time })} />
                    )}

                    {/* Cancel with reason */}
                    {['pending', 'assigned'].includes(b.status) && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="mt-3 w-full rounded-full text-xs h-10 border-2 border-destructive/20 text-destructive hover:bg-destructive/5 font-bold">
                            <XCircle className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Cancel Booking
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-3xl">
                          <DialogHeader><DialogTitle className="font-display font-bold">Cancel Booking</DialogTitle></DialogHeader>
                          <p className="text-sm text-muted-foreground mb-3">Please tell us why you're cancelling:</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {CANCEL_REASONS.map(r => (
                              <button key={r} onClick={() => setCancelReasons(prev => ({ ...prev, [b.id]: r }))}
                                className={`px-3 py-2 rounded-full text-xs font-bold border transition-all ${
                                  cancelReasons[b.id] === r ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground'
                                }`}>{r}</button>
                            ))}
                          </div>
                          {cancelReasons[b.id] === 'Other' && (
                            <Textarea placeholder="Tell us more..." value={cancelNotes[b.id] || ''} onChange={e => setCancelNotes(prev => ({ ...prev, [b.id]: e.target.value }))} rows={2} className="rounded-2xl resize-none mb-2" />
                          )}
                          <div className="flex gap-3 mt-2">
                            <DialogClose asChild><Button variant="outline" className="flex-1 rounded-full font-bold">Keep</Button></DialogClose>
                            <Button
                              onClick={() => cancelBooking.mutate({ id: b.id, reason: cancelReasons[b.id] === 'Other' ? cancelNotes[b.id] || 'Other' : cancelReasons[b.id] })}
                              disabled={!cancelReasons[b.id]}
                              variant="destructive" className="flex-1 rounded-full font-bold disabled:opacity-40">
                              Cancel
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Track live */}
                    {['en-route', 'in-progress', 'otp-verified'].includes(b.status) && (
                      <div className="space-y-2 mt-3">
                        <Button size="sm" onClick={() => navigate('/active-booking', { state: { bookingId: b.id } })}
                          className="w-full rounded-full text-xs h-10 bg-foreground text-background hover:bg-foreground/90 font-bold">
                          Track Live
                        </Button>
                        {/* Cancel even when en-route */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full rounded-full text-xs h-9 text-destructive font-bold">
                              Cancel Service
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-3xl">
                            <DialogHeader><DialogTitle className="font-display font-bold">Cancel Active Service?</DialogTitle></DialogHeader>
                            <p className="text-sm text-muted-foreground mb-3">Your cleaner is already on their way. A partial charge may apply.</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {CANCEL_REASONS.map(r => (
                                <button key={r} onClick={() => setCancelReasons(prev => ({ ...prev, [b.id]: r }))}
                                  className={`px-3 py-2 rounded-full text-xs font-bold border transition-all ${
                                    cancelReasons[b.id] === r ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground'
                                  }`}>{r}</button>
                              ))}
                            </div>
                            <div className="flex gap-3 mt-2">
                              <DialogClose asChild><Button variant="outline" className="flex-1 rounded-full font-bold">Keep</Button></DialogClose>
                              <Button onClick={() => cancelBooking.mutate({ id: b.id, reason: cancelReasons[b.id] || 'No reason given' })}
                                variant="destructive" className="flex-1 rounded-full font-bold">Confirm Cancel</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h3 className="font-display font-bold text-foreground text-sm mb-3">Past</h3>
              <div className="space-y-3">
                {past.map(b => (
                  <div key={b.id} className="bg-card rounded-3xl p-5 shadow-soft border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-display font-bold text-foreground">{b.service_name}</h4>
                      <Badge className={`${statusStyles[b.status]} text-[10px] rounded-full font-bold border-0`}>{b.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{b.date} · {b.cleaner_name || '—'}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-display font-black text-foreground">£{b.total_cost}</span>
                      {(b as any).tier === 'premium' && <span className="text-[9px] font-bold text-amber-600">👑 Premium</span>}
                    </div>
                    {b.rating && <div className="mt-2"><StarRating rating={b.rating} readonly size="sm" /></div>}
                    {b.review && <p className="text-xs text-muted-foreground mt-1 italic">"{b.review}"</p>}
                    {b.status === 'cancelled' && b.notes && (
                      <p className="text-xs text-destructive/70 mt-1 italic">{b.notes}</p>
                    )}
                    {b.status === 'completed' && !b.rating && (
                      <Button size="sm" onClick={() => navigate('/rate-service', { state: { bookingId: b.id, cleanerId: b.cleaner_id } })} variant="outline"
                        className="mt-3 w-full rounded-full text-xs h-10 border-2 border-foreground/20 text-foreground hover:bg-primary/10 font-bold">
                        Rate Service
                      </Button>
                    )}
                    {b.status === 'completed' && (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={() => rebook(b)} variant="outline"
                          className="flex-1 rounded-full text-xs h-10 border-2 border-foreground/20 text-foreground font-bold">
                          <RotateCcw className="h-3.5 w-3.5 mr-1" /> Re-book
                        </Button>
                        {b.cleaner_id && (
                          <Button size="sm" onClick={() => toggleFavourite.mutate(b.cleaner_id)} variant="outline"
                            className={`rounded-full text-xs h-10 px-4 border-2 font-bold ${favourites.includes(b.cleaner_id) ? 'border-destructive/30 text-destructive' : 'border-foreground/20 text-foreground'}`}>
                            <Heart className="h-3.5 w-3.5" fill={favourites.includes(b.cleaner_id) ? 'currentColor' : 'none'} />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
