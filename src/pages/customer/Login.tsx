import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth, UserRole } from '@/contexts/AuthContext';
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
    if (digits.length <= 10) setPhone(digits);
  };

  const displayPhone = phone.length > 0
    ? phone.replace(/(\d{3})(\d{3})(\d{0,4})/, '$1 $2 $3').trim()
    : '';

  const roleLabels: Record<UserRole, string> = {
    customer: 'Clean Fit',
    cleaner: 'Clean Fit Pro',
    admin: 'Admin Panel',
  };

  const roleHints: Record<UserRole, string> = {
    customer: '1111111111',
    cleaner: '2222222222',
    admin: '0000000000',
  };

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
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
    toast.success('Welcome to Clean Fit! 🎉');
    setTimeout(() => {
      if (role === 'customer') navigate('/home');
      else if (role === 'cleaner') navigate('/cleaner');
      else navigate('/admin');
    }, 300);
  };

  const slideVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-8 pt-14 pb-16">
        <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full border border-border flex items-center justify-center mb-12 hover:bg-muted transition-colors">
          <ArrowLeft className="h-4 w-4 text-foreground" strokeWidth={1.5} />
        </button>
        <p className="text-xs font-medium text-primary uppercase tracking-widest mb-2">{role}</p>
        <h1 className="text-3xl font-display font-black text-foreground leading-tight">
          Sign in to<br />{roleLabels[role]}
        </h1>
      </div>

      <div className="px-8">
        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.div key="phone" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <p className="text-muted-foreground text-sm mb-6">Enter your mobile number to continue</p>

              <div className="relative mb-6">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" strokeWidth={1.5} />
                <Input
                  value={displayPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder={roleHints[role]}
                  inputMode="numeric"
                  maxLength={12}
                  className="pl-12 h-14 rounded-2xl border border-border bg-background text-base focus-visible:ring-primary/30"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {phone.length}/10
                </span>
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={phone.length < 10 || isLoading}
                className="w-full h-14 text-base font-semibold rounded-2xl disabled:opacity-40 transition-opacity bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Test: <span className="font-mono font-bold text-primary">{roleHints[role]}</span> · OTP: <span className="font-mono font-bold text-primary">1111</span>
              </p>
            </motion.div>
          ) : (
            <motion.div key="otp" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <p className="text-muted-foreground text-sm mb-6">Enter the 4-digit code sent to {displayPhone}</p>

              <div className="flex justify-center mb-8">
                <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                  <InputOTPGroup className="gap-3">
                    {[0, 1, 2, 3].map(i => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="w-16 h-16 rounded-2xl border-2 border-border bg-background text-xl font-bold focus:border-primary"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleVerify}
                disabled={otp.length !== 4 || isLoading}
                className="w-full h-14 text-base font-semibold rounded-2xl disabled:opacity-40 transition-opacity bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </Button>

              <button onClick={() => { setStep('phone'); setOtp(''); }} className="w-full text-center text-sm text-muted-foreground mt-4 hover:text-primary transition-colors">
                Change number
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
