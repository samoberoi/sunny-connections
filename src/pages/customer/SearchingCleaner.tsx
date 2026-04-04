import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, MessageCircle, Phone, Copy, ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import { useCleaners } from '@/hooks/useCleaners';
import { toast } from 'sonner';

type Phase = 'searching' | 'found' | 'confirmed';

export default function SearchingCleaner() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { data: cleaners } = useCleaners();
  const [phase, setPhase] = useState<Phase>('searching');
  const [dots, setDots] = useState('');
  const cleaner = cleaners?.[0];
  const otp = state?.otp || '1111';

  // Simulate search -> found -> confirmed
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('found'), 4000);
    const t2 = setTimeout(() => setPhase('confirmed'), 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Animated dots
  useEffect(() => {
    if (phase !== 'searching') return;
    const interval = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(interval);
  }, [phase]);

  const copyOtp = () => {
    navigator.clipboard.writeText(otp);
    toast.success('OTP copied!');
  };

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6 min-h-[80vh] flex flex-col">
          {/* Simulated map area */}
          <div className="relative bg-muted rounded-2xl overflow-hidden mb-6 flex-shrink-0" style={{ height: 280 }}>
            {/* Grid pattern to simulate a map */}
            <div className="absolute inset-0 opacity-[0.08]" style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }} />

            {/* "Streets" */}
            <div className="absolute top-1/3 left-0 right-0 h-px bg-foreground/10" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-foreground/10" />
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-foreground/10" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-foreground/10" />

            {/* Your location */}
            <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 rounded-full bg-foreground" />
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-foreground animate-pulse-ring" />
            </div>

            {/* Searching cleaners - moving dots */}
            <AnimatePresence>
              {phase === 'searching' && (
                <>
                  {[
                    { x: '25%', y: '20%', delay: 0 },
                    { x: '70%', y: '40%', delay: 0.5 },
                    { x: '40%', y: '75%', delay: 1 },
                  ].map((pos, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0.3, 0.8, 0.3],
                        scale: [0.8, 1.2, 0.8],
                        x: [0, Math.random() * 20 - 10, 0],
                        y: [0, Math.random() * 20 - 10, 0],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: pos.delay }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute w-3 h-3 rounded-full bg-foreground/40"
                      style={{ left: pos.x, top: pos.y }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Cleaner found - moving towards user */}
            <AnimatePresence>
              {(phase === 'found' || phase === 'confirmed') && (
                <motion.div
                  initial={{ left: '70%', top: '20%' }}
                  animate={{ left: '45%', top: '55%' }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                  className="absolute"
                >
                  <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center shadow-elevated">
                    <Navigation className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="glass-card-elevated rounded-xl px-4 py-3">
                <AnimatePresence mode="wait">
                  {phase === 'searching' && (
                    <motion.p key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-semibold text-foreground">
                      Finding cleaners near you{dots}
                    </motion.p>
                  )}
                  {phase === 'found' && (
                    <motion.p key="found" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-semibold text-foreground">
                      {cleaner?.name || 'A cleaner'} accepted your request!
                    </motion.p>
                  )}
                  {phase === 'confirmed' && (
                    <motion.p key="confirmed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-semibold text-foreground">
                      Arriving in ~12 minutes
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Content below map */}
          <div className="flex-1 space-y-4">
            <AnimatePresence mode="wait">
              {phase === 'searching' && (
                <motion.div key="searching-info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center py-6">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-2 border-foreground border-t-transparent rounded-full mx-auto mb-4" />
                  <h2 className="text-lg font-display font-bold text-foreground">Searching nearby cleaners</h2>
                  <p className="text-sm text-muted-foreground mt-1">This usually takes a few seconds</p>
                </motion.div>
              )}

              {(phase === 'found' || phase === 'confirmed') && cleaner && (
                <motion.div key="cleaner-info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Cleaner card */}
                  <div className="border border-border rounded-2xl p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center text-primary-foreground font-semibold text-lg">
                        {cleaner.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-foreground">{cleaner.name}</h3>
                          {cleaner.verified && <ShieldCheck className="h-4 w-4 text-foreground" strokeWidth={1.5} />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Star className="h-3 w-3 text-foreground" strokeWidth={1.5} />
                          <span className="text-xs text-muted-foreground">{cleaner.rating} · {cleaner.review_count} reviews · {cleaner.experience} yrs</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1 rounded-xl font-medium text-xs h-10">
                        <Phone className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Call
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 rounded-xl font-medium text-xs h-10">
                        <MessageCircle className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Chat
                      </Button>
                    </div>
                  </div>

                  {/* OTP */}
                  <div className="bg-foreground rounded-2xl p-6 text-center">
                    <p className="text-xs text-primary-foreground/40 mb-3 font-medium uppercase tracking-wider">Share this code with your cleaner</p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-4xl font-display font-black tracking-[0.4em] text-primary-foreground">{otp}</div>
                      <button onClick={copyOtp} className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                        <Copy className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  {/* Booking summary */}
                  <div className="border border-border rounded-2xl p-5 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span>{state?.address || '42 Baker Street'}, {state?.postcode || 'NW1 6XE'}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-display font-black text-lg">
                      <span>Total</span>
                      <span>£{state?.totalCost || 54}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate('/active-booking', { state: { bookingId: state?.bookingId } })}
                    className="w-full h-14 font-semibold text-base rounded-2xl"
                  >
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
