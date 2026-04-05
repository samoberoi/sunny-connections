import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Clock, ChevronRight, User, Bell, Star, ArrowRight, CalendarDays, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/components/layout/CustomerLayout';
import WelcomeCoupon from '@/components/WelcomeCoupon';
import PageTransition from '@/components/PageTransition';
import { useAuth } from '@/contexts/AuthContext';
import { useCleaners } from '@/hooks/useCleaners';
import cleanKitchen from '@/assets/clean-kitchen.jpg';

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
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <CustomerLayout>
      <WelcomeCoupon open={showCoupon} onClose={() => setShowCoupon(false)} onClaim={() => setShowCoupon(false)} />

      <PageTransition>
        {/* Header with lime accent */}
        <div className="bg-primary rounded-b-[2.5rem] px-6 pt-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-primary-foreground/60 font-bold uppercase tracking-[0.2em]">
                {(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; })()}
              </p>
              <h1 className="text-2xl font-display font-black text-primary-foreground">{firstName}</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate('/notifications')} className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Bell className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
              </button>
              <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-primary-foreground flex items-center justify-center">
                <User className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        <motion.div variants={stagger} initial="hidden" animate="show" className="px-5 -mt-5 space-y-4">
          {/* Hero card with image */}
          <motion.div variants={fadeUp} className="rounded-3xl overflow-hidden relative bg-card shadow-medium" style={{ height: 180 }}>
            <img
              src={cleanKitchen}
              alt="Sparkling clean kitchen"
              className="w-full h-full object-cover"
              width={800}
              height={512}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h2 className="text-xl font-display font-black text-white leading-tight mb-3">
                Your home, <span className="text-primary">sorted.</span>
              </h2>
              <Button
                onClick={() => navigate('/schedule-booking')}
                size="sm"
                className="bg-primary text-primary-foreground rounded-full font-bold text-xs h-9 px-5 hover:bg-primary/90"
              >
                Book Now
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" strokeWidth={2} />
              </Button>
            </div>
          </motion.div>

          {/* Two booking paths */}
          <motion.div variants={fadeUp} className="space-y-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Book a Service</h3>
            <div className="space-y-2.5">
              {[
                { icon: CalendarDays, label: 'Schedule Cleaning', desc: 'Pick services, date, time & frequency', tag: 'From £12/hr', route: '/schedule-booking' },
                { icon: Zap, label: 'Express Clean', desc: 'Instant booking — cleaner heads to you now', tag: 'Premium', route: '/express-booking' },
              ].map((item) => (
                <motion.button
                  key={item.label}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(item.route)}
                  className="w-full bg-card border border-border rounded-2xl p-4 text-left flex items-center gap-4 hover:border-primary/30 transition-all shadow-soft"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground text-sm">{item.label}</h4>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold text-primary-foreground bg-foreground px-2.5 py-1 rounded-full shrink-0">{item.tag}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="grid grid-cols-4 gap-2">
            {[
              { value: '25+', label: 'Years' },
              { value: '2K+', label: 'Clients' },
              { value: '80+', label: 'Pros' },
              { value: '#1', label: 'UK App' },
            ].map(stat => (
              <div key={stat.label} className="bg-card border border-border rounded-2xl p-3 text-center shadow-soft">
                <div className="text-lg font-display font-black text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Refer */}
          <motion.div variants={fadeUp} className="bg-foreground rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">Refer a Mate</p>
              <p className="text-background text-lg font-display font-black">First 3 for £50</p>
            </div>
            <Button size="sm" className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90">
              Share
            </Button>
          </motion.div>

          {/* Top Cleaners */}
          <motion.section variants={fadeUp} className="pb-6">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Top Rated</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {topCleaners.map((cleaner, i) => (
                <motion.div
                  key={cleaner.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.35 }}
                  className="bg-card border border-border rounded-2xl p-4 min-w-[110px] text-center shrink-0 shadow-soft"
                >
                  <div className="w-12 h-12 rounded-full bg-foreground mx-auto mb-2 flex items-center justify-center text-background font-bold text-sm">
                    {cleaner.name[0]}
                  </div>
                  <p className="text-sm font-bold text-foreground">{cleaner.name.split(' ')[0]}</p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 text-primary" strokeWidth={2} fill="hsl(78, 85%, 65%)" />
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
