import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, CalendarDays, XCircle, RotateCcw, Heart, Crown, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
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

const cancelReasons = [
  'Change of plans',
  'Found another service',
  'Cleaner taking too long',
  'Emergency',
  'Wrong details entered',
  'Other',
];

export default function MyBookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNote, setCancelNote] = useState('');

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
        status: 'cancelled' as any,
        notes: `Cancelled by customer: ${reason}`,
      }).eq('id', id);
      if (error) throw error;

      // Notify admin
      if (user?.id) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'Booking Cancelled',
          message: `Your booking has been cancelled. Reason: ${reason}`,
          type: 'booking',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Booking cancelled');
      setCancelReason('');
      setCancelNote('');
    },
    onError: () => toast.error('Failed to cancel booking'),
  });

  const upcoming = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
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

          {upcoming.length > 0 && (
            <section className="mb-6">
              <h3 className="font-display font-bold text-foreground text-sm mb-3">Upcoming</h3>
              <div className="space-y-3">
                {upcoming.map(b => (
                  <div key={b.id} className="bg-card rounded-3xl p-5 shadow-soft border border-border">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-display font-bold text-foreground">{b.service_name}</h4>
                        {(b as any).tier === 'premium' && (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1 inline-block">👑 Premium</span>
                        )}
                      </div>
                      <Badge className={`${statusStyles[b.status]} text-[10px] rounded-full font-bold border-0`}>{b.status.replace('-', ' ')}</Badge>
                    </div>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-foreground" strokeWidth={1.5} /> {b.date} at {b.time} · {b.duration}h</div>
                      <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-foreground" strokeWidth={1.5} /> {b.address_line1}, {b.address_postcode}</div>
                    </div>
                    {b.cleaner_name && <p className="text-xs text-foreground mt-2.5 font-bold">Cleaner: {b.cleaner_name}</p>}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-lg font-display font-black text-foreground">£{b.total_cost}</span>
                      <span className="text-[10px] text-muted-foreground capitalize">{b.recurring !== 'none' ? b.recurring : 'One-time'}</span>
                    </div>

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
                            {cancelReasons.map(r => (
                              <button key={r} onClick={() => setCancelReason(r)}
                                className={`px-3 py-2 rounded-full text-xs font-bold border transition-all ${
                                  cancelReason === r ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground'
                                }`}>{r}</button>
                            ))}
                          </div>
                          {cancelReason === 'Other' && (
                            <Textarea placeholder="Tell us more..." value={cancelNote} onChange={e => setCancelNote(e.target.value)} rows={2} className="rounded-2xl resize-none mb-2" />
                          )}
                          <div className="flex gap-3 mt-2">
                            <DialogClose asChild><Button variant="outline" className="flex-1 rounded-full font-bold">Keep</Button></DialogClose>
                            <Button
                              onClick={() => cancelBooking.mutate({ id: b.id, reason: cancelReason === 'Other' ? cancelNote || 'Other' : cancelReason })}
                              disabled={!cancelReason}
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
                              {cancelReasons.map(r => (
                                <button key={r} onClick={() => setCancelReason(r)}
                                  className={`px-3 py-2 rounded-full text-xs font-bold border transition-all ${
                                    cancelReason === r ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground'
                                  }`}>{r}</button>
                              ))}
                            </div>
                            <div className="flex gap-3 mt-2">
                              <DialogClose asChild><Button variant="outline" className="flex-1 rounded-full font-bold">Keep</Button></DialogClose>
                              <Button onClick={() => cancelBooking.mutate({ id: b.id, reason: cancelReason || 'No reason given' })}
                                variant="destructive" className="flex-1 rounded-full font-bold">Confirm Cancel</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
