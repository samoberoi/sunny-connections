import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 -right-20 w-60 h-60 rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute bottom-20 -left-20 w-80 h-80 rounded-full bg-primary/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-secondary/20 mb-6"
        >
          <Leaf className="h-10 w-10 text-secondary" />
        </motion.div>

        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-3">
          Indiana Green
        </h1>
        <p className="text-primary-foreground/70 text-lg mb-2">London's Premium Cleaning Service</p>
        <p className="text-primary-foreground/50 text-sm max-w-sm mx-auto mb-10">
          Verified professionals. Five-star standards. Eco-friendly approach.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3 max-w-xs mx-auto"
        >
          <Button
            onClick={() => navigate('/login')}
            className="w-full h-14 text-base font-semibold gradient-gold text-secondary-foreground rounded-xl shadow-lg hover:opacity-90"
          >
            Get Started <ArrowRight className="h-5 w-5 ml-2" />
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/enrol/register')}
              variant="outline"
              className="flex-1 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Sparkles className="h-4 w-4 mr-1" /> Join as Cleaner
            </Button>
          </div>
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 text-primary-foreground/30 text-xs"
      >
        © 2026 Indiana Green Ltd. All rights reserved.
      </motion.p>
    </div>
  );
}
