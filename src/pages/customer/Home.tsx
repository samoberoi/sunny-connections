import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Home, Clock, ChevronRight, User, Bell, Star, ArrowRight } from 'lucide-react';
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
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <CustomerLayout>
      <WelcomeCoupon open={showCoupon} onClose={() => setShowCoupon(false)} onClaim={() => setShowCoupon(false)} />

      <PageTransition>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Good morning</p>
            <h1 className="text-2xl font-display font-black text-foreground">{firstName}</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/notifications')} className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <Bell className="h-4 w-4 text-foreground" strokeWidth={1.5} />
            </button>
            <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <motion.div variants={stagger} initial="hidden" animate="show" className="px-5 space-y-5">
          {/* Hero card */}
          <motion.div variants={fadeUp} className="bg-foreground rounded-3xl p-6 relative overflow-hidden">
            <p className="text-primary-foreground/40 text-xs font-medium uppercase tracking-wider mb-1">Premium Cleaning</p>
            <h2 className="text-2xl font-display font-black text-primary-foreground leading-tight mb-4">
              Your home,<br />
              sorted.
            </h2>
            <Button
              onClick={() => navigate('/services')}
              className="bg-primary-foreground text-foreground rounded-2xl font-semibold text-sm h-11 px-6 hover:bg-primary-foreground/90"
            >
              Book Now
              <ArrowRight className="h-4 w-4 ml-2" strokeWidth={1.5} />
            </Button>
          </motion.div>

          {/* Services */}
          <motion.div variants={fadeUp} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wide">Services</h3>
              <button onClick={() => navigate('/services')} className="text-xs font-medium text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
                View all <ChevronRight className="h-3 w-3" strokeWidth={2} />
              </button>
            </div>
            <div className="space-y-2">
              {[
                { icon: Sparkles, label: 'Regular Clean', desc: 'Weekly or fortnightly', time: 'From 2hrs' },
                { icon: Home, label: 'Deep Clean', desc: 'Top-to-bottom refresh', time: 'From 4hrs' },
                { icon: Clock, label: 'Express', desc: 'Quick turnaround', time: '90 min' },
              ].map((item) => (
                <motion.button
                  key={item.label}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/services')}
                  className="w-full border border-border rounded-2xl p-4 text-left flex items-center gap-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm">{item.label}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full shrink-0">{item.time}</span>
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
              <div key={stat.label} className="border border-border rounded-2xl p-3 text-center">
                <div className="text-lg font-display font-black text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Refer */}
          <motion.div variants={fadeUp} className="border border-border rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Refer a Mate</p>
              <p className="text-foreground text-lg font-display font-black">First 3 for £50</p>
            </div>
            <Button size="sm" variant="outline" className="rounded-xl font-semibold">
              Share
            </Button>
          </motion.div>

          {/* Top Cleaners */}
          <motion.section variants={fadeUp} className="pb-6">
            <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wide mb-3">Top Rated</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {topCleaners.map((cleaner, i) => (
                <motion.div
                  key={cleaner.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.35 }}
                  className="border border-border rounded-2xl p-4 min-w-[110px] text-center shrink-0"
                >
                  <div className="w-12 h-12 rounded-full bg-foreground mx-auto mb-2 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {cleaner.name[0]}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{cleaner.name.split(' ')[0]}</p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 text-foreground" strokeWidth={1.5} />
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
