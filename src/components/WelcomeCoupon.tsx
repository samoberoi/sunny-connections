import { motion, AnimatePresence } from 'framer-motion';
import { X, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeCouponProps {
  open: boolean;
  onClose: () => void;
  onClaim: () => void;
}

export default function WelcomeCoupon({ open, onClose, onClaim }: WelcomeCouponProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="relative w-full max-w-lg rounded-t-[2rem] overflow-hidden"
          >
            <div className="gradient-neon px-6 pt-6 pb-16 text-center relative">
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                <X className="h-4 w-4 text-foreground" strokeWidth={1.8} />
              </button>
              
              <div className="relative h-28 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: -10, y: [0, -4, 0] }}
                  transition={{ y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
                  className="absolute w-24 h-14 rounded-xl bg-foreground/10 backdrop-blur-sm border border-foreground/10 flex items-center justify-center -translate-x-4"
                >
                  <span className="text-foreground font-bold text-sm">£50 OFF</span>
                </motion.div>
                <motion.div
                  animate={{ rotate: 5, y: [0, -6, 0] }}
                  transition={{ y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 } }}
                  className="absolute w-24 h-14 rounded-xl bg-foreground/15 backdrop-blur-sm border border-foreground/15 flex items-center justify-center translate-x-4"
                >
                  <span className="text-foreground font-bold text-sm">£50 OFF</span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 } }}
                  className="relative w-28 h-16 rounded-xl bg-foreground/20 backdrop-blur-sm border border-foreground/20 flex items-center justify-center z-10"
                >
                  <span className="text-foreground font-extrabold">£50 OFF</span>
                </motion.div>
              </div>
            </div>

            <div className="bg-card -mt-6 rounded-t-[2rem] px-8 pt-8 pb-10 text-center">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">ONE TIME OFFER</p>
              <h2 className="text-2xl font-display font-black text-foreground mb-6">
                FIRST 3 VISITS FOR <span className="text-gradient">£100</span>
              </h2>
              <Button
                onClick={onClaim}
                className="w-full h-14 text-base font-bold gradient-neon text-foreground rounded-2xl shadow-neon hover:opacity-95 transition-opacity"
              >
                <Ticket className="h-5 w-5 mr-2" strokeWidth={1.8} />
                Claim Now
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
