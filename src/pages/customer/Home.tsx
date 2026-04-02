import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Sparkles, Home, ArrowRight, Zap, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/components/layout/CustomerLayout';
import TrustBadges from '@/components/TrustBadges';
import WelcomeCoupon from '@/components/WelcomeCoupon';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerHome() {
  const [showCoupon, setShowCoupon] = useState(true);
  const [bookingType, setBookingType] = useState<'instant' | 'schedule'>('instant');
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <CustomerLayout>
      <WelcomeCoupon open={showCoupon} onClose={() => setShowCoupon(false)} onClaim={() => setShowCoupon(false)} />

      {/* Header */}
      <div className="gradient-hero px-6 pt-6 pb-10 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 text-sm">Good morning,</p>
            <h1 className="font-display text-xl font-bold text-primary-foreground">{user?.name || 'Guest'} 👋</h1>
          </div>
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-secondary" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/10 backdrop-blur-md rounded-2xl p-5 border border-primary-foreground/10"
        >
          <h2 className="font-display text-lg font-semibold text-primary-foreground mb-1">Spotless homes, happy lives</h2>
          <p className="text-primary-foreground/60 text-sm mb-4">Book a verified professional in under 60 seconds</p>
          <div className="flex gap-2">
            <Button
              onClick={() => setBookingType('instant')}
              variant={bookingType === 'instant' ? 'default' : 'outline'}
              size="sm"
              className={bookingType === 'instant' ? 'gradient-gold text-secondary-foreground' : 'border-primary-foreground/20 text-primary-foreground'}
            >
              <Zap className="h-4 w-4 mr-1" /> Instant
            </Button>
            <Button
              onClick={() => setBookingType('schedule')}
              variant={bookingType === 'schedule' ? 'default' : 'outline'}
              size="sm"
              className={bookingType === 'schedule' ? 'gradient-gold text-secondary-foreground' : 'border-primary-foreground/20 text-primary-foreground'}
            >
              <CalendarDays className="h-4 w-4 mr-1" /> Schedule
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        {/* Service Categories */}
        <section>
          <h3 className="font-display text-lg font-semibold text-foreground mb-3">What do you need?</h3>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/services?cat=cleaning')}
              className="glass-card rounded-xl p-5 text-left hover:shadow-md transition-all"
            >
              <Sparkles className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-display font-semibold text-foreground">Cleaning</h4>
              <p className="text-xs text-muted-foreground mt-1">Deep clean, regular, end of tenancy</p>
              <ArrowRight className="h-4 w-4 text-primary mt-3" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/services?cat=housekeeping')}
              className="glass-card rounded-xl p-5 text-left hover:shadow-md transition-all"
            >
              <Home className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-display font-semibold text-foreground">Housekeeping</h4>
              <p className="text-xs text-muted-foreground mt-1">Laundry, organising, daily upkeep</p>
              <ArrowRight className="h-4 w-4 text-primary mt-3" />
            </motion.button>
          </div>
        </section>

        {/* Trust Badges */}
        <section>
          <h3 className="font-display text-lg font-semibold text-foreground mb-3">Why Indiana Green?</h3>
          <TrustBadges />
        </section>

        {/* Recent Cleaners */}
        <section className="pb-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-3">Top Rated Cleaners</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {['Emma T.', 'James W.', 'Sarah P.', 'Priya S.'].map((name, i) => (
              <div key={name} className="glass-card rounded-xl p-4 min-w-[120px] text-center shrink-0">
                <div className="w-14 h-14 rounded-full gradient-primary mx-auto mb-2 flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {name[0]}
                </div>
                <p className="text-sm font-medium text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">⭐ 4.{9 - i}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </CustomerLayout>
  );
}
