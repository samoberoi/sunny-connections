import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import OnboardingSlides from '@/components/OnboardingSlides';
import heroCleaning from '@/assets/hero-cleaning.jpg';

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user) {
      if (user.role === 'customer') navigate('/home', { replace: true });
      else if (user.role === 'cleaner') navigate('/cleaner', { replace: true });
      else navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, navigate, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      const seen = localStorage.getItem('onboarding_complete');
      if (!seen) setShowOnboarding(true);
    }
  }, [isAuthenticated, isLoading]);

  const handleOnboardingComplete = () => { localStorage.setItem('onboarding_complete', '1'); setShowOnboarding(false); };

  if (isAuthenticated && user) return null;

  return (
    <div className="h-[100dvh] bg-background relative overflow-hidden flex flex-col">
      {showOnboarding && <OnboardingSlides onComplete={handleOnboardingComplete} />}

      {/* Hero image - flexible height */}
      <div className="relative flex-1 min-h-0 overflow-hidden rounded-b-[2.5rem]">
        <motion.img src={heroCleaning} alt="Professional cleaning" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="w-full h-full object-cover" width={800} height={1024} />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-transparent to-background" />
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute top-6 left-5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center shadow-medium">
            <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <span className="text-lg font-display font-black text-white drop-shadow-lg">Clean Fit</span>
        </motion.div>
      </div>

      {/* Bottom content - always visible */}
      <div className="relative z-10 px-6 -mt-6 shrink-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-foreground leading-[1.1]">
            London's homes don't clean <span className="text-primary-ink font-black">themselves.</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-[280px]">Premium cleaning, sorted in seconds.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex gap-3 mt-3">
          {[
            { icon: Star, label: '4.9 rated' },
            { icon: ShieldCheck, label: 'DBS checked' },
            { icon: Clock, label: 'Same day' },
          ].map(badge => (
            <div key={badge.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                <badge.icon className="h-3 w-3 text-foreground" strokeWidth={1.5} />
              </div>
              <span className="font-medium">{badge.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.6 }}
          className="space-y-2.5 mt-5 pb-6">
          <Button onClick={() => navigate('/login')} className="w-full h-13 text-base font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90">
            Book a Clean <ArrowRight className="h-4 w-4 ml-2" strokeWidth={2} />
          </Button>
          <div className="flex gap-2.5">
            <button onClick={() => navigate('/cleaner/login')} className="flex-1 h-11 rounded-full border-2 border-foreground/10 text-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-all">
              Join as Cleaner
            </button>
            <button onClick={() => navigate('/admin/login')} className="flex-1 h-11 rounded-full bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors">
              Admin
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
