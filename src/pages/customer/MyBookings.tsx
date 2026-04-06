import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, CalendarDays, XCircle, RotateCcw, Heart, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export default function MyBookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings = [] } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('bookings').select('*').eq('customer_id', user.id).order('date', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  const cancelBooking = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bookings').update({ status: 'cancelled' as any }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-bookings'] }); toast.success('Booking cancelled'); },
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
                      <h4 className="font-display font-bold text-foreground">{b.service_name}</h4>
                      <Badge className={`${statusStyles[b.status]} text-[10px] rounded-full font-bold border-0`}>{b.status.replace('-', ' ')}</Badge>
                    </div>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-foreground" strokeWidth={1.5} /> {b.date} at {b.time} · {b.duration}h</div>
                      <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-foreground" strokeWidth={1.5} /> {b.address_line1}, {b.address_postcode}</div>
                    </div>
                    {b.cleaner_name && <p className="text-xs text-foreground mt-2.5 font-bold">Cleaner: {b.cleaner_name}</p>}

                    {['pending', 'assigned'].includes(b.status) && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="mt-3 w-full rounded-full text-xs h-10 border-2 border-destructive/20 text-destructive hover:bg-destructive/5 font-bold">
                            <XCircle className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Cancel
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-3xl">
                          <DialogHeader><DialogTitle>Cancel this booking?</DialogTitle></DialogHeader>
                          <p className="text-sm text-muted-foreground">This cannot be undone.</p>
                          <div className="flex gap-3 mt-4">
                            <DialogClose asChild><Button variant="outline" className="flex-1 rounded-full">Keep</Button></DialogClose>
                            <Button onClick={() => cancelBooking.mutate(b.id)} variant="destructive" className="flex-1 rounded-full">Cancel</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {['en-route', 'in-progress', 'otp-verified'].includes(b.status) && (
                      <Button size="sm" onClick={() => navigate('/active-booking', { state: { bookingId: b.id } })}
                        className="mt-3 w-full rounded-full text-xs h-10 bg-foreground text-background hover:bg-foreground/90 font-bold">
                        Track Live
                      </Button>
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
                    <p className="text-xs text-muted-foreground">{b.date} · {b.cleaner_name}</p>
                    {b.rating && <div className="mt-2"><StarRating rating={b.rating} readonly size="sm" /></div>}
                    {b.review && <p className="text-xs text-muted-foreground mt-1 italic">"{b.review}"</p>}
                    {b.status === 'completed' && !b.rating && (
                      <Button size="sm" onClick={() => navigate('/rate-service', { state: { bookingId: b.id } })} variant="outline"
                        className="mt-3 w-full rounded-full text-xs h-10 border-2 border-foreground/20 text-foreground hover:bg-primary/10 font-bold">
                        Rate Service
                      </Button>
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
