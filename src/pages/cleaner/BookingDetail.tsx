import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Textarea } from '@/components/ui/textarea';
import CleanerLayout from '@/components/layout/CleanerLayout';
import { bookings } from '@/data/mockData';

export default function BookingDetail() {
  const navigate = useNavigate();
  const booking = bookings[0];
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [jobDone, setJobDone] = useState(false);
  const [notes, setNotes] = useState('');

  const verifyOtp = () => {
    if (otp === booking.otp) setOtpVerified(true);
  };

  if (jobDone) {
    return (
      <CleanerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <CheckCircle className="h-20 w-20 text-primary mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Job Complete!</h2>
          <p className="text-muted-foreground text-center mb-6">The customer will now be asked to rate the service.</p>
          <Button onClick={() => navigate('/cleaner')} className="gradient-primary text-primary-foreground">Back to Dashboard</Button>
        </div>
      </CleanerLayout>
    );
  }

  return (
    <CleanerLayout>
      <div className="px-6 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-muted"><ArrowLeft className="h-4 w-4" /></button>
          <h1 className="font-display text-xl font-semibold text-foreground">Job Details</h1>
        </div>

        {/* Customer Info */}
        <div className="glass-card rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{booking.customerName}</h3>
              <p className="text-xs text-muted-foreground">{booking.serviceName}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {booking.date} at {booking.time} · {booking.duration}h</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {booking.address.line1}, {booking.address.postcode}</div>
          </div>
          <div className="mt-3 pt-3 border-t border-border flex justify-between font-display font-bold">
            <span>Earnings</span><span className="text-primary">£{booking.totalCost}</span>
          </div>
        </div>

        {/* OTP Verification */}
        {!otpVerified ? (
          <div className="glass-card rounded-xl p-5 text-center">
            <h3 className="font-display font-semibold text-foreground mb-2">Enter Customer OTP</h3>
            <p className="text-xs text-muted-foreground mb-4">Ask the customer for their 4-digit code</p>
            <div className="flex justify-center mb-4">
              <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button onClick={verifyOtp} className="w-full gradient-primary text-primary-foreground">Verify & Start Job</Button>
          </div>
        ) : (
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">OTP Verified — Job in Progress</span>
            </div>
            <label className="text-sm font-medium text-foreground mb-2 block">Completion Notes</label>
            <Textarea placeholder="Any notes about the job..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mb-4" />
            <Button onClick={() => setJobDone(true)} className="w-full gradient-gold text-secondary-foreground font-semibold">
              Mark as Complete
            </Button>
          </div>
        )}
      </div>
    </CleanerLayout>
  );
}
