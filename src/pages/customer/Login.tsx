import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ArrowLeft, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '');
    if (digits.length <= 11) setPhone(digits);
  };

  const displayPhone = phone.length > 0
    ? phone.replace(/(\d{4})(\d{3})(\d{0,4})/, '$1 $2 $3').trim()
    : '';

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      toast.error('Enter a valid UK mobile number');
      return;
    }
    setIsLoading(true);
    await login(phone, role);
    setIsLoading(false);
    setStep('otp');
    toast.success('OTP sent! Use 1111 for testing.');
  };

  const handleVerify = () => {
    if (otp.length !== 4) return;
    const success = verifyOtp(otp);
    if (!success) {
      toast.error('Invalid OTP. Use 1111 for testing.');
      return;
    }
    toast.success('Welcome to Cleanfit!');
    setTimeout(() => {
      if (role === 'customer') navigate('/home');
      else if (role === 'cleaner') navigate('/cleaner');
      else navigate('/admin');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <button onClick={() => step === 'otp' ? setStep('phone') : navigate('/')} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 text-secondary-foreground" />
        </button>
        <div className="w-8 h-8 rounded-xl gradient-lime flex items-center justify-center">
          <span className="text-xs font-bold text-primary-foreground">C</span>
        </div>
      </div>

      <div className="flex-1 px-8 pt-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={step}>
          {step === 'phone' ? (
            <>
              <h1 className="text-3xl font-bold text-secondary-foreground mb-1">
                Sign in
              </h1>
              <p className="text-secondary-foreground/50 text-sm mb-8">
                Enter your mobile to continue
              </p>

              {/* Role pills */}
              <div className="flex gap-2 mb-6">
                {(['customer', 'cleaner', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all ${
                      role === r
                        ? 'gradient-lime text-primary-foreground shadow-lime'
                        : 'glass text-secondary-foreground/60 hover:text-secondary-foreground'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Phone input */}
              <div className="relative mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-secondary-foreground/40 text-sm">🇬🇧</span>
                  <span className="text-secondary-foreground/30 text-xs">+44</span>
                </div>
                <Input
                  value={displayPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="07700 900 000"
                  inputMode="numeric"
                  maxLength={14}
                  className="pl-20 h-14 rounded-2xl bg-secondary-foreground/5 border-secondary-foreground/10 text-secondary-foreground text-base placeholder:text-secondary-foreground/20 focus-visible:ring-primary/40"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-secondary-foreground/30 font-mono">
                  {phone.length}/11
                </span>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSendOTP}
                disabled={phone.length < 10 || isLoading}
                className="w-full h-14 gradient-lime text-primary-foreground font-bold rounded-2xl shadow-lime flex items-center justify-center gap-2 text-base disabled:opacity-40"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
                <ArrowRight className="h-5 w-5" />
              </motion.button>

              <p className="text-[11px] text-secondary-foreground/30 text-center mt-6">
                Test code: <span className="font-mono text-primary font-bold">1111</span>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-secondary-foreground mb-1">Verify</h1>
              <p className="text-secondary-foreground/50 text-sm mb-8">
                4-digit code sent to <span className="text-primary font-medium">{displayPhone}</span>
              </p>

              <div className="flex justify-center mb-8">
                <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                  <InputOTPGroup className="gap-3">
                    {[0, 1, 2, 3].map(i => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="w-16 h-16 rounded-2xl border-2 border-secondary-foreground/10 bg-secondary-foreground/5 text-xl font-bold text-secondary-foreground"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleVerify}
                disabled={otp.length !== 4}
                className="w-full h-14 gradient-lime text-primary-foreground font-bold rounded-2xl shadow-lime flex items-center justify-center gap-2 text-base disabled:opacity-40"
              >
                Verify & Continue
                <ArrowRight className="h-5 w-5" />
              </motion.button>

              <button onClick={() => setStep('phone')} className="w-full text-center text-sm text-secondary-foreground/40 mt-5 hover:text-secondary-foreground/70 transition-colors">
                Change number
              </button>
            </>
          )}
        </motion.div>
      </div>

      {/* Bottom decorative blob */}
      <div className="relative h-32 overflow-hidden">
        <div className="absolute -bottom-20 -right-10 w-40 h-40 bg-primary/10 blob animate-blob-morph" />
        <div className="absolute -bottom-16 -left-8 w-32 h-32 bg-primary/5 blob-2 animate-blob-morph" style={{ animationDelay: '4s' }} />
      </div>
    </div>
  );
}
