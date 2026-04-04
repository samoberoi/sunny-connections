import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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
          className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="relative w-full max-w-lg bg-background rounded-t-[2rem] overflow-hidden"
          >
            <div className="px-8 pt-8 pb-10">
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-foreground" strokeWidth={1.8} />
              </button>

              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Welcome offer</p>
              <h2 className="text-2xl font-display font-black text-foreground mb-2">
                First 3 visits for £100
              </h2>
              <p className="text-sm text-muted-foreground mb-6">That's a proper bargain, innit?</p>

              <Button
                onClick={onClaim}
                className="w-full h-14 text-base font-semibold rounded-2xl transition-opacity"
              >
                Claim Now
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
