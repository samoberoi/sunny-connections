import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight, Sparkles, MapPin, Shield, Clock, PoundSterling, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserRole } from '@/contexts/AuthContext';

const customerSlides = [
  {
    icon: Sparkles,
    color: 'bg-blue-500',
    title: 'Welcome to\nClean Fit',
    desc: 'Premium home cleaning at your fingertips. Vetted professionals, transparent pricing, and sparkling results every time.',
  },
  {
    icon: MapPin,
    color: 'bg-indigo-500',
    title: 'Book & Track\nin Real-Time',
    desc: 'Choose your service, pick a time, and watch your cleaner arrive on the live map. It\'s like tracking a delivery — but for sparkle.',
  },
  {
    icon: Shield,
    color: 'bg-emerald-500',
    title: 'Safe, Secure\n& Guaranteed',
    desc: 'Every cleaner is DBS-checked and verified. Not happy? We\'ll send someone back — no questions asked.',
  },
];

const cleanerSlides = [
  {
    icon: Users,
    color: 'bg-blue-500',
    title: 'Welcome to\nClean Fit Pro',
    desc: 'Join London\'s fastest-growing cleaning network. Set your own hours, earn great money, and build your reputation.',
  },
  {
    icon: Clock,
    color: 'bg-violet-500',
    title: 'Flexible Jobs,\nYour Schedule',
    desc: 'Browse available jobs near you, accept the ones that fit your diary, and get paid weekly. You\'re the boss.',
  },
  {
    icon: PoundSterling,
    color: 'bg-emerald-500',
    title: 'Earn & Grow\nYour Career',
    desc: 'Competitive rates, tips from happy customers, and bonuses for five-star reviews. The more you clean, the more you earn.',
  },
];

interface RoleOnboardingProps {
  role: UserRole;
  userName: string;
  onComplete: () => void;
}

export default function RoleOnboarding({ role, userName, onComplete }: RoleOnboardingProps) {
  const [current, setCurrent] = useState(0);
  const slides = role === 'cleaner' ? cleanerSlides : customerSlides;

  // Admin skips onboarding
  if (role === 'admin') {
    onComplete();
    return null;
  }

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else onComplete();
  };

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col">
      {/* Skip */}
      <div className="flex justify-between items-center p-5">
        <p className="text-xs text-muted-foreground font-medium">{current + 1} of {slides.length}</p>
        <button onClick={onComplete} className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col px-8 justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon circle */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              className={`w-24 h-24 rounded-3xl ${slide.color} flex items-center justify-center mb-8 shadow-lg`}
            >
              <Icon className="h-10 w-10 text-white" strokeWidth={1.5} />
            </motion.div>

            {current === 0 && (
              <p className="text-sm text-primary font-semibold mb-2">
                Hi {userName.split(' ')[0]}! 👋
              </p>
            )}

            <h2 className="text-3xl font-display font-black text-foreground leading-tight whitespace-pre-line">
              {slide.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-4 max-w-[300px] leading-relaxed">
              {slide.desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots + Button */}
      <div className="px-8 pb-12">
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === current ? 28 : 8 }}
              className={`h-2 rounded-full transition-colors duration-300 ${
                i === current ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={next}
          className="w-full h-14 text-base font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {current < slides.length - 1 ? (
            <>Continue <ChevronRight className="h-4 w-4 ml-1" strokeWidth={1.5} /></>
          ) : (
            <>Let's Go! <ArrowRight className="h-4 w-4 ml-1" strokeWidth={1.5} /></>
          )}
        </Button>
      </div>
    </div>
  );
}
