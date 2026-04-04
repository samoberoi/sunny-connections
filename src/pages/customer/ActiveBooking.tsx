import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleCheck, Circle, MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

const statuses = [
  { key: 'pending', label: 'Booking Confirmed', desc: 'Looking for the best cleaner' },
  { key: 'assigned', label: 'Cleaner Assigned', desc: 'Your cleaner has accepted the job' },
  { key: 'en-route', label: 'En Route', desc: 'Your cleaner is on the way' },
  { key: 'otp-verified', label: 'OTP Verified', desc: 'Cleaner has arrived and verified' },
  { key: 'in-progress', label: 'In Progress', desc: 'Cleaning is underway' },
  { key: 'completed', label: 'Completed', desc: 'Service complete!' },
];

export default function ActiveBooking() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const [liveStatus, setLiveStatus] = useState<string>('pending');

  const { data: booking } = useQuery({
    queryKey: ['active-booking', state?.bookingId, user?.id],
    queryFn: async () => {
      if (state?.bookingId) {
        const { data } = await supabase.from('bookings').select('*').eq('id', state.bookingId).single();
        return data;
      }
      if (user?.id) {
        const { data } = await supabase.from('bookings').select('*').eq('customer_id', user.id).not('status', 'in', '("completed","cancelled")').order('created_at', { ascending: false }).limit(1).maybeSingle();
        return data;
      }
      return null;
    },
    enabled: !!(state?.bookingId || user?.id),
  });

  useEffect(() => {
    if (booking) setLiveStatus(booking.status);
  }, [booking]);

  useEffect(() => {
    if (!booking?.id) return;
    const channel = supabase
      .channel(`booking-${booking.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${booking.id}` },
        (payload) => setLiveStatus((payload.new as any).status))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [booking?.id]);

  const currentIdx = statuses.findIndex(s => s.key === liveStatus);

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <BackButton />
            <h1 className="text-2xl font-display font-black text-foreground">Booking Status</h1>
          </div>

          <div className="bg-card rounded-2xl p-5 mb-5 shadow-apple">
            <div className="relative h-40 bg-muted rounded-xl overflow-hidden mb-4">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
              {liveStatus !== 'pending' && (
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-1/3 left-1/3 w-10 h-10 rounded-full gradient-neon shadow-neon flex items-center justify-center">
                  <Navigation className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </motion.div>
              )}
              <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full gradient-pink animate-pulse" />
            </div>
            {booking?.cleaner_name && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center text-card font-bold">
                    {booking.cleaner_name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{booking.cleaner_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {liveStatus === 'en-route' ? 'Arriving in ~12 min' : liveStatus === 'in-progress' ? 'Cleaning in progress' : 'Assigned'}
                    </p>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-accent-foreground" strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>

          {(liveStatus === 'en-route' || liveStatus === 'assigned') && booking?.otp && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="gradient-neon rounded-2xl p-5 mb-5 text-center shadow-neon">
              <p className="text-xs text-foreground/60 mb-2 font-medium">Share this code with your cleaner</p>
              <div className="text-3xl font-display font-black tracking-[0.4em] text-foreground">{booking.otp}</div>
            </motion.div>
          )}

          <div className="bg-card rounded-2xl p-6 mb-6 shadow-apple">
            {statuses.map((status, i) => {
              const done = i <= currentIdx;
              const current = i === currentIdx;
              return (
                <div key={status.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {done ? (
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                        <CircleCheck className={`h-6 w-6 text-primary ${current ? 'animate-pulse' : ''}`} strokeWidth={1.5} />
                      </motion.div>
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground/20" strokeWidth={1.5} />
                    )}
                    {i < statuses.length - 1 && <div className={`w-0.5 h-10 rounded-full transition-colors duration-300 ${done ? 'bg-primary' : 'bg-muted'}`} />}
                  </div>
                  <div className="pb-4">
                    <p className={`font-bold text-sm ${done ? 'text-foreground' : 'text-muted-foreground/50'}`}>{status.label}</p>
                    <p className={`text-xs ${done ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}>{status.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {liveStatus === 'completed' && (
            <Button onClick={() => navigate('/rate-service', { state: { bookingId: booking?.id } })} className="w-full h-14 gradient-neon text-foreground rounded-2xl shadow-neon font-bold text-base">
              Rate Service
            </Button>
          )}
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
