import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, MessageCircle, Phone, Copy, ShieldCheck, Star, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Phase = 'searching' | 'found' | 'confirmed';

const cancelReasons = [
  'Taking too long',
  'Changed my mind',
  'Found another service',
  'Price too high',
  'Other',
];

export default function SearchingCleaner() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('searching');
  const [dots, setDots] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [assignedCleaner, setAssignedCleaner] = useState<{ name: string; rating: number; review_count: number; experience: number; verified: boolean } | null>(null);

  const bookingId = state?.bookingId;
  const otp = state?.otp || '1111';

  useEffect(() => {
    if (bookingId) sessionStorage.setItem('searching_booking', JSON.stringify(state));
  }, [bookingId, state]);

  const savedState = bookingId ? state : (() => {
    try { return JSON.parse(sessionStorage.getItem('searching_booking') || 'null'); } catch { return null; }
  })();

  const effectiveBookingId = bookingId || savedState?.bookingId;
  const effectiveOtp = otp || savedState?.otp || '1111';

  // Check initial status
  useEffect(() => {
    if (!effectiveBookingId) return;
    const checkStatus = async () => {
      const { data } = await supabase.from('bookings').select('*').eq('id', effectiveBookingId).maybeSingle();
      if (data?.status === 'cancelled') { navigate('/home', { replace: true }); return; }
      if (data?.cleaner_id) {
        const { data: cleaner } = await supabase.from('cleaners').select('*').eq('id', data.cleaner_id).maybeSingle();
        if (cleaner) {
          setAssignedCleaner({ name: cleaner.name, rating: Number(cleaner.rating), review_count: cleaner.review_count, experience: cleaner.experience, verified: cleaner.verified });
          setPhase('confirmed');
        }
      }
    };
    checkStatus();
  }, [effectiveBookingId]);

  // Realtime updates — handle both assignment AND cancellation by cleaner
  useEffect(() => {
    if (!effectiveBookingId) return;
    const channel = supabase
      .channel(`booking-${effectiveBookingId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${effectiveBookingId}` }, async (payload) => {
        const updated = payload.new as any;
        // Cleaner cancelled — go back to searching
        if (!updated.cleaner_id && updated.status === 'pending') {
          setAssignedCleaner(null);
          setPhase('searching');
          toast.info('Cleaner unavailable, finding another...');
          return;
        }
        if (updated.status === 'cancelled') {
          navigate('/home', { replace: true });
          return;
        }
        if (updated.cleaner_id) {
          const { data: cleaner } = await supabase.from('cleaners').select('*').eq('id', updated.cleaner_id).maybeSingle();
          if (cleaner) {
            setAssignedCleaner({ name: cleaner.name, rating: Number(cleaner.rating), review_count: cleaner.review_count, experience: cleaner.experience, verified: cleaner.verified });
            setPhase('found');
            setTimeout(() => setPhase('confirmed'), 3000);
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [effectiveBookingId, navigate]);

  // Polling fallback
  useEffect(() => {
    if (phase !== 'searching' || !effectiveBookingId) return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from('bookings').select('*').eq('id', effectiveBookingId).maybeSingle();
      if (data?.cleaner_id) {
        const { data: cleaner } = await supabase.from('cleaners').select('*').eq('id', data.cleaner_id).maybeSingle();
        if (cleaner) {
          setAssignedCleaner({ name: cleaner.name, rating: Number(cleaner.rating), review_count: cleaner.review_count, experience: cleaner.experience, verified: cleaner.verified });
          setPhase('found');
          setTimeout(() => setPhase('confirmed'), 3000);
          clearInterval(interval);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [phase, effectiveBookingId]);

  useEffect(() => {
    if (phase !== 'searching') return;
    const interval = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(interval);
  }, [phase]);

  const copyOtp = () => {
    navigator.clipboard.writeText(effectiveOtp);
    toast.success('OTP copied!');
  };

  // Intercept back button
  useEffect(() => {
    if (phase !== 'searching') return;
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
      setShowCancelDialog(true);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [phase]);

  const handleCancelBooking = async () => {
    if (effectiveBookingId) {
      await supabase.from('bookings').update({ status: 'cancelled' as any }).eq('id', effectiveBookingId);
      sessionStorage.removeItem('searching_booking');
    }
    toast.success('Booking cancelled');
    navigate('/home', { replace: true });
  };

  const displayState = savedState || state || {};

  return (
    <CustomerLayout>
      <PageTransition>
        {/* Cancel dialog with reason */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent className="rounded-3xl mx-4 max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display font-bold text-lg">Cancel this booking?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                Please tell us why you'd like to cancel.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <RadioGroup value={cancelReason} onValueChange={setCancelReason} className="space-y-2 py-2">
              {cancelReasons.map(r => (
                <div key={r} className="flex items-center gap-3">
                  <RadioGroupItem value={r} id={r} />
                  <Label htmlFor={r} className="text-sm cursor-pointer">{r}</Label>
                </div>
              ))}
            </RadioGroup>
            <AlertDialogFooter className="flex gap-2">
              <AlertDialogCancel className="flex-1 rounded-full h-12 font-bold">Stay</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelBooking} className="flex-1 rounded-full h-12 font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Cancel Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="px-5 pt-6 pb-6 min-h-[80vh] flex flex-col">
          {/* Map area */}
          <div className="relative bg-accent rounded-2xl overflow-hidden mb-6 flex-shrink-0" style={{ height: 280 }}>
            <div className="absolute inset-0 opacity-[0.08]" style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }} />
            <div className="absolute top-1/3 left-0 right-0 h-px bg-primary/10" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-primary/10" />
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-primary/10" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-primary/10" />
            <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 rounded-full bg-primary" />
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary animate-pulse-ring" />
            </div>

            <AnimatePresence>
              {phase === 'searching' && (
                <>
                  {[{ x: '25%', y: '20%', delay: 0 }, { x: '70%', y: '40%', delay: 0.5 }, { x: '40%', y: '75%', delay: 1 }].map((pos, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8], x: [0, Math.random() * 20 - 10, 0], y: [0, Math.random() * 20 - 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: pos.delay }} exit={{ opacity: 0, scale: 0 }}
                      className="absolute w-3 h-3 rounded-full bg-primary/40" style={{ left: pos.x, top: pos.y }} />
                  ))}
                </>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {(phase === 'found' || phase === 'confirmed') && (
                <motion.div initial={{ left: '70%', top: '20%' }} animate={{ left: '45%', top: '55%' }} transition={{ duration: 2, ease: 'easeInOut' }} className="absolute">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-elevated">
                    <Navigation className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-4 left-4 right-4">
              <div className="glass-card-elevated rounded-xl px-4 py-3">
                <AnimatePresence mode="wait">
                  {phase === 'searching' && <motion.p key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-semibold text-foreground">Finding cleaners near you{dots}</motion.p>}
                  {phase === 'found' && <motion.p key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-semibold text-primary">{assignedCleaner?.name || 'A cleaner'} accepted your request!</motion.p>}
                  {phase === 'confirmed' && <motion.p key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-semibold text-primary">Arriving in ~12 minutes</motion.p>}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <AnimatePresence mode="wait">
              {phase === 'searching' && (
                <motion.div key="searching-info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center py-6">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <h2 className="text-lg font-display font-bold text-foreground">Searching nearby cleaners</h2>
                  <p className="text-sm text-muted-foreground mt-1">This usually takes a few seconds</p>
                  <Button variant="ghost" onClick={() => setShowCancelDialog(true)} className="mt-6 text-destructive font-semibold text-sm">
                    <XCircle className="h-4 w-4 mr-1.5" /> Cancel Request
                  </Button>
                </motion.div>
              )}

              {(phase === 'found' || phase === 'confirmed') && assignedCleaner && (
                <motion.div key="cleaner-info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="border border-border rounded-2xl p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
                        {assignedCleaner.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-foreground">{assignedCleaner.name}</h3>
                          {assignedCleaner.verified && <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.5} />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Star className="h-3 w-3 text-primary" strokeWidth={1.5} />
                          <span className="text-xs text-muted-foreground">{assignedCleaner.rating} · {assignedCleaner.review_count} reviews · {assignedCleaner.experience} yrs</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1 rounded-xl font-medium text-xs h-10 border-primary/20 text-primary hover:bg-accent">
                        <Phone className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Call
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 rounded-xl font-medium text-xs h-10 border-primary/20 text-primary hover:bg-accent">
                        <MessageCircle className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Chat
                      </Button>
                    </div>
                  </div>

                  <div className="bg-primary rounded-2xl p-6 text-center">
                    <p className="text-xs text-primary-foreground/60 mb-3 font-medium uppercase tracking-wider">Share this code with your cleaner</p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-4xl font-display font-black tracking-[0.4em] text-primary-foreground">{effectiveOtp}</div>
                      <button onClick={copyOtp} className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors">
                        <Copy className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  <div className="border border-border rounded-2xl p-5 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
                      <span>{displayState?.address || '42 Baker Street'}, {displayState?.postcode || 'NW1 6XE'}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-display font-black text-lg">
                      <span>Total</span>
                      <span className="text-primary">£{displayState?.totalCost || 54}</span>
                    </div>
                  </div>

                  <Button onClick={() => navigate('/active-booking', { state: { bookingId: effectiveBookingId } })} className="w-full h-14 font-semibold text-base rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90">
                    Track Live
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
