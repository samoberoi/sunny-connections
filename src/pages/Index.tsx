import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import heroImage from '@/assets/hero-cleaner.jpg';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-secondary">
      {/* Hero image with dark overlay */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Professional cleaner" className="w-full h-full object-cover opacity-40" width={768} height={1024} />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-secondary/40 to-secondary" />
      </div>

      {/* Top logo area */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 pt-16 px-8"
      >
        <div className="w-12 h-12 rounded-2xl gradient-lime shadow-lime flex items-center justify-center mb-4">
          <span className="text-xl font-bold text-primary-foreground">C</span>
        </div>
        <p className="text-secondary-foreground/50 text-sm font-medium tracking-wider uppercase">London's #1</p>
      </motion.div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', damping: 25 }}
          className="px-8 pb-14"
        >
          <h1 className="text-4xl font-bold text-secondary-foreground leading-tight mb-2">
            Your home,<br/>
            <span className="text-gradient">spotless.</span>
          </h1>
          <p className="text-secondary-foreground/60 text-sm mb-8 max-w-[260px]">
            Premium cleaning & housekeeping across London. Book in 60 seconds.
          </p>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
            className="w-full h-14 gradient-lime text-primary-foreground font-bold rounded-2xl shadow-lime flex items-center justify-center gap-2 text-base"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </motion.button>

          <button
            onClick={() => navigate('/enrol/register')}
            className="w-full text-center text-sm text-secondary-foreground/40 mt-5 hover:text-secondary-foreground/70 transition-colors font-medium"
          >
            Join as a Cleaner →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
