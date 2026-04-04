import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleCheck, MapPin, Clock, ShieldCheck, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import StarRating from '@/components/StarRating';
import { useCleaners } from '@/hooks/useCleaners';
import { toast } from 'sonner';

export default function BookingConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { data: cleaners } = useCleaners();
  const cleaner = cleaners?.[0];
  const otp = state?.otp || '1111';

  const copyOtp = () => {
    navigator.clipboard.writeText(otp);
    toast.success('OTP copied!');
  };

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, delay: 0.2 }}
              className="w-20 h-20 rounded-full gradient-neon flex items-center justify-center mx-auto mb-4 shadow-neon">
              <CircleCheck className="h-10 w-10 text-foreground" strokeWidth={1.5} />
            </motion.div>
            <h1 className="text-3xl font-display font-black text-foreground">Sorted!</h1>
            <p className="text-muted-foreground text-sm mt-1">Your cleaner's practically on their way</p>
          </motion.div>

          {cleaner && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl p-5 mb-4 shadow-apple">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center text-card font-bold text-lg">
                  {cleaner.name[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-foreground text-sm">{cleaner.name}</h3>
                  <StarRating rating={Math.round(cleaner.rating)} readonly size="sm" />
                  <p className="text-xs text-muted-foreground mt-0.5">{cleaner.review_count} reviews · {cleaner.experience} yrs</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-accent-foreground" strokeWidth={1.5} />
                </div>
              </div>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="gradient-neon rounded-2xl p-6 mb-4 text-center shadow-neon">
            <p className="text-sm text-foreground/60 mb-3 font-medium">Share this OTP with your cleaner</p>
            <div className="flex items-center justify-center gap-3">
              <div className="text-4xl font-display font-black tracking-[0.4em] text-foreground">{otp}</div>
              <button onClick={copyOtp} className="w-8 h-8 rounded-xl bg-foreground/10 flex items-center justify-center">
                <Copy className="h-4 w-4 text-foreground" strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card rounded-2xl p-5 mb-6 space-y-3 shadow-apple">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                <Clock className="h-4 w-4 text-accent-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {state?.date ? new Date(state.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Today'} at {state?.time || '09:00'}
                </p>
                <p className="text-xs text-muted-foreground">{state?.duration || 3} hours · {state?.service?.name || 'Cleaning'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-accent-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-foreground">{state?.address || '42 Baker Street'}, {state?.postcode || 'NW1 6XE'}</p>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-display font-black text-lg">
              <span>Total</span>
              <span className="text-gradient">£{state?.totalCost || 54}</span>
            </div>
          </motion.div>

          <div className="space-y-3">
            <Button onClick={() => navigate('/active-booking', { state: { bookingId: state?.bookingId } })} className="w-full h-14 gradient-neon text-foreground rounded-2xl shadow-neon font-bold text-base">
              Track Booking
            </Button>
            <Button onClick={() => navigate('/home')} variant="outline" className="w-full h-12 rounded-2xl font-bold">
              Back to Home
            </Button>
          </div>
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
