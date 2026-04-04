import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-foreground relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-3xl" />

      <div className="relative z-10 min-h-screen flex flex-col justify-between px-8 pt-16 pb-12">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-lg font-display font-bold text-primary-foreground tracking-tight">Clean Fit</h2>
        </motion.div>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center -mt-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-[2.75rem] leading-[1.05] font-display font-black text-primary-foreground"
          >
            London's homes
            <br />
            don't clean
            <br />
            themselves.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-primary-foreground/50 text-base mt-4 max-w-[280px] leading-relaxed"
          >
            Premium cleaning, sorted in seconds. Trusted by thousands across London.
          </motion.p>
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3"
        >
          <Button
            onClick={() => navigate('/login')}
            className="w-full h-14 text-base font-semibold bg-primary-foreground text-foreground rounded-2xl hover:bg-primary-foreground/90 transition-colors"
          >
            Book a Clean
            <ArrowRight className="h-4 w-4 ml-2" strokeWidth={1.5} />
          </Button>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login?role=cleaner')}
              className="flex-1 h-12 rounded-2xl border border-primary-foreground/15 text-primary-foreground/50 text-sm font-medium hover:text-primary-foreground/70 hover:border-primary-foreground/25 transition-colors"
            >
              Join as Cleaner
            </button>
            <button
              onClick={() => navigate('/login?role=admin')}
              className="flex-1 h-12 rounded-2xl border border-primary-foreground/15 text-primary-foreground/50 text-sm font-medium hover:text-primary-foreground/70 hover:border-primary-foreground/25 transition-colors"
            >
              Admin
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
