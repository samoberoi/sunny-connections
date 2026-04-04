import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Home, SprayCan } from 'lucide-react';
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

  const floatingIcons = [
    { Icon: Sparkles, top: '18%', left: '15%', delay: 0, size: 'w-10 h-10' },
    { Icon: Home, top: '28%', left: '72%', delay: 0.3, size: 'w-12 h-12' },
    { Icon: SprayCan, top: '45%', left: '25%', delay: 0.6, size: 'w-9 h-9' },
    { Icon: Sparkles, top: '38%', left: '80%', delay: 0.9, size: 'w-8 h-8' },
    { Icon: Home, top: '55%', left: '60%', delay: 1.2, size: 'w-10 h-10' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

      {/* Floating icons */}
      {floatingIcons.map(({ Icon, top, left, delay, size }, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.15, scale: 1, y: [0, -12, 0] }}
          transition={{ delay, y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 0.5 } }}
          className={`absolute ${size} text-primary-foreground`}
          style={{ top, left }}
        >
          <Icon className="w-full h-full" strokeWidth={1} />
        </motion.div>
      ))}

      {/* Bottom card */}
      <div className="absolute bottom-0 left-0 right-0">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', damping: 28, stiffness: 300 }}
          className="glass-card-elevated rounded-t-[2.5rem] px-8 pt-10 pb-12"
        >
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="text-3xl font-bold text-foreground text-center mb-2"
          >
            Welcome to <span className="text-gradient">Clean Fit</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="text-muted-foreground text-center text-sm mb-8"
          >
            London's homes don't clean themselves. But we do.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <Button
              onClick={() => navigate('/login')}
              className="w-full h-14 text-base font-semibold gradient-blue text-primary-foreground rounded-2xl shadow-blue hover:opacity-95 transition-opacity"
            >
              Book a Clean
            </Button>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            onClick={() => navigate('/enrol/register')}
            className="w-full text-center text-sm text-muted-foreground mt-5 hover:text-foreground transition-colors"
          >
            Join as a Cleaner →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
