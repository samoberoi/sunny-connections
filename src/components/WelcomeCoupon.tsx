import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-full max-w-sm rounded-2xl overflow-hidden"
          >
            <div className="gradient-primary p-6 pb-8 text-center">
              <button onClick={onClose} className="absolute top-3 right-3 text-primary-foreground/60 hover:text-primary-foreground">
                <X className="h-5 w-5" />
              </button>
              <Gift className="h-12 w-12 mx-auto mb-3 text-secondary" />
              <h2 className="font-display text-2xl font-bold text-primary-foreground">Welcome Gift!</h2>
            </div>
            <div className="bg-card p-6 text-center">
              <div className="inline-block px-4 py-2 rounded-full bg-accent mb-3">
                <span className="font-display text-xl font-bold text-primary">20% OFF</span>
              </div>
              <p className="text-muted-foreground mb-1">Your first cleaning service</p>
              <p className="text-xs text-muted-foreground mb-4">Use code <span className="font-mono font-bold text-foreground">WELCOME20</span></p>
              <Button onClick={onClaim} className="w-full gradient-gold text-secondary-foreground font-semibold hover:opacity-90">
                Claim Now
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
