import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/components/layout/CustomerLayout';
import StarRating from '@/components/StarRating';
import { cleaners } from '@/data/mockData';

export default function BookingConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const cleaner = cleaners[0];
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  return (
    <CustomerLayout>
      <div className="px-5 pt-6 pb-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Booking Confirmed!</h1>
          <p className="text-muted-foreground text-sm mt-1">Your cleaner is on the way</p>
        </motion.div>

        <div className="glass-card rounded-2xl p-5 mb-4 shadow-apple">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-blue flex items-center justify-center text-primary-foreground font-bold text-xl shadow-blue">
              {cleaner.name[0]}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">{cleaner.name}</h3>
              <StarRating rating={Math.round(cleaner.rating)} readonly size="sm" />
              <p className="text-xs text-muted-foreground mt-1">{cleaner.reviewCount} reviews · {cleaner.experience} yrs</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-4 text-center shadow-apple">
          <p className="text-sm text-muted-foreground mb-3">Share this OTP with your cleaner</p>
          <div className="text-4xl font-extrabold tracking-[0.4em] text-gradient">{otp}</div>
          <p className="text-xs text-muted-foreground mt-3">The cleaner will enter this code upon arrival</p>
        </div>

        <div className="glass-card rounded-2xl p-5 mb-6 space-y-3 shadow-apple">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center"><Clock className="h-4 w-4 text-primary" /></div>
            <div>
              <p className="text-sm font-medium text-foreground">{state?.date ? new Date(state.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Today'} at {state?.time || '09:00'}</p>
              <p className="text-xs text-muted-foreground">{state?.duration || 3} hours · {state?.service?.name || 'Cleaning'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center"><MapPin className="h-4 w-4 text-primary" /></div>
            <p className="text-sm text-foreground">{state?.address || '42 Baker Street'}, {state?.postcode || 'NW1 6XE'}</p>
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-extrabold text-lg">
            <span>Total</span>
            <span className="text-gradient">£{state?.totalCost || 54}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={() => navigate('/active-booking')} className="w-full h-14 gradient-blue text-primary-foreground rounded-2xl shadow-blue font-semibold text-base">
            Track Booking
          </Button>
          <Button onClick={() => navigate('/home')} variant="outline" className="w-full h-12 rounded-2xl">
            Back to Home
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
}
