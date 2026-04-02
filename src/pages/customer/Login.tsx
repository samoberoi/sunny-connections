import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Phone } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col gradient-hero">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf className="h-10 w-10 text-secondary" />
            <h1 className="font-display text-3xl font-bold text-primary-foreground">Indiana Green</h1>
          </div>
          <p className="text-primary-foreground/70 text-sm">London's Most Trusted Cleaning Service</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-sm bg-card rounded-2xl p-6 shadow-xl"
        >
          {step === 'phone' ? (
            <>
              <h2 className="font-display text-xl font-semibold text-foreground mb-1">Welcome back</h2>
              <p className="text-sm text-muted-foreground mb-6">Enter your mobile number to continue</p>
              
              <div className="space-y-4">
                <div className="flex gap-2 mb-4">
                  {(['customer', 'cleaner', 'admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${role === r ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+44 7700 900000"
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSendOTP} className="w-full gradient-primary text-primary-foreground">
                  Send OTP
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-semibold text-foreground mb-1">Verify OTP</h2>
              <p className="text-sm text-muted-foreground mb-6">Enter the 4-digit code sent to {phone}</p>
              
              <div className="flex justify-center mb-6">
                <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button onClick={handleVerify} className="w-full gradient-primary text-primary-foreground">
                Verify & Continue
              </Button>
              <button onClick={() => setStep('phone')} className="w-full text-center text-sm text-muted-foreground mt-3 hover:text-foreground">
                Change number
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
