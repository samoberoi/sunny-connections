import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleCheck, MapPin, Clock, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import { toast } from 'sonner';

export default function BookingConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
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
              className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center mx-auto mb-4">
              <CircleCheck className="h-8 w-8 text-primary-foreground" strokeWidth={1.5} />
            </motion.div>
            <h1 className="text-2xl font-display font-black text-foreground">Sorted!</h1>
            <p className="text-muted-foreground text-sm mt-1">Your booking has been confirmed</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-foreground rounded-2xl p-6 mb-4 text-center">
            <p className="text-xs text-primary-foreground/40 mb-3 font-medium uppercase tracking-wider">Your OTP code</p>
            <div className="flex items-center justify-center gap-3">
              <div className="text-4xl font-display font-black tracking-[0.4em] text-primary-foreground">{otp}</div>
              <button onClick={copyOtp} className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <Copy className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="border border-border rounded-2xl p-5 mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {state?.date ? new Date(state.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Today'} at {state?.time || '09:00'}
                </p>
                <p className="text-xs text-muted-foreground">{state?.duration || 3} hours · {state?.service?.name || 'Cleaning'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-sm text-foreground">{state?.address || '42 Baker Street'}, {state?.postcode || 'NW1 6XE'}</p>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-display font-black text-lg">
              <span>Total</span>
              <span>£{state?.totalCost || 54}</span>
            </div>
          </motion.div>

          <div className="space-y-3">
            <Button onClick={() => navigate('/active-booking', { state: { bookingId: state?.bookingId } })} className="w-full h-14 font-semibold text-base rounded-2xl">
              Track Booking
            </Button>
            <Button onClick={() => navigate('/home')} variant="outline" className="w-full h-12 rounded-2xl font-medium">
              Back to Home
            </Button>
          </div>
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
