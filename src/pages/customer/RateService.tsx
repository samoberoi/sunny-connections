import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import StarRating from '@/components/StarRating';
import CustomerLayout from '@/components/layout/CustomerLayout';

export default function RateService() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  if (submitted) {
    return (
      <CustomerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
            <CheckCircle className="h-20 w-20 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">Your feedback helps us maintain five-star standards.</p>
            <Button onClick={() => navigate('/home')} className="gradient-primary text-primary-foreground">
              Back to Home
            </Button>
          </motion.div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="px-6 pt-6 pb-6">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Rate Your Service</h1>
        <p className="text-muted-foreground text-sm mb-6">How was your experience with Emma Thompson?</p>

        <div className="glass-card rounded-xl p-6 mb-6 text-center">
          <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center text-primary-foreground font-bold text-2xl">
            E
          </div>
          <h3 className="font-display font-semibold text-foreground mb-3">Emma Thompson</h3>
          <StarRating rating={rating} onRate={setRating} size="lg" />
          <p className="text-xs text-muted-foreground mt-2">
            {rating === 0 ? 'Tap a star to rate' : rating <= 2 ? 'We\'ll do better' : rating <= 4 ? 'Good service' : 'Excellent!'}
          </p>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-foreground mb-2 block">Leave a review (optional)</label>
          <Textarea
            placeholder="Tell us about your experience..."
            value={review}
            onChange={e => setReview(e.target.value)}
            rows={4}
          />
        </div>

        <Button
          onClick={() => setSubmitted(true)}
          disabled={rating === 0}
          className="w-full gradient-primary text-primary-foreground h-12 text-base font-semibold"
        >
          Submit Review
        </Button>
      </div>
    </CustomerLayout>
  );
}
