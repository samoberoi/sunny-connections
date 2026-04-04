import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Home, Zap, CalendarDays, Clock, MapPin, ChevronRight, Bell, User, Search } from 'lucide-react';
import CustomerLayout from '@/components/layout/CustomerLayout';
import TrustBadges from '@/components/TrustBadges';
import WelcomeCoupon from '@/components/WelcomeCoupon';
import { useAuth } from '@/contexts/AuthContext';
import { useCleaners } from '@/hooks/useCleaners';

export default function CustomerHome() {
  const [showCoupon, setShowCoupon] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: cleaners } = useCleaners();

  const topCleaners = cleaners?.filter(c => c.available).slice(0, 4) || [];

  return (
    <CustomerLayout>
      <WelcomeCoupon open={showCoupon} onClose={() => setShowCoupon(false)} onClaim={() => setShowCoupon(false)} />

      <div className="px-5 pt-6 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-secondary-foreground/40 text-xs font-medium uppercase tracking-wider">Good morning</p>
            <h1 className="text-2xl font-bold text-secondary-foreground">Hi there 👋</h1>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full glass flex items-center justify-center">
              <Bell className="h-4 w-4 text-secondary-foreground/60" />
            </button>
            <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full gradient-lime flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Location bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl px-4 py-3 flex items-center gap-3 mb-6"
        >
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-secondary-foreground/40">Your location</p>
            <p className="text-sm font-semibold text-secondary-foreground">London, United Kingdom</p>
          </div>
          <ChevronRight className="h-4 w-4 text-secondary-foreground/30" />
        </motion.div>

        {/* Quick action cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/services?cat=cleaning')}
            className="gradient-lime rounded-3xl p-5 text-left shadow-lime relative overflow-hidden"
          >
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary-foreground/10 blob animate-blob-morph" />
            <CalendarDays className="h-6 w-6 text-primary-foreground mb-8" />
            <div className="relative z-10">
              <p className="font-bold text-primary-foreground text-base">Schedule</p>
              <p className="text-primary-foreground/60 text-xs mt-0.5">Pick your time</p>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/services?cat=housekeeping')}
            className="glass rounded-3xl p-5 text-left relative overflow-hidden border border-secondary-foreground/5"
          >
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/5 blob-2 animate-blob-morph" style={{ animationDelay: '4s' }} />
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                ⚡ 15 min
              </span>
            </div>
            <Zap className="h-6 w-6 text-primary mb-8" />
            <div className="relative z-10">
              <p className="font-bold text-secondary-foreground text-base">Instant</p>
              <p className="text-secondary-foreground/40 text-xs mt-0.5">Get help now</p>
            </div>
          </motion.button>
        </div>

        {/* Promo banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl px-4 py-3 flex items-center gap-3 mb-6"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm">💰</span>
          </div>
          <p className="text-sm font-medium text-secondary-foreground">
            Get <span className="text-primary font-bold">£10 cashback</span> on your first service.
          </p>
        </motion.div>

        {/* Services grid */}
        <section className="mb-6">
          <h3 className="text-lg font-bold text-secondary-foreground mb-3">Services</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Cleaning', emoji: '🧹', cat: 'cleaning' },
              { label: 'Housekeeping', emoji: '🏠', cat: 'housekeeping' },
              { label: 'Deep Clean', emoji: '✨', cat: 'cleaning' },
            ].map((item) => (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/services?cat=${item.cat}`)}
                className="glass rounded-2xl p-4 text-center border border-secondary-foreground/5 hover:border-primary/30 transition-all"
              >
                <div className="text-2xl mb-2">{item.emoji}</div>
                <p className="text-xs font-semibold text-secondary-foreground">{item.label}</p>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section className="mb-6">
          <h3 className="text-lg font-bold text-secondary-foreground mb-3">Why Cleanfit?</h3>
          <TrustBadges />
        </section>

        {/* CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="gradient-lime rounded-3xl p-6 flex items-center justify-between shadow-lime mb-6"
        >
          <div>
            <p className="text-primary-foreground/60 text-[10px] font-bold uppercase tracking-wider">First 3 Visits</p>
            <p className="text-primary-foreground text-xl font-bold">Just £50</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-primary-foreground text-primary font-bold rounded-xl px-4 py-2.5 text-sm"
          >
            Refer Now
          </motion.button>
        </motion.div>

        {/* Top cleaners */}
        <section className="pb-6">
          <h3 className="text-lg font-bold text-secondary-foreground mb-3">Top Rated</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {topCleaners.map((cleaner, i) => (
              <motion.div
                key={cleaner.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="glass rounded-2xl p-4 min-w-[110px] text-center shrink-0 border border-secondary-foreground/5"
              >
                <div className="w-14 h-14 rounded-full gradient-lime mx-auto mb-2 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lime/40">
                  {cleaner.name[0]}
                </div>
                <p className="text-sm font-semibold text-secondary-foreground">{cleaner.name.split(' ')[0]} {cleaner.name.split(' ')[1]?.[0]}.</p>
                <p className="text-xs text-secondary-foreground/40">⭐ {cleaner.rating}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </CustomerLayout>
  );
}
