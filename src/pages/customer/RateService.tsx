import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import StarRating from '@/components/StarRating';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const quickTags = ['Punctual', 'Thorough', 'Friendly', 'Smelled lovely', 'Spotless'];

export default function RateService() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    const fullReview = [review, ...selectedTags.map(t => `#${t}`)].filter(Boolean).join(' ');
    if (state?.bookingId) {
      await supabase.from('bookings').update({ rating, review: fullReview || null }).eq('id', state.bookingId);
    }
    setSubmitting(false);
    setSubmitted(true);
    toast.success('Thanks for the feedback!');
  };

  if (submitted) {
    return (
      <CustomerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="text-center">
            <div className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center mx-auto mb-5">
              <CircleCheck className="h-10 w-10 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-display font-black text-foreground mb-2">Cheers!</h2>
            <p className="text-muted-foreground mb-8">Your feedback helps us maintain five-star standards.</p>
            <Button onClick={() => navigate('/home')} className="rounded-2xl h-12 px-8 font-semibold">
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
          <h1 className="text-xl font-display font-black text-foreground mb-1">Rate Your Service</h1>
          <p className="text-muted-foreground text-sm mb-8">How'd they do? Be honest — we can take it.</p>

          <div className="border border-border rounded-2xl p-8 mb-6 text-center">
            <StarRating rating={rating} onRate={setRating} size="lg" />
            <p className="text-xs text-muted-foreground mt-3">
              {rating === 0 ? 'Tap a star to rate' : rating <= 2 ? "We'll do better next time" : rating <= 4 ? 'Good service!' : 'Absolutely brilliant!'}
            </p>
          </div>

          <div className="mb-6">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Quick feedback</label>
            <div className="flex flex-wrap gap-2">
              {quickTags.map(tag => (
                <motion.button
                  key={tag}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all border ${
                    selectedTags.includes(tag) ? 'bg-foreground text-primary-foreground border-foreground' : 'border-border text-muted-foreground'
                  }`}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Leave a review (optional)</label>
            <Textarea
              placeholder="Tell us about your experience..."
              value={review}
              onChange={e => setReview(e.target.value)}
              rows={4}
              className="rounded-xl border-border resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="w-full h-14 text-base font-semibold rounded-2xl disabled:opacity-40 transition-opacity"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
