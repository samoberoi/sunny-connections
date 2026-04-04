import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'exit'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 800);
    const t2 = setTimeout(() => setPhase('exit'), 2200);
    const t3 = setTimeout(() => onComplete(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'exit' ? (
        <motion.div
          key="splash"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[200] bg-foreground flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Ambient glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/15 blur-[100px]" />

          {/* Logo icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative mb-6"
          >
            <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-lg">
              <Sparkles className="h-10 w-10 text-primary-foreground" strokeWidth={1.5} />
            </div>
            {/* Pulse ring */}
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 w-20 h-20 rounded-3xl border-2 border-primary"
            />
          </motion.div>

          {/* Brand name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl font-display font-black text-white tracking-tight"
          >
            Clean <span className="text-primary">Fit</span>
          </motion.h1>

          {/* Tagline */}
          <AnimatePresence>
            {phase === 'tagline' && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-white/40 text-sm mt-3 font-medium tracking-wide"
              >
                Premium cleaning, sorted.
              </motion.p>
            )}
          </AnimatePresence>

          {/* Bottom loading bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '30%' }}
            transition={{ duration: 2.2, ease: 'linear' }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-primary"
          />
        </motion.div>
      ) : (
        <motion.div
          key="splash-exit"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[200] bg-foreground"
        />
      )}
    </AnimatePresence>
  );
}
