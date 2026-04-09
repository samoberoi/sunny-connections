import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleCheck, MapPin, Clock, Phone, MessageCircle, Timer, Image, XCircle } from 'lucide-react';
import ImageViewer from '@/components/ImageViewer';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import SimulatedMap from '@/components/SimulatedMap';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { playNotificationSound } from '@/lib/notificationSound';
import { Badge } from '@/components/ui/badge';

const statusLabel: Record<string, string> = {
  pending: 'Finding Cleaner',
  assigned: 'Cleaner Assigned',
  'en-route': 'On the Way',
  'otp-verified': 'Verified',
  'in-progress': 'Cleaning in Progress',
  completed: 'Completed',
};

export default function ActiveBooking() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [liveStatus, setLiveStatus] = useState<string>('pending');
  const [eta, setEta] = useState(12);
  const [showComplete, setShowComplete] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

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

  const { data: jobPhotos = [] } = useQuery({
    queryKey: ['job-photos', booking?.id],
    queryFn: async () => {
      if (!booking?.id) return [];
      const { data } = await supabase.from('job_photos').select('*').eq('booking_id', booking.id).order('uploaded_at', { ascending: true });
      return data || [];
    },
    enabled: !!booking?.id,
  });

  const { data: cleanerProfile } = useQuery({
    queryKey: ['cleaner-profile-phone', booking?.cleaner_id],
    queryFn: async () => {
      if (!booking?.cleaner_id) return null;
      const { data: cleanerRec } = await supabase.from('cleaners').select('user_id').eq('id', booking.cleaner_id).maybeSingle();
      if (!cleanerRec?.user_id) return null;
      const { data: profile } = await supabase.from('profiles').select('phone').eq('user_id', cleanerRec.user_id).maybeSingle();
      return profile;
    },
    enabled: !!booking?.cleaner_id,
  });

  const beforePhotos = jobPhotos.filter((p: any) => p.photo_type === 'before');
  const afterPhotos = jobPhotos.filter((p: any) => p.photo_type === 'after');
  const allPhotoUrls = jobPhotos.map((p: any) => p.photo_url);

  useEffect(() => {
    if (booking) setLiveStatus(booking.status);
  }, [booking]);

  // Realtime booking status
  useEffect(() => {
    if (!booking?.id) return;
    const channel = supabase
      .channel(`booking-${booking.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${booking.id}` },
        (payload) => {
          const newStatus = (payload.new as any).status;
          setLiveStatus(newStatus);
          playNotificationSound();
          if (newStatus === 'completed') {
            setShowComplete(true);
            setTimeout(() => {
              navigate('/rate-service', { state: { bookingId: booking.id } });
            }, 3000);
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [booking?.id, navigate]);

  // Realtime photos - refresh when cleaner uploads
  useEffect(() => {
    if (!booking?.id) return;
    const channel = supabase
      .channel(`photos-${booking.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'job_photos', filter: `booking_id=eq.${booking.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['job-photos', booking.id] });
          playNotificationSound();
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [booking?.id, queryClient]);

  // ETA countdown
  useEffect(() => {
    if (liveStatus !== 'en-route') return;
    setEta(12);
    const interval = setInterval(() => {
      setEta(prev => {
        if (prev <= 1) { clearInterval(interval); return 1; }
        return prev - 1;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [liveStatus]);

  const handleCall = () => {
    const phone = cleanerProfile?.phone;
    if (phone) window.open(`tel:${phone}`, '_self');
    else alert('Phone number not available yet.');
  };

  const handleChat = () => {
    navigate('/chat', { state: { bookingId: booking?.id, otherName: booking?.cleaner_name, otherPhone: cleanerProfile?.phone } });
  };

  const handleCancel = async () => {
    if (booking?.id) {
      await supabase.from('bookings').update({ status: 'cancelled' as any }).eq('id', booking.id);
    }
    navigate('/home', { replace: true });
  };

  const mapMarkers = booking?.cleaner_name
    ? [
        { id: 'self', x: 55, y: 65, label: 'You', type: 'self' as const },
        { id: 'cleaner', x: liveStatus === 'in-progress' ? 54 : 30, y: liveStatus === 'in-progress' ? 64 : 25, label: booking.cleaner_name, type: 'cleaner' as const, pulse: true },
      ]
    : [{ id: 'self', x: 55, y: 65, label: 'You', type: 'self' as const }];

  return (
    <CustomerLayout>
      <PageTransition>
        {/* Completion celebration */}
        <AnimatePresence>
          {showComplete && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center px-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
                className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mb-6">
                <CircleCheck className="h-10 w-10 text-primary" strokeWidth={1.5} />
              </motion.div>
              <h2 className="text-2xl font-display font-black text-foreground mb-2">Cleaning Complete! ✨</h2>
              <p className="text-sm text-muted-foreground">Taking you to rate your experience...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center gap-3 mb-5">
            <BackButton to="/home" />
            <h1 className="text-xl font-display font-black text-foreground">Booking Status</h1>
            <Badge className="ml-auto text-[10px] rounded-lg font-semibold border-0 bg-primary/10 text-primary capitalize">
              {statusLabel[liveStatus] || liveStatus}
            </Badge>
          </div>

          {/* Map with pathway */}
          <SimulatedMap markers={mapMarkers} height={200} className="rounded-2xl mb-5">
            {booking?.cleaner_name && liveStatus !== 'in-progress' && (
              <svg className="absolute inset-0 w-full h-full z-[5] pointer-events-none">
                <line x1="30%" y1="25%" x2="55%" y2="65%" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="8 4" opacity="0.5" />
              </svg>
            )}
          </SimulatedMap>

          {/* ETA banner */}
          {liveStatus === 'en-route' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent border border-primary/20 rounded-2xl p-4 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Timer className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-display font-bold text-foreground text-sm">ETA: ~{eta} minutes</p>
                <p className="text-xs text-muted-foreground">Your cleaner is on the way</p>
              </div>
            </motion.div>
          )}

          {/* Cleaner profile card with call/chat */}
          {booking?.cleaner_name && (
            <div className="border border-border rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
                  {booking.cleaner_name[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-foreground">{booking.cleaner_name}</h3>
                  <p className="text-xs text-muted-foreground">{booking.service_name} · {booking.duration}h</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={handleCall} className="flex-1 rounded-xl font-medium text-xs h-10 border-primary/20 text-primary hover:bg-accent">
                  <Phone className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Call
                </Button>
                <Button variant="outline" size="sm" onClick={handleChat} className="flex-1 rounded-xl font-medium text-xs h-10 border-primary/20 text-primary hover:bg-accent">
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Chat
                </Button>
              </div>
            </div>
          )}

          {/* OTP section */}
          {(liveStatus === 'en-route' || liveStatus === 'assigned') && booking?.otp && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary rounded-2xl p-5 mb-4 text-center">
              <p className="text-xs text-primary-foreground/60 mb-2 font-medium uppercase tracking-wider">Share code with cleaner</p>
              <div className="text-3xl font-display font-black tracking-[0.4em] text-primary-foreground">{booking.otp}</div>
            </motion.div>
          )}

          {/* Job Photos */}
          {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
            <div className="mb-4">
              <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-1.5">
                <Image className="h-4 w-4" strokeWidth={1.5} /> Job Photos
              </h3>
              {beforePhotos.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5">Before ({beforePhotos.length})</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {beforePhotos.map((p: any, i: number) => (
                      <div key={p.id} className="shrink-0 rounded-xl overflow-hidden border border-border cursor-pointer"
                        onClick={() => { setViewerIndex(allPhotoUrls.indexOf(p.photo_url)); setViewerOpen(true); }}>
                        <img src={p.photo_url} alt={`Before ${i + 1}`} className="w-24 h-24 object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {afterPhotos.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5">After ({afterPhotos.length})</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {afterPhotos.map((p: any, i: number) => (
                      <div key={p.id} className="shrink-0 rounded-xl overflow-hidden border border-border cursor-pointer"
                        onClick={() => { setViewerIndex(allPhotoUrls.indexOf(p.photo_url)); setViewerOpen(true); }}>
                        <img src={p.photo_url} alt={`After ${i + 1}`} className="w-24 h-24 object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <ImageViewer images={allPhotoUrls} currentIndex={viewerIndex} open={viewerOpen}
                onOpenChange={setViewerOpen} onIndexChange={setViewerIndex} />
            </div>
          )}

          {/* Booking info */}
          <div className="border border-border rounded-2xl p-5 mb-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
              <span>{booking?.address_line1}, {booking?.address_postcode}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
              <span>{booking?.date} at {booking?.time} · {booking?.duration}h</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-display font-black text-lg">
              <span>Total</span>
              <span className="text-primary">£{booking?.total_cost}</span>
            </div>
          </div>

          {/* Cancel / Rate buttons */}
          {['pending', 'assigned', 'en-route'].includes(liveStatus) && (
            <Button variant="ghost" onClick={handleCancel} className="w-full text-destructive font-semibold text-sm">
              <XCircle className="h-4 w-4 mr-1.5" /> Cancel Booking
            </Button>
          )}

          {liveStatus === 'completed' && !showComplete && (
            <Button onClick={() => navigate('/rate-service', { state: { bookingId: booking?.id } })} className="w-full h-14 font-semibold text-base rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90">
              Rate Service
            </Button>
          )}
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
