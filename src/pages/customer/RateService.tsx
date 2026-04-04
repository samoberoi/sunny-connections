import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import StarRating from '@/components/StarRating';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';

export default function RateService() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  if (submitted) {
    return (
      <CustomerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="text-center">
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-5">
              <CircleCheck className="h-12 w-12 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-8">Your feedback helps us maintain five-star standards.</p>
            <Button onClick={() => navigate('/home')} className="gradient-blue text-primary-foreground rounded-2xl shadow-blue h-12 px-8 transition-opacity hover:opacity-95">
              Back to Home
            </Button>
          </motion.div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Rate Your Service</h1>
          <p className="text-muted-foreground text-sm mb-8">How was your experience with Emma Thompson?</p>

          <div className="glass-card rounded-2xl p-8 mb-6 text-center shadow-apple">
            <div className="w-20 h-20 rounded-2xl gradient-blue mx-auto mb-4 flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-blue">
              E
            </div>
            <h3 className="font-bold text-foreground mb-4">Emma Thompson</h3>
            <StarRating rating={rating} onRate={setRating} size="lg" />
            <p className="text-xs text-muted-foreground mt-3">
              {rating === 0 ? 'Tap a star to rate' : rating <= 2 ? "We'll do better" : rating <= 4 ? 'Good service' : 'Excellent!'}
            </p>
          </div>

          <div className="mb-6">
            <label className="text-sm font-semibold text-foreground mb-2 block">Leave a review (optional)</label>
            <Textarea
              placeholder="Tell us about your experience..."
              value={review}
              onChange={e => setReview(e.target.value)}
              rows={4}
              className="rounded-2xl bg-muted/50 border-0 resize-none"
            />
          </div>

          <Button
            onClick={() => setSubmitted(true)}
            disabled={rating === 0}
            className="w-full h-14 text-base font-semibold gradient-blue text-primary-foreground rounded-2xl shadow-blue disabled:opacity-40 transition-opacity hover:opacity-95"
          >
            Submit Review
          </Button>
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
