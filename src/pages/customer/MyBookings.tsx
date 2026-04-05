import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, CalendarDays, XCircle } from 'lucide-react';
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
  pending: 'bg-accent text-accent-foreground',
  assigned: 'bg-primary/10 text-primary',
  'en-route': 'bg-primary/10 text-primary',
  'otp-verified': 'bg-primary/10 text-primary',
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Booking cancelled');
    },
    onError: () => toast.error('Failed to cancel booking'),
  });

  const upcoming = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const past = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <BackButton to="/home" />
            <h1 className="text-xl font-display font-black text-foreground">My Bookings</h1>
          </div>

          {bookings.length === 0 && (
            <EmptyState icon={CalendarDays} title="No bookings yet" description="Book your first cleaning service to get started" />
          )}

          {upcoming.length > 0 && (
            <section className="mb-6">
              <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Upcoming</h3>
              <div className="space-y-3">
                {upcoming.map(b => (
                  <div key={b.id} className="border border-border rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-foreground text-sm">{b.service_name}</h4>
                      <Badge className={`${statusStyles[b.status]} text-[10px] rounded-lg font-semibold border-0`}>{b.status.replace('-', ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Clock className="h-3 w-3 text-primary" strokeWidth={1.5} /> {b.date} at {b.time} · {b.duration}h
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 text-primary" strokeWidth={1.5} /> {b.address_line1}, {b.address_postcode}
                    </div>
                    {b.cleaner_name && <p className="text-xs text-primary mt-2 font-medium">Cleaner: {b.cleaner_name}</p>}

                    {/* Cancel button for pending/assigned bookings */}
                    {['pending', 'assigned'].includes(b.status) && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="mt-3 w-full rounded-xl text-xs h-9 border-destructive/20 text-destructive hover:bg-destructive/5">
                            <XCircle className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Cancel Booking
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl">
                          <DialogHeader><DialogTitle>Cancel this booking?</DialogTitle></DialogHeader>
                          <p className="text-sm text-muted-foreground">This action cannot be undone. The cleaner will be notified.</p>
                          <div className="flex gap-3 mt-4">
                            <DialogClose asChild>
                              <Button variant="outline" className="flex-1 rounded-xl">Keep</Button>
                            </DialogClose>
                            <Button onClick={() => cancelBooking.mutate(b.id)} variant="destructive" className="flex-1 rounded-xl">
                              Cancel Booking
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Track button for active bookings */}
                    {['en-route', 'in-progress', 'otp-verified'].includes(b.status) && (
                      <Button size="sm" onClick={() => navigate('/active-booking', { state: { bookingId: b.id } })} className="mt-3 w-full rounded-xl text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90">
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
              <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Past</h3>
              <div className="space-y-3">
                {past.map(b => (
                  <div key={b.id} className="border border-border rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-foreground text-sm">{b.service_name}</h4>
                      <Badge className={`${statusStyles[b.status]} text-[10px] rounded-lg font-semibold border-0`}>{b.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{b.date} · {b.cleaner_name}</p>
                    {b.rating && <div className="mt-2"><StarRating rating={b.rating} readonly size="sm" /></div>}
                    {b.review && <p className="text-xs text-muted-foreground mt-1 italic">"{b.review}"</p>}

                    {b.status === 'completed' && !b.rating && (
                      <Button size="sm" onClick={() => navigate('/rate-service', { state: { bookingId: b.id } })} variant="outline" className="mt-3 w-full rounded-xl text-xs h-9 border-primary/20 text-primary hover:bg-accent">
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
