import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, User, CalendarDays, Zap, Star, ChevronRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/components/layout/CustomerLayout';
import WelcomeCoupon from '@/components/WelcomeCoupon';
import PageTransition from '@/components/PageTransition';
import SimulatedMap, { generateCleanerMarkers } from '@/components/SimulatedMap';
import { useAuth } from '@/contexts/AuthContext';
import { useCleaners } from '@/hooks/useCleaners';
import cleanBathroom from '@/assets/clean-bathroom.jpg';

export default function CustomerHome() {
  const [showCoupon, setShowCoupon] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: cleaners } = useCleaners();

  useEffect(() => {
    const seen = sessionStorage.getItem('coupon_shown');
    if (!seen) { setShowCoupon(true); sessionStorage.setItem('coupon_shown', '1'); }
  }, []);

  const topCleaners = cleaners?.filter(c => c.available).slice(0, 4) || [];
  const firstName = user?.name?.split(' ')[0] || 'there';

  const mapMarkers = useMemo(() => {
    const availableCount = cleaners?.filter(c => c.available).length || 3;
    return generateCleanerMarkers(Math.min(availableCount, 6));
  }, [cleaners]);

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };

  return (
    <CustomerLayout>
      <WelcomeCoupon open={showCoupon} onClose={() => setShowCoupon(false)} onClaim={() => setShowCoupon(false)} />
      <PageTransition>
        <div className="relative min-h-screen">
          {/* Fixed map background - top half */}
          <div className="sticky top-0 z-0">
            <SimulatedMap markers={mapMarkers} height={420} className="">
              {/* Top white blur for header readability */}
              <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-white/90 via-white/60 to-transparent pointer-events-none z-10" />
              {/* Bottom fade */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60 pointer-events-none" />
            </SimulatedMap>

            {/* Header overlay on map */}
            <div className="absolute top-0 left-0 right-0 px-6 pt-14 z-20">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-display font-black text-foreground leading-none">
                    Hello,<br />{firstName}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate('/notifications')} className="w-11 h-11 rounded-full bg-white/80 backdrop-blur-md border border-border flex items-center justify-center shadow-sm">
                    <Bell className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => navigate('/profile')} className="w-11 h-11 rounded-full bg-foreground flex items-center justify-center shadow-sm">
                    <User className="h-5 w-5 text-background" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>

            {/* Nearby count badge on map */}
            <div className="absolute bottom-6 left-6 z-20">
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 shadow-sm border border-border">
                <MapPin className="h-3.5 w-3.5 text-primary-ink" strokeWidth={2} />
                <span className="text-[11px] font-bold text-foreground/70">{topCleaners.length} cleaners nearby</span>
              </div>
            </div>
          </div>

          {/* Scrollable content over map */}
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="relative z-10 bg-muted/60 rounded-t-[2rem] -mt-8 px-5 pt-6 pb-4 space-y-5 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">

            {/* Two booking paths */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/schedule-booking')}
                className="bg-card rounded-3xl p-5 text-left shadow-soft border border-border relative overflow-hidden">
                <img src={cleanBathroom} alt="" className="absolute top-0 right-0 w-20 h-20 object-cover rounded-bl-3xl opacity-30" loading="lazy" width={800} height={512} />
                <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center mb-3">
                  <CalendarDays className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <h4 className="font-display font-black text-foreground text-base leading-tight">Schedule<br/>Cleaning</h4>
                <p className="text-[10px] text-muted-foreground mt-1">From £12/hr</p>
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/express-booking')}
                className="bg-foreground rounded-3xl p-5 text-left shadow-soft relative overflow-hidden">
                <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center mb-3">
                  <Zap className="h-5 w-5 text-primary-foreground" strokeWidth={1.5} />
                </div>
                <h4 className="font-display font-black text-background text-base leading-tight">Express<br/>Clean</h4>
                <p className="text-[10px] text-background/40 mt-1">Instant</p>
              </motion.button>
            </motion.div>

            {/* Stats row */}
            <motion.div variants={fadeUp} className="bg-foreground rounded-3xl p-5 flex justify-between items-center">
              {[
                { value: '25+', label: 'Years' },
                { value: '2K+', label: 'Clients' },
                { value: '80+', label: 'Pros' },
                { value: '#1', label: 'UK App' },
              ].map((stat, i) => (
                <div key={stat.label} className="text-center">
                  <div className={`text-xl font-display font-black ${i === 0 ? 'text-primary' : 'text-background'}`}>{stat.value}</div>
                  <div className="text-[9px] text-background/40 font-medium mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Refer card */}
            <motion.div variants={fadeUp} className="bg-primary rounded-3xl p-6 flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/60 text-[10px] font-bold uppercase tracking-[0.15em]">Refer a Mate</p>
                <p className="text-primary-foreground text-2xl font-display font-black">First 3 for £50</p>
              </div>
              <Button size="sm" className="rounded-full font-bold bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-10 px-5">
                Share <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </motion.div>

            {/* Top Cleaners */}
            <motion.section variants={fadeUp} className="pb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-foreground text-sm">Top Rated</h3>
                <span className="text-[11px] text-muted-foreground font-medium">View all →</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {topCleaners.map((cleaner, i) => (
                  <motion.div
                    key={cleaner.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.35 }}
                    className="bg-card rounded-3xl p-4 min-w-[120px] text-center shrink-0 shadow-soft border border-border"
                  >
                    <div className="w-14 h-14 rounded-full bg-foreground mx-auto mb-2 flex items-center justify-center text-background font-bold text-lg">
                      {cleaner.name[0]}
                    </div>
                    <p className="text-sm font-bold text-foreground">{cleaner.name.split(' ')[0]}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-primary" strokeWidth={2} fill="hsl(78, 85%, 65%)" />
                      <span className="text-xs text-muted-foreground font-bold">{cleaner.rating}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </motion.div>
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
