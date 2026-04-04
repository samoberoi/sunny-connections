import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, ArrowLeft, Sparkles } from 'lucide-react';
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
    if (digits.length <= 11) setPhone(digits);
  };

  const displayPhone = phone.length > 0
    ? phone.replace(/(\d{4})(\d{3})(\d{0,4})/, '$1 $2 $3').trim()
    : '';

  const roleLabels: Record<UserRole, string> = {
    customer: 'Clean Fit',
    cleaner: 'Clean Fit Pro',
    admin: 'Admin Panel',
  };

  const roleColors: Record<UserRole, string> = {
    customer: 'gradient-neon',
    cleaner: 'gradient-cyan',
    admin: 'gradient-dark',
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
    }, 600);
  };

  const slideVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with neon accent */}
      <div className={`${roleColors[role]} px-8 pt-14 pb-20 rounded-b-[2.5rem]`}>
        <button onClick={() => navigate('/')} className="w-10 h-10 rounded-2xl bg-foreground/10 flex items-center justify-center mb-8">
          <ArrowLeft className="h-5 w-5 text-foreground" strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-foreground/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-foreground" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-bold text-foreground/60 uppercase tracking-wider">{role}</span>
        </div>
        <h1 className="text-3xl font-display font-black text-foreground leading-tight">
          Sign in to<br />{roleLabels[role]}
        </h1>
      </div>

      <div className="px-8 -mt-8">
        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.div key="phone" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="glass-card-elevated rounded-3xl p-6">
              <p className="text-muted-foreground text-sm mb-6">Enter your mobile number to continue</p>

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
                className="w-full h-14 text-base font-bold gradient-neon text-foreground rounded-2xl shadow-neon disabled:opacity-50 transition-opacity"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Test: <span className="font-mono font-bold text-foreground">1111</span>
              </p>
            </motion.div>
          ) : (
            <motion.div key="otp" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="glass-card-elevated rounded-3xl p-6">
              <p className="text-muted-foreground text-sm mb-6">Enter the 4-digit code sent to {displayPhone}</p>

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
                className="w-full h-14 text-base font-bold gradient-neon text-foreground rounded-2xl shadow-neon disabled:opacity-50 transition-opacity"
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
