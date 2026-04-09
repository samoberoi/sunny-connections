import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleCheck, Circle, MapPin, Clock, Phone, MessageCircle, Navigation, Timer } from 'lucide-react';
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
  const [eta, setEta] = useState(12); // minutes

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
        (payload) => {
          const newStatus = (payload.new as any).status;
          setLiveStatus(newStatus);
          // Auto-navigate to rating when cleaner marks complete (brief delay for UX)
          if (newStatus === 'completed') {
            setTimeout(() => {
              navigate('/rate-service', { state: { bookingId: booking.id } });
            }, 2000);
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [booking?.id, navigate]);

  // ETA countdown when en-route
  useEffect(() => {
    if (liveStatus !== 'en-route') return;
    setEta(12);
    const interval = setInterval(() => {
      setEta(prev => {
        if (prev <= 1) { clearInterval(interval); return 1; }
        return prev - 1;
      });
    }, 30000); // decrement every 30s for realism
    return () => clearInterval(interval);
  }, [liveStatus]);

  const currentIdx = statuses.findIndex(s => s.key === liveStatus);

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <BackButton to="/home" />
            <h1 className="text-xl font-display font-black text-foreground">Booking Status</h1>
          </div>

          {/* Simulated Map */}
          <div className="relative bg-accent rounded-2xl overflow-hidden mb-5" style={{ height: 180 }}>
            <div className="absolute inset-0 opacity-[0.06]" style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)`,
              backgroundSize: '30px 30px',
            }} />
            {liveStatus !== 'pending' && (
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1/3 left-1/3 w-9 h-9 rounded-full bg-primary shadow-elevated flex items-center justify-center"
              >
                <Navigation className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
              </motion.div>
            )}
            <div className="absolute bottom-1/3 right-1/3 w-3 h-3 rounded-full bg-primary" />
            <div className="absolute bottom-1/3 right-1/3 w-3 h-3 rounded-full bg-primary animate-pulse-ring" />

            {booking?.cleaner_name && (
              <div className="absolute bottom-3 left-3 right-3 glass-card-elevated rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs">
                    {booking.cleaner_name[0]}
                  </div>
                    <button onClick={() => navigate('/cleaner-detail', { state: { cleanerId: booking.cleaner_id } })} className="text-left">
                      <p className="font-semibold text-foreground text-xs">{booking.cleaner_name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {liveStatus === 'en-route' ? `Arriving in ~${eta} min` : liveStatus === 'in-progress' ? 'Cleaning' : 'Assigned'}
                      </p>
                    </button>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => window.open('tel:+2222222222', '_self')} className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center hover:bg-accent transition-colors">
                    <Phone className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => navigate('/chat', { state: { bookingId: booking?.id, otherName: booking?.cleaner_name } })} className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center hover:bg-accent transition-colors">
                    <MessageCircle className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ETA banner for en-route */}
          {liveStatus === 'en-route' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent border border-primary/20 rounded-2xl p-4 mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Timer className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-display font-bold text-foreground text-sm">ETA: ~{eta} minutes</p>
                <p className="text-xs text-muted-foreground">Your cleaner is on the way</p>
              </div>
            </motion.div>
          )}

          {(liveStatus === 'en-route' || liveStatus === 'assigned') && booking?.otp && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary rounded-2xl p-5 mb-5 text-center">
              <p className="text-xs text-primary-foreground/60 mb-2 font-medium uppercase tracking-wider">Share code with cleaner</p>
              <div className="text-3xl font-display font-black tracking-[0.4em] text-primary-foreground">{booking.otp}</div>
            </motion.div>
          )}

          {/* Status timeline */}
          <div className="border border-border rounded-2xl p-6 mb-6">
            {statuses.map((status, i) => {
              const done = i <= currentIdx;
              const current = i === currentIdx;
              return (
                <div key={status.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {done ? (
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                        <CircleCheck className={`h-5 w-5 text-primary ${current ? 'animate-pulse' : ''}`} strokeWidth={1.5} />
                      </motion.div>
                    ) : (
                      <Circle className="h-5 w-5 text-border" strokeWidth={1.5} />
                    )}
                    {i < statuses.length - 1 && <div className={`w-px h-8 transition-colors duration-300 ${done ? 'bg-primary' : 'bg-border'}`} />}
                  </div>
                  <div className="pb-3">
                    <p className={`font-semibold text-sm ${done ? 'text-foreground' : 'text-muted-foreground/40'}`}>{status.label}</p>
                    <p className={`text-xs ${done ? 'text-muted-foreground' : 'text-muted-foreground/20'}`}>{status.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {liveStatus === 'completed' && (
            <Button onClick={() => navigate('/rate-service', { state: { bookingId: booking?.id } })} className="w-full h-14 font-semibold text-base rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90">
              Rate Service
            </Button>
          )}
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
