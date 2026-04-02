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
  const cleaner = cleaners[0]; // assigned cleaner
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  return (
    <CustomerLayout>
      <div className="px-6 pt-6 pb-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-6">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-3" />
          <h1 className="font-display text-2xl font-bold text-foreground">Booking Confirmed!</h1>
          <p className="text-muted-foreground text-sm mt-1">Your cleaner is on the way</p>
        </motion.div>

        {/* Cleaner Card */}
        <div className="glass-card rounded-xl p-5 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              {cleaner.name[0]}
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">{cleaner.name}</h3>
              <StarRating rating={cleaner.rating} readonly size="sm" />
              <p className="text-xs text-muted-foreground mt-1">{cleaner.reviewCount} reviews · {cleaner.experience} yrs exp</p>
            </div>
            <Shield className="h-6 w-6 text-primary ml-auto" />
          </div>
        </div>

        {/* OTP */}
        <div className="glass-card rounded-xl p-5 mb-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">Share this OTP with your cleaner</p>
          <div className="font-display text-4xl font-bold tracking-[0.3em] text-primary">{otp}</div>
          <p className="text-xs text-muted-foreground mt-2">The cleaner will enter this code upon arrival</p>
        </div>

        {/* Booking Details */}
        <div className="glass-card rounded-xl p-5 mb-4 space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">{state?.date ? new Date(state.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Today'} at {state?.time || '09:00'}</p>
              <p className="text-xs text-muted-foreground">{state?.duration || 3} hours · {state?.service?.name || 'Cleaning'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-primary" />
            <p className="text-sm text-foreground">{state?.address || '42 Baker Street'}, {state?.postcode || 'NW1 6XE'}</p>
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-display font-bold">
            <span>Total</span>
            <span className="text-primary">£{state?.totalCost || 54}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={() => navigate('/active-booking')} className="w-full gradient-primary text-primary-foreground">
            Track Booking
          </Button>
          <Button onClick={() => navigate('/home')} variant="outline" className="w-full">
            Back to Home
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
}
