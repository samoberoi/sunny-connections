import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Home, Zap, CalendarDays, Clock, MapPin, ChevronRight, User, Ticket, PoundSterling, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/components/layout/CustomerLayout';
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
  const firstName = user?.name?.split(' ')[0] || 'there';

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <CustomerLayout>
      <WelcomeCoupon open={showCoupon} onClose={() => setShowCoupon(false)} onClaim={() => setShowCoupon(false)} />

      <PageTransition>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Hi,</p>
            <h1 className="text-2xl font-display font-black text-foreground">{firstName}</h1>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center" onClick={() => setShowCoupon(true)}>
              <Ticket className="h-4 w-4 text-foreground" strokeWidth={1.5} />
            </button>
            <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-2xl bg-foreground flex items-center justify-center">
              <User className="h-4 w-4 text-card" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <motion.div variants={stagger} initial="hidden" animate="show" className="px-5 space-y-5">
          {/* Hero card - neon green */}
          <motion.div variants={fadeUp} className="gradient-neon rounded-3xl p-6 relative overflow-hidden shadow-neon">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-foreground/5 -translate-y-1/2 translate-x-1/2" />
            <p className="text-foreground/60 text-xs font-bold uppercase tracking-wider mb-1">Premium Cleaning</p>
            <h2 className="text-2xl font-display font-black text-foreground leading-tight mb-4">
              Streamline your<br />
              home care
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate('/services?cat=cleaning')}
                className="bg-foreground text-card rounded-2xl font-bold text-sm h-11 px-5 hover:bg-foreground/90"
              >
                <CalendarDays className="h-4 w-4 mr-2" strokeWidth={1.5} />
                Schedule
              </Button>
              <Button
                onClick={() => navigate('/services?cat=housekeeping')}
                variant="outline"
                className="border-foreground/20 text-foreground rounded-2xl font-bold text-sm h-11 px-5 hover:bg-foreground/10"
              >
                <Zap className="h-4 w-4 mr-2" strokeWidth={1.5} />
                Instant
              </Button>
            </div>
          </motion.div>

          {/* Stacked service cards */}
          <motion.div variants={fadeUp} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-foreground">Services</h3>
              <button onClick={() => navigate('/services')} className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                View all <ChevronRight className="h-3 w-3" strokeWidth={2} />
              </button>
            </div>
            <div className="space-y-2">
              {[
                { icon: Sparkles, label: 'Regular Cleaning', desc: 'Weekly or fortnightly', color: 'gradient-pink', time: 'From 2hrs' },
                { icon: Home, label: 'Deep Clean', desc: 'Top-to-bottom refresh', color: 'gradient-cyan', time: 'From 4hrs' },
                { icon: Clock, label: 'Express Clean', desc: 'Quick 15-min response', color: 'gradient-neon', time: '15 min' },
              ].map((item, i) => (
                <motion.button
                  key={item.label}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/services')}
                  className={`w-full ${item.color} rounded-2xl p-4 text-left flex items-center gap-4 transition-transform`}
                  style={{ transform: `translateY(${i * -2}px)` }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-foreground/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-6 w-6 text-foreground" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground text-sm">{item.label}</h4>
                    <p className="text-xs text-foreground/60">{item.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold text-foreground/50 bg-foreground/10 px-2.5 py-1 rounded-full shrink-0">{item.time}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Cashback banner */}
          <motion.div variants={fadeUp} className="bg-foreground rounded-2xl px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-neon flex items-center justify-center shrink-0">
              <PoundSterling className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-card">
              Get <span className="text-primary font-bold">£10 cashback</span> on your first service
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp} className="grid grid-cols-4 gap-2">
            {[
              { value: '25+', label: 'Years' },
              { value: '2K+', label: 'Clients' },
              { value: '80+', label: 'Pros' },
              { value: '#1', label: 'UK App' },
            ].map(stat => (
              <div key={stat.label} className="bg-card rounded-2xl p-3 text-center shadow-apple">
                <div className="text-lg font-display font-black text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Refer banner */}
          <motion.div variants={fadeUp} className="gradient-pink rounded-2xl p-5 flex items-center justify-between shadow-pink">
            <div>
              <p className="text-foreground/60 text-xs font-bold uppercase tracking-wide">Refer a Mate</p>
              <p className="text-foreground text-lg font-display font-black">First 3 for £50</p>
            </div>
            <Button
              size="sm"
              className="bg-foreground text-card font-bold rounded-xl hover:bg-foreground/90"
            >
              Share
            </Button>
          </motion.div>

          {/* Top Cleaners */}
          <motion.section variants={fadeUp} className="pb-6">
            <h3 className="text-lg font-display font-bold text-foreground mb-3">Top Rated</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {topCleaners.map((cleaner, i) => (
                <motion.div
                  key={cleaner.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.35 }}
                  className="bg-card rounded-2xl p-4 min-w-[110px] text-center shrink-0 shadow-apple"
                >
                  <div className="w-14 h-14 rounded-2xl bg-foreground mx-auto mb-2 flex items-center justify-center text-card font-bold text-lg">
                    {cleaner.name[0]}
                  </div>
                  <p className="text-sm font-bold text-foreground">{cleaner.name.split(' ')[0]}</p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 text-primary" strokeWidth={1.5} />
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
