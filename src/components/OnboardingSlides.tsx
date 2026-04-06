import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import onboardingBg1 from '@/assets/onboarding-bg-1.jpg';
import onboardingBg2 from '@/assets/onboarding-bg-2.jpg';
import onboardingBg3 from '@/assets/onboarding-bg-3.jpg';

const slides = [
  {
    image: onboardingBg1,
    title: 'Premium Cleaning,\nSorted.',
    desc: 'Vetted, DBS-checked professionals at your doorstep. Because life\'s too short to scrub your own loo.',
  },
  {
    image: onboardingBg2,
    title: 'Book in Seconds,\nTrack in Real-Time.',
    desc: 'Pick a service, choose a time, and watch your cleaner arrive on the map. Easier than ordering a takeaway.',
  },
  {
    image: onboardingBg3,
    title: 'Five-Star\nGuaranteed.',
    desc: 'Every clean is rated. If it\'s not spotless, we\'ll send someone back — no questions, no fuss.',
  },
];

interface OnboardingSlidesProps {
  onComplete: () => void;
}

export default function OnboardingSlides({ onComplete }: OnboardingSlidesProps) {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else onComplete();
  };

  const skip = () => onComplete();

  return (
    <div className="fixed inset-0 z-[150] bg-foreground flex flex-col">
      {/* Full-screen background image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="w-full h-full object-cover"
            width={1080}
            height={1920}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />
        </motion.div>
      </AnimatePresence>

      {/* Skip button */}
      <div className="relative z-10 flex justify-end p-5 pt-14">
        <button onClick={skip} className="text-xs font-bold text-white/60 hover:text-white transition-colors backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
          Skip
        </button>
      </div>

      {/* Content at bottom */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-8 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-3xl font-display font-black text-white leading-tight whitespace-pre-line mb-3">
              {slides[current].title}
            </h2>
            <p className="text-sm text-white/60 max-w-[300px] leading-relaxed">
              {slides[current].desc}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex gap-2 mt-8 mb-6">
          {slides.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === current ? 24 : 8 }}
              className={`h-2 rounded-full transition-colors ${
                i === current ? 'bg-primary' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={next}
          className="w-full h-14 text-base font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {current < slides.length - 1 ? (
            <>Continue <ChevronRight className="h-4 w-4 ml-1" strokeWidth={2} /></>
          ) : (
            <>Get Started <ArrowRight className="h-4 w-4 ml-1" strokeWidth={2} /></>
          )}
        </Button>
      </div>
    </div>
  );
}
