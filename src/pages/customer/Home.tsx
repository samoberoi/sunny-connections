import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Home, Zap, CalendarDays, Clock, MapPin, ChevronRight, Gift, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/components/layout/CustomerLayout';
import TrustBadges from '@/components/TrustBadges';
import WelcomeCoupon from '@/components/WelcomeCoupon';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerHome() {
  const [showCoupon, setShowCoupon] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <CustomerLayout>
      <WelcomeCoupon open={showCoupon} onClose={() => setShowCoupon(false)} onClaim={() => setShowCoupon(false)} />

      {/* Map area placeholder */}
      <div className="relative h-[45vh] bg-muted overflow-hidden">
        {/* Simulated map background */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted to-muted/80">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          {/* Floating cleaner dots */}
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
              transition={{ delay: pos.delay, y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
              className="absolute w-8 h-8 rounded-full gradient-blue shadow-blue flex items-center justify-center"
              style={{ top: pos.top, left: pos.left }}
            >
              <User className="h-4 w-4 text-primary-foreground" />
            </motion.div>
          ))}
          {/* User location dot */}
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-5 h-5 rounded-full bg-primary shadow-blue animate-pulse" />
              <div className="absolute inset-0 w-5 h-5 rounded-full bg-primary/30 animate-ping" />
            </div>
          </div>
        </div>

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-foreground">Home</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> London, United Kingdom
            </p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </button>
            <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center">
              <Gift className="h-4 w-4 text-secondary" />
            </button>
            <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full glass-card flex items-center justify-center">
              <User className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom content sheet */}
      <div className="relative -mt-8 bg-background rounded-t-[2rem] px-5 pt-6 space-y-5">
        {/* Schedule vs Instant cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/services?cat=cleaning')}
            className="glass-card rounded-2xl p-4 text-left shadow-apple hover:shadow-apple-lg transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-foreground">Schedule</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Pick your time</p>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/services?cat=housekeeping')}
            className="glass-card rounded-2xl p-4 text-left shadow-apple hover:shadow-apple-lg transition-shadow relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-semibold bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                ⚡ 15 Min
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-foreground">Instant</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Get help now</p>
          </motion.button>
        </div>

        {/* Cashback banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-secondary/10 rounded-2xl px-4 py-3 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
            <span className="text-sm">💰</span>
          </div>
          <p className="text-sm font-medium text-foreground">
            Get <span className="text-secondary font-bold">£10 cashback</span> on your first service.
          </p>
        </motion.div>

        {/* Service Categories */}
        <section>
          <h3 className="text-lg font-bold text-foreground mb-3">One Expert Who Can Do It All</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Sparkles, label: 'Cleaning', img: '🧹' },
              { icon: Home, label: 'Housekeeping', img: '🏠' },
              { icon: Clock, label: 'Deep Clean', img: '✨' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate('/services')}
                className="glass-card rounded-2xl p-3 text-center hover:shadow-apple-lg transition-all"
              >
                <div className="text-2xl mb-2">{item.img}</div>
                <p className="text-xs font-medium text-foreground">{item.label}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Trust Badges */}
        <section>
          <h3 className="text-lg font-bold text-foreground mb-3">Why Cleanfit?</h3>
          <TrustBadges />
        </section>

        {/* Refer banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="gradient-blue rounded-2xl p-5 flex items-center justify-between shadow-blue"
        >
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

        {/* Top cleaners */}
        <section className="pb-6">
          <h3 className="text-lg font-bold text-foreground mb-3">Top Rated Cleaners</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {['Emma T.', 'James W.', 'Sarah P.', 'Priya S.'].map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="glass-card rounded-2xl p-4 min-w-[110px] text-center shrink-0 shadow-apple"
              >
                <div className="w-14 h-14 rounded-full gradient-blue mx-auto mb-2 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-blue/50">
                  {name[0]}
                </div>
                <p className="text-sm font-semibold text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">⭐ 4.{9 - i}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </CustomerLayout>
  );
}
