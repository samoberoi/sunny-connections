import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, ChevronRight, ChevronLeft, Locate } from 'lucide-react';
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
  const [name, setName] = useState(user?.name || '');
  const [postcode, setPostcode] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const totalSteps = 2;

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

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        name: name.trim() || user.name,
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

      // Refresh profile so name updates immediately (fixes "Hi, New" issue)
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
                  <h3 className="font-display font-bold text-foreground">Your Name</h3>
                  <p className="text-xs text-muted-foreground">What should we call you?</p>
                </div>
              </div>
              <Input placeholder="Full name *" value={name} onChange={e => setName(e.target.value)} className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
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
                  <p className="text-xs text-muted-foreground">Optional — you can skip this</p>
                </div>
              </div>

              <Button variant="outline" onClick={autoDetectAddress} disabled={detecting}
                className="w-full h-12 rounded-2xl border-2 border-dashed border-primary/30 text-sm font-bold">
                <Locate className="h-4 w-4 mr-2" strokeWidth={1.5} />
                {detecting ? 'Detecting...' : 'Auto-detect my location'}
              </Button>

              <Input placeholder="Postcode" value={postcode} onChange={e => setPostcode(e.target.value)} className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
              <Input placeholder="Street address" value={addressLine} onChange={e => setAddressLine(e.target.value)} className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
              <Input placeholder="House / flat number" value={houseNumber} onChange={e => setHouseNumber(e.target.value)} className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-6 pb-10 pt-4 bg-background space-y-2">
        <Button
          onClick={() => { if (step < totalSteps) setStep(s => s + 1); else handleSave(); }}
          disabled={step === 1 && !name.trim() || saving}
          className="w-full h-14 text-base font-bold rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40"
        >
          {saving ? 'Saving...' : step < totalSteps ? (
            <>Continue <ChevronRight className="h-4 w-4 ml-1" strokeWidth={2} /></>
          ) : (
            <>Let's Go! 🎉</>
          )}
        </Button>
        {step === 2 && (
          <Button variant="ghost" onClick={handleSave} disabled={saving}
            className="w-full h-10 text-sm font-medium text-muted-foreground">
            Skip for now
          </Button>
        )}
      </div>
    </div>
  );
}
