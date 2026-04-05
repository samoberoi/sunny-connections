import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import onboarding1 from '@/assets/onboarding-1.jpg';
import onboarding2 from '@/assets/onboarding-2.jpg';
import onboarding3 from '@/assets/onboarding-3.jpg';

const slides = [
  {
    image: onboarding1,
    title: 'Premium Cleaning,\nSorted.',
    desc: 'Vetted, DBS-checked professionals at your doorstep. Because life\'s too short to scrub your own loo.',
  },
  {
    image: onboarding2,
    title: 'Book in Seconds,\nTrack in Real-Time.',
    desc: 'Pick a service, choose a time, and watch your cleaner arrive on the map. Easier than ordering a takeaway.',
  },
  {
    image: onboarding3,
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
    <div className="fixed inset-0 z-[150] bg-background flex flex-col">
      {/* Skip */}
      <div className="flex justify-end p-5">
        <button onClick={skip} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="w-56 h-56 rounded-3xl overflow-hidden mb-8 shadow-lg border-4 border-primary/20">
              <img
                src={slides[current].image}
                alt={slides[current].title}
                className="w-full h-full object-cover"
                width={640}
                height={640}
              />
            </div>
            <h2 className="text-2xl font-display font-black text-foreground text-center leading-tight whitespace-pre-line">
              {slides[current].title}
            </h2>
            <p className="text-sm text-muted-foreground text-center mt-3 max-w-[280px] leading-relaxed">
              {slides[current].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots + Button */}
      <div className="px-8 pb-12">
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === current ? 24 : 8 }}
              className={`h-2 rounded-full transition-colors ${
                i === current ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={next}
          className="w-full h-14 text-base font-bold rounded-full bg-foreground text-background hover:bg-foreground/90"
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
