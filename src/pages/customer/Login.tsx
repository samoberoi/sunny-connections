import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import BackButton from '@/components/BackButton';
import { toast } from 'sonner';

export default function Login() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const pathnameRole: UserRole | undefined = location.pathname.startsWith('/admin') ? 'admin' : location.pathname.startsWith('/cleaner') ? 'cleaner' : undefined;
  const roleParam = ((searchParams.get('role') as UserRole) || pathnameRole || 'customer') as UserRole;
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const role: UserRole = roleParam;

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '');
    if (digits.length <= 11) setPhone(digits);
  };

  const displayPhone = phone.length > 0
    ? phone.replace(/(\d{4})(\d{3})(\d{0,4})/, '$1 $2 $3').trim()
    : '';

  const roleLabels: Record<UserRole, string> = {
    customer: 'Clean Fit',
    cleaner: 'Clean Fit Pro',
    admin: 'Clean Fit Admin',
  };

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      toast.error('Please enter a valid UK mobile number');
      return;
    }
    setIsLoading(true);
    await login(phone, role);
    setIsLoading(false);
    setStep('otp');
    toast.success('OTP sent! Use 1111 for testing.');
  };

  const handleVerify = async () => {
    if (otp.length !== 4) return;
    setIsLoading(true);
    const success = await verifyOtp(otp);
    setIsLoading(false);
    if (!success) {
      toast.error('Invalid OTP. Use 1111 for testing.');
      return;
    }
    toast.success('Verified! Signing you in...');
    setTimeout(() => {
      if (role === 'customer') navigate('/home');
      else if (role === 'cleaner') navigate('/cleaner');
      else navigate('/admin');
    }, 800);
  };

  const slideVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 pt-6 pb-4">
        <BackButton to="/" />
      </div>

      <div className="px-8">
        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.div key="phone" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h1 className="text-2xl font-bold text-foreground mb-1">Sign in to <span className="text-gradient">{roleLabels[role]}</span></h1>
              <p className="text-muted-foreground text-sm mb-8">Enter your mobile number to continue</p>

              <div className="relative mb-6">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <Input
                  value={displayPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="07700 900 000"
                  inputMode="numeric"
                  maxLength={14}
                  className="pl-12 h-14 rounded-2xl bg-muted/50 border-0 text-base focus-visible:ring-primary/30"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {phone.length}/11
                </span>
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={phone.length < 10 || isLoading}
                className="w-full h-14 text-base font-semibold gradient-blue text-primary-foreground rounded-2xl shadow-blue disabled:opacity-50 transition-opacity"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Test OTP: <span className="font-mono font-bold text-foreground">1111</span>
              </p>
            </motion.div>
          ) : (
            <motion.div key="otp" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h1 className="text-2xl font-bold text-foreground mb-1">Verify your number</h1>
              <p className="text-muted-foreground text-sm mb-8">Enter the 4-digit code sent to {displayPhone}</p>

              <div className="flex justify-center mb-8">
                <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                  <InputOTPGroup className="gap-3">
                    {[0, 1, 2, 3].map(i => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="w-16 h-16 rounded-2xl border-2 border-muted bg-muted/30 text-xl font-bold"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleVerify}
                disabled={otp.length !== 4 || isLoading}
                className="w-full h-14 text-base font-semibold gradient-blue text-primary-foreground rounded-2xl shadow-blue disabled:opacity-50 transition-opacity"
              >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </Button>

              <button onClick={() => { setStep('phone'); setOtp(''); }} className="w-full text-center text-sm text-muted-foreground mt-4 hover:text-foreground transition-colors">
                Change number
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
