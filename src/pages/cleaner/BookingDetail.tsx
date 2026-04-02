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
          <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mb-5">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Job Complete!</h2>
          <p className="text-muted-foreground text-center mb-8">The customer will now be asked to rate the service.</p>
          <Button onClick={() => navigate('/cleaner')} className="gradient-blue text-primary-foreground rounded-2xl shadow-blue h-12 px-8">Back to Dashboard</Button>
        </div>
      </CleanerLayout>
    );
  }

  return (
    <CleanerLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-muted"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="text-xl font-bold text-foreground">Job Details</h1>
        </div>

        <div className="glass-card rounded-2xl p-5 mb-4 shadow-apple">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{booking.customerName}</h3>
              <p className="text-xs text-muted-foreground">{booking.serviceName}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {booking.date} at {booking.time} · {booking.duration}h</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {booking.address.line1}, {booking.address.postcode}</div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex justify-between font-extrabold text-lg">
            <span>Earnings</span><span className="text-gradient">£{booking.totalCost}</span>
          </div>
        </div>

        {!otpVerified ? (
          <div className="glass-card rounded-2xl p-6 text-center shadow-apple">
            <h3 className="font-bold text-foreground mb-2">Enter Customer OTP</h3>
            <p className="text-xs text-muted-foreground mb-5">Ask the customer for their 4-digit code</p>
            <div className="flex justify-center mb-5">
              <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                <InputOTPGroup className="gap-3">
                  {[0,1,2,3].map(i => (
                    <InputOTPSlot key={i} index={i} className="w-14 h-14 rounded-2xl border-2 border-muted bg-muted/30 text-xl font-bold" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button onClick={verifyOtp} className="w-full h-12 gradient-blue text-primary-foreground rounded-2xl shadow-blue font-semibold">Verify & Start Job</Button>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 shadow-apple">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">OTP Verified — Job in Progress</span>
            </div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Completion Notes</label>
            <Textarea placeholder="Any notes about the job..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="rounded-2xl bg-muted/50 border-0 mb-4 resize-none" />
            <Button onClick={() => setJobDone(true)} className="w-full h-12 gradient-teal text-secondary-foreground rounded-2xl font-semibold">
              Mark as Complete
            </Button>
          </div>
        )}
      </div>
    </CleanerLayout>
  );
}
