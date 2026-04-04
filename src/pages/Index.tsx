import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'customer') navigate('/home', { replace: true });
      else if (user.role === 'cleaner') navigate('/cleaner', { replace: true });
      else navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-foreground">
      {/* Neon green decorative shape */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-[10%] -right-[20%] w-[80vw] h-[80vw] rounded-full gradient-neon opacity-60 blur-3xl"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-[20%] -left-[30%] w-[60vw] h-[60vw] rounded-full gradient-pink blur-3xl"
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between px-8 pt-16 pb-12">
        {/* Top: Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 rounded-2xl gradient-neon flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-foreground" strokeWidth={1.5} />
          </div>
          <span className="text-2xl font-display font-extrabold text-card tracking-tight">Clean Fit</span>
        </motion.div>

        {/* Center: Big headline */}
        <div className="flex-1 flex flex-col justify-center -mt-12">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-[2.75rem] leading-[1.05] font-display font-black text-card"
          >
            London's homes
            <br />
            don't clean
            <br />
            <span className="text-primary">themselves.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="text-card/60 text-base mt-4 max-w-[280px]"
          >
            Premium cleaning, sorted in seconds. Trusted by thousands across London.
          </motion.p>
        </div>

        {/* Bottom: CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3"
        >
          <Button
            onClick={() => navigate('/login')}
            className="w-full h-14 text-base font-bold gradient-neon text-foreground rounded-2xl shadow-neon hover:opacity-95 transition-opacity"
          >
            Book a Clean
            <ArrowRight className="h-5 w-5 ml-2" strokeWidth={1.5} />
          </Button>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login?role=cleaner')}
              className="flex-1 h-12 rounded-2xl border border-card/20 text-card/70 text-sm font-semibold hover:bg-card/5 transition-colors"
            >
              Join as Cleaner
            </button>
            <button
              onClick={() => navigate('/login?role=admin')}
              className="flex-1 h-12 rounded-2xl border border-card/20 text-card/70 text-sm font-semibold hover:bg-card/5 transition-colors"
            >
              Admin Login
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
