import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import RoleOnboarding from '@/components/RoleOnboarding';
import { toast } from 'sonner';

export default function Login() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const pathnameRole: UserRole | undefined = location.pathname.startsWith('/admin') ? 'admin' : location.pathname.startsWith('/cleaner') ? 'cleaner' : undefined;
  const roleParam = ((searchParams.get('role') as UserRole) || pathnameRole || 'customer') as UserRole;
  const [step, setStep] = useState<'phone' | 'otp' | 'onboarding'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, verifyOtp, user } = useAuth();
  const navigate = useNavigate();
  const role: UserRole = roleParam;

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '');
    if (digits.length <= 10) setPhone(digits);
  };

  const displayPhone = phone.length > 0 ? phone.replace(/(\d{3})(\d{3})(\d{0,4})/, '$1 $2 $3').trim() : '';

  const roleLabels: Record<UserRole, string> = { customer: 'Clean Fit', cleaner: 'Clean Fit Pro', admin: 'Admin Panel' };
  const roleHints: Record<UserRole, string> = { customer: '1111111111', cleaner: '2222222222', admin: '0000000000' };

  const handleSendOTP = async () => {
    if (phone.length < 10) { toast.error('Please enter a valid 10-digit mobile number'); return; }
    setIsLoading(true);
    await login(phone, role);
    setIsLoading(false);
    setStep('otp');
    toast.success('OTP sent! Use 1111 for testing.');
  };

  const goToDashboard = () => {
    if (role === 'customer') navigate('/home', { replace: true });
    else if (role === 'cleaner') navigate('/cleaner', { replace: true });
    else navigate('/admin', { replace: true });
  };

  const handleVerify = async () => {
    if (otp.length !== 4) return;
    setIsLoading(true);
    const success = await verifyOtp(otp);
    setIsLoading(false);
    if (!success) { toast.error('Invalid OTP. Use 1111 for testing.'); return; }
    toast.success('Welcome to Clean Fit! 🎉');
    const onboardingKey = `onboarding_${role}_complete`;
    const seen = localStorage.getItem(onboardingKey);
    if (!seen && role !== 'admin') { setTimeout(() => setStep('onboarding'), 300); }
    else { setTimeout(goToDashboard, 300); }
  };

  const handleOnboardingComplete = () => { localStorage.setItem(`onboarding_${role}_complete`, '1'); goToDashboard(); };

  const slideVariants = { enter: { opacity: 0, x: 20 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } };

  if (step === 'onboarding') {
    return <RoleOnboarding role={role} userName={user?.name || 'there'} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Lime header */}
      <div className="bg-primary rounded-b-[2rem] px-6 pt-14 pb-28 relative">
        <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-primary-foreground/10 border border-primary-foreground/10 flex items-center justify-center mb-6">
          <ArrowLeft className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-primary-foreground flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-bold text-primary-foreground/60 uppercase tracking-wider">{role}</span>
        </div>
        <h1 className="text-3xl font-display font-black text-primary-foreground leading-tight">
          Sign in to<br />{roleLabels[role]}
        </h1>
      </div>

      {/* Card overlapping the header - higher z-index and more negative margin */}
      <div className="px-6 -mt-16 relative z-20">
        <div className="bg-card rounded-3xl p-6 shadow-elevated border border-border">
          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.div key="phone" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <p className="text-muted-foreground text-sm mb-5">Enter your mobile number</p>
                <div className="relative mb-5">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                  </div>
                  <Input value={displayPhone} onChange={(e) => handlePhoneChange(e.target.value)} placeholder={roleHints[role]}
                    inputMode="numeric" maxLength={12}
                    className="pl-14 h-14 rounded-2xl border-2 border-border bg-background text-lg font-bold focus-visible:ring-primary/30 focus-visible:border-primary" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">{phone.length}/10</span>
                </div>
                <Button onClick={handleSendOTP} disabled={phone.length < 10 || isLoading}
                  className="w-full h-14 text-base font-bold rounded-full disabled:opacity-40 bg-foreground text-background hover:bg-foreground/90">
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Test: <span className="font-mono font-bold text-foreground">{roleHints[role]}</span> · OTP: <span className="font-mono font-bold text-foreground">1111</span>
                </p>
              </motion.div>
            ) : (
              <motion.div key="otp" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <p className="text-muted-foreground text-sm mb-5">Enter the 4-digit code sent to {displayPhone}</p>
                <div className="flex justify-center mb-6">
                  <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                    <InputOTPGroup className="gap-3">
                      {[0, 1, 2, 3].map(i => (
                        <InputOTPSlot key={i} index={i} className="w-16 h-16 rounded-2xl border-2 border-border bg-background text-xl font-bold focus:border-primary" />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button onClick={handleVerify} disabled={otp.length !== 4 || isLoading}
                  className="w-full h-14 text-base font-bold rounded-full disabled:opacity-40 bg-foreground text-background hover:bg-foreground/90">
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
    </div>
  );
}
