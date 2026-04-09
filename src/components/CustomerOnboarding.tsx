import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, ChevronRight, ChevronLeft, Locate, Gift, Mail, Camera, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CustomerOnboardingProps {
  onComplete: () => void;
}

export default function CustomerOnboarding({ onComplete }: CustomerOnboardingProps) {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [postcode, setPostcode] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [referralCode, setReferralCode] = useState(localStorage.getItem('pending_referral_code') || '');
  const [referralApplied, setReferralApplied] = useState(false);

  const totalSteps = 3;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const autoDetectAddress = async () => {
    setDetecting(true);
    try {
      if ('geolocation' in navigator) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
        );
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
        const data = await res.json();
        if (data?.address) {
          const addr = data.address;
          setPostcode(addr.postcode || '');
          setAddressLine([addr.road, addr.suburb, addr.city || addr.town || addr.village].filter(Boolean).join(', '));
          setHouseNumber(addr.house_number || '');
          toast.success('Address detected!');
        }
      }
    } catch {
      toast.error('Could not detect location. Please enter manually.');
    } finally {
      setDetecting(false);
    }
  };

  const applyReferralCode = () => {
    const code = referralCode.trim().toUpperCase();
    if (!code) return;
    if (code.startsWith('CLEAN') && code.length >= 8) {
      setReferralApplied(true);
      localStorage.setItem('applied_referral_code', code);
      localStorage.removeItem('pending_referral_code');
      toast.success("You'll get 20% off your first booking! 🎉");
    } else {
      toast.error('Invalid referral code. Codes start with CLEAN.');
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      let avatarUrl: string | null = null;
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop() || 'jpg';
        const path = `avatars/${user.id}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('job-photos').upload(path, avatarFile, { upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('job-photos').getPublicUrl(path);
          avatarUrl = urlData.publicUrl;
        }
      }

      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await supabase.from('profiles').update({
        name: fullName,
        email: email.trim() || null,
        avatar: avatarUrl,
        onboarding_completed: true,
      }).eq('user_id', user.id);

      const fullAddress = houseNumber ? `${houseNumber} ${addressLine}` : addressLine;
      if (fullAddress && postcode) {
        await supabase.from('addresses').insert({
          user_id: user.id,
          label: 'Home',
          line1: fullAddress,
          postcode,
          city: 'London',
        });
      }

      await refreshProfile();
      toast.success('Welcome to Clean Fit! 🎉');
      onComplete();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const fadeVariants = { enter: { opacity: 0, x: 30 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 } };

  return (
    <div className="fixed inset-0 z-[140] bg-background flex flex-col">
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-4">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
              <ChevronLeft className="h-4 w-4 text-foreground" strokeWidth={1.5} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-display font-black text-foreground">Welcome!</h1>
            <p className="text-xs text-muted-foreground">Quick setup — takes 30 seconds</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < step ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <User className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">About You</h3>
                  <p className="text-xs text-muted-foreground">Tell us a bit about yourself</p>
                </div>
              </div>

              {/* Avatar upload */}
              <div className="flex justify-center">
                <label className="relative cursor-pointer group">
                  <div className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-foreground flex items-center justify-center">
                    <Camera className="h-3.5 w-3.5 text-background" strokeWidth={1.5} />
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <p className="text-center text-[10px] text-muted-foreground">Tap to add a photo (optional)</p>

              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="First name *" value={firstName} onChange={e => setFirstName(e.target.value)} className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
                <Input placeholder="Last name *" value={lastName} onChange={e => setLastName(e.target.value)} className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
              </div>

              <div className="flex items-center gap-3 bg-muted/50 rounded-2xl px-4 py-3">
                <Phone className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-sm text-foreground font-medium">{user?.phone || '—'}</span>
                <span className="text-[9px] text-muted-foreground ml-auto">Auto-detected</span>
              </div>

              <Input placeholder="Email (optional)" type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">Home Address</h3>
                  <p className="text-xs text-muted-foreground">Where should we clean?</p>
                </div>
              </div>

              <Button variant="outline" onClick={autoDetectAddress} disabled={detecting}
                className="w-full h-12 rounded-2xl border-2 border-dashed border-primary/30 text-sm font-bold">
                <Locate className="h-4 w-4 mr-2" strokeWidth={1.5} />
                {detecting ? 'Detecting...' : 'Auto-detect my location'}
              </Button>

              <Input placeholder="Postcode *" value={postcode} onChange={e => setPostcode(e.target.value)} className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
              <Input placeholder="Street address *" value={addressLine} onChange={e => setAddressLine(e.target.value)} className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
              <Input placeholder="House / flat number" value={houseNumber} onChange={e => setHouseNumber(e.target.value)} className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <Gift className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">Got a Referral Code?</h3>
                  <p className="text-xs text-muted-foreground">Enter it to get 20% off your first booking</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="e.g. CLEAN1A2B3C"
                  value={referralCode}
                  onChange={e => { setReferralCode(e.target.value.toUpperCase()); setReferralApplied(false); }}
                  className="h-14 rounded-2xl border-2 border-border bg-card text-base flex-1"
                  disabled={referralApplied}
                />
                <Button
                  onClick={applyReferralCode}
                  disabled={!referralCode.trim() || referralApplied}
                  className="h-14 rounded-2xl px-5 font-bold"
                >
                  {referralApplied ? '✓ Applied' : 'Apply'}
                </Button>
              </div>

              {referralApplied && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
                  <p className="text-sm font-bold text-foreground">🎉 20% off your first booking!</p>
                  <p className="text-xs text-muted-foreground mt-1">Discount will be applied automatically</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-6 pb-10 pt-4 bg-background space-y-2">
        <Button
          onClick={() => { if (step < totalSteps) setStep(s => s + 1); else handleSave(); }}
          disabled={(step === 1 && (!firstName.trim() || !lastName.trim())) || (step === 2 && (!postcode.trim() || !addressLine.trim())) || saving}
          className="w-full h-14 text-base font-bold rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40"
        >
          {saving ? 'Saving...' : step < totalSteps ? (
            <>Continue <ChevronRight className="h-4 w-4 ml-1" strokeWidth={2} /></>
          ) : (
            <>Let's Go! 🎉</>
          )}
        </Button>
      </div>
    </div>
  );
}
