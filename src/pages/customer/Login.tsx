import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export default function Login() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('+44');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = () => {
    if (phone.length >= 10) setStep('otp');
  };

  const handleVerify = () => {
    if (otp.length === 4) {
      login(phone, role);
      if (role === 'customer') navigate('/home');
      else if (role === 'cleaner') navigate('/cleaner');
      else navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
      </div>

      <div className="px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {step === 'phone' ? (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-1">Sign in to <span className="text-gradient">Cleanfit</span></h1>
              <p className="text-muted-foreground text-sm mb-8">Enter your mobile number to continue</p>

              {/* Role selector */}
              <div className="flex gap-2 p-1 bg-muted rounded-2xl mb-6">
                {(['customer', 'cleaner', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                      role === r
                        ? 'bg-card shadow-apple text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="relative mb-6">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7700 900000"
                  className="pl-12 h-14 rounded-2xl bg-muted/50 border-0 text-base focus-visible:ring-primary/30"
                />
              </div>

              <Button
                onClick={handleSendOTP}
                className="w-full h-14 text-base font-semibold gradient-blue text-primary-foreground rounded-2xl shadow-blue"
              >
                Send OTP
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-1">Verify your number</h1>
              <p className="text-muted-foreground text-sm mb-8">Enter the 4-digit code sent to {phone}</p>

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
                className="w-full h-14 text-base font-semibold gradient-blue text-primary-foreground rounded-2xl shadow-blue"
              >
                Verify & Continue
              </Button>

              <button onClick={() => setStep('phone')} className="w-full text-center text-sm text-muted-foreground mt-4 hover:text-foreground transition-colors">
                Change number
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
