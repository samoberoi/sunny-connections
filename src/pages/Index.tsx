import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-cleaner.jpg';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-screen hero image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Professional cleaner" className="w-full h-full object-cover" width={768} height={1024} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      </div>

      {/* Bottom card - Cleanfit style */}
      <div className="absolute bottom-0 left-0 right-0">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', damping: 25 }}
          className="glass-card-elevated rounded-t-[2rem] px-8 pt-10 pb-12"
        >
          <h1 className="text-3xl font-bold text-foreground text-center mb-1">
            Welcome to <span className="text-gradient">Cleanfit</span>
          </h1>
          <p className="text-muted-foreground text-center text-sm mb-8">
            Your trusted home cleaning service in UK
          </p>

          <Button
            onClick={() => navigate('/login')}
            className="w-full h-14 text-base font-semibold gradient-blue text-primary-foreground rounded-2xl shadow-blue hover:opacity-95 transition-opacity"
          >
            Login
          </Button>

          <button
            onClick={() => navigate('/enrol/register')}
            className="w-full text-center text-sm text-muted-foreground mt-5 hover:text-foreground transition-colors"
          >
            Are You Cleaner?
          </button>
        </motion.div>
      </div>
    </div>
  );
}
