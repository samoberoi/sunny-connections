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
  const { isAuthenticated, user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'customer') navigate('/home', { replace: true });
      else if (user.role === 'cleaner') navigate('/cleaner', { replace: true });
      else navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const seen = localStorage.getItem('onboarding_complete');
    if (!seen) setShowOnboarding(true);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_complete', '1');
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {showOnboarding && <OnboardingSlides onComplete={handleOnboardingComplete} />}

      {/* Hero image */}
      <div className="relative h-[55vh] overflow-hidden">
        <motion.img
          src={heroCleaning}
          alt="Professional cleaning a luxury home"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full object-cover"
          width={800}
          height={1024}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-transparent to-background" />
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute top-6 left-6 flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <span className="text-lg font-display font-bold text-white drop-shadow-lg">Clean Fit</span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-3xl font-display font-black text-foreground leading-tight">
            London's homes
            <br />
            don't clean
            <br />
            <span className="text-gradient">themselves.</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-3 max-w-[280px] leading-relaxed">
            Premium cleaning, sorted in seconds. Trusted by thousands across London.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex gap-4 mt-5"
        >
          {[
            { icon: Star, label: '4.9 rated' },
            { icon: ShieldCheck, label: 'DBS checked' },
            { icon: Clock, label: 'Same day' },
          ].map(badge => (
            <div key={badge.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
                <badge.icon className="h-3 w-3 text-foreground" strokeWidth={1.5} />
              </div>
              <span className="font-medium">{badge.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3 mt-8 pb-12"
        >
          <Button
            onClick={() => navigate('/login')}
            className="w-full h-14 text-base font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
          >
            Book a Clean
            <ArrowRight className="h-4 w-4 ml-2" strokeWidth={2} />
          </Button>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/cleaner/login')}
              className="flex-1 h-12 rounded-full border-2 border-foreground/10 text-foreground text-sm font-semibold hover:bg-foreground hover:text-background transition-all"
            >
              Join as Cleaner
            </button>
            <button
              onClick={() => navigate('/admin/login')}
              className="flex-1 h-12 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors"
            >
              Admin
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
