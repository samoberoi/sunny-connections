import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Home, Zap, CalendarDays, Clock, MapPin, ChevronRight, User, MessageCircle, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/components/layout/CustomerLayout';
import TrustBadges from '@/components/TrustBadges';
import WelcomeCoupon from '@/components/WelcomeCoupon';
import PageTransition from '@/components/PageTransition';
import { useAuth } from '@/contexts/AuthContext';
import { useCleaners } from '@/hooks/useCleaners';

export default function CustomerHome() {
  const [showCoupon, setShowCoupon] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: cleaners } = useCleaners();

  useEffect(() => {
    const seen = sessionStorage.getItem('coupon_shown');
    if (!seen) {
      setShowCoupon(true);
      sessionStorage.setItem('coupon_shown', '1');
    }
  }, []);

  const topCleaners = cleaners?.filter(c => c.available).slice(0, 4) || [];

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <CustomerLayout>
      <WelcomeCoupon open={showCoupon} onClose={() => setShowCoupon(false)} onClaim={() => setShowCoupon(false)} />

      <PageTransition>
        {/* Map area */}
        <div className="relative h-[42vh] bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-muted to-muted/80">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            {[
              { top: '25%', left: '30%', delay: 0 },
              { top: '40%', left: '55%', delay: 0.5 },
              { top: '30%', left: '70%', delay: 1 },
              { top: '55%', left: '25%', delay: 1.5 },
              { top: '45%', left: '80%', delay: 0.8 },
            ].map((pos, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1, y: [0, -6, 0] }}
                transition={{ delay: pos.delay + 0.3, y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
                className="absolute w-8 h-8 rounded-full gradient-blue shadow-blue flex items-center justify-center"
                style={{ top: pos.top, left: pos.left }}
              >
                <User className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
              </motion.div>
            ))}
            <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-5 h-5 rounded-full bg-primary shadow-blue animate-pulse" />
                <div className="absolute inset-0 w-5 h-5 rounded-full bg-primary/30 animate-ping" />
              </div>
            </div>
          </div>

          <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-foreground">Home</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" strokeWidth={1.5} /> London, United Kingdom
              </p>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center" onClick={() => navigate('/notifications')}>
                <MessageCircle className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </button>
              <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center" onClick={() => setShowCoupon(true)}>
                <Ticket className="h-4 w-4 text-secondary" strokeWidth={1.5} />
              </button>
              <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full glass-card flex items-center justify-center">
                <User className="h-4 w-4 text-foreground" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        <motion.div variants={stagger} initial="hidden" animate="show" className="relative -mt-8 bg-background rounded-t-[2rem] px-5 pt-6 space-y-5">
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/services?cat=cleaning')}
              className="glass-card rounded-2xl p-4 text-left shadow-apple hover:shadow-apple-lg transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
                <CalendarDays className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground text-sm">Schedule</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Pick your time</p>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/services?cat=housekeeping')}
              className="glass-card rounded-2xl p-4 text-left shadow-apple hover:shadow-apple-lg transition-shadow relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
                <Zap className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-semibold bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                  15 Min
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground text-sm">Instant</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Get help now</p>
            </motion.button>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-secondary/10 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
              <PoundSterling className="h-4 w-4 text-secondary" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-foreground">
              Get <span className="text-secondary font-bold">£10 cashback</span> on your first service.
            </p>
          </motion.div>

          <motion.section variants={fadeUp}>
            <h3 className="text-lg font-bold text-foreground mb-3">One Expert Who Can Do It All</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Sparkles, label: 'Cleaning' },
                { icon: Home, label: 'Housekeeping' },
                { icon: Clock, label: 'Deep Clean' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate('/services')}
                  className="glass-card rounded-2xl p-3 text-center hover:shadow-apple-lg transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-2">
                    <item.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <p className="text-xs font-medium text-foreground">{item.label}</p>
                </button>
              ))}
            </div>
          </motion.section>

          <motion.section variants={fadeUp}>
            <h3 className="text-lg font-bold text-foreground mb-3">Why Cleanfit?</h3>
            <TrustBadges />
          </motion.section>

          <motion.div variants={fadeUp} className="gradient-blue rounded-2xl p-5 flex items-center justify-between shadow-blue">
            <div>
              <p className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-wide">First 3 Visits</p>
              <p className="text-primary-foreground text-lg font-bold">Just for £50</p>
            </div>
            <Button
              size="sm"
              className="bg-primary-foreground text-primary font-semibold rounded-xl hover:bg-primary-foreground/90"
            >
              Refer Now
            </Button>
          </motion.div>

          <motion.section variants={fadeUp} className="pb-6">
            <h3 className="text-lg font-bold text-foreground mb-3">Top Rated Cleaners</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {topCleaners.map((cleaner, i) => (
                <motion.div
                  key={cleaner.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.35 }}
                  className="glass-card rounded-2xl p-4 min-w-[110px] text-center shrink-0 shadow-apple"
                >
                  <div className="w-14 h-14 rounded-full gradient-blue mx-auto mb-2 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-blue/50">
                    {cleaner.name[0]}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{cleaner.name.split(' ')[0]} {cleaner.name.split(' ')[1]?.[0]}.</p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 text-amber-400" strokeWidth={1.5} />
                    <span className="text-xs text-muted-foreground font-medium">{cleaner.rating}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </motion.div>
      </PageTransition>
    </CustomerLayout>
  );
}

import { PoundSterling, Star } from 'lucide-react';
