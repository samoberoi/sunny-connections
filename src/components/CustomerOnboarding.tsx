import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Home, MapPin, Heart, ChevronRight, ChevronLeft, Building2, Landmark, Check, Dog, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const propertyTypes = [
  { value: 'flat', label: 'Flat', icon: Building2 },
  { value: 'house', label: 'House', icon: Home },
  { value: 'office', label: 'Office', icon: Landmark },
];

const propertySizes = [
  { value: 'small', label: 'Small', desc: '< 500 sqft' },
  { value: 'medium', label: 'Medium', desc: '500–1000 sqft' },
  { value: 'large', label: 'Large', desc: '1000–2000 sqft' },
  { value: 'xl', label: 'XL', desc: '2000+ sqft' },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface CustomerOnboardingProps {
  onComplete: () => void;
}

export default function CustomerOnboarding({ onComplete }: CustomerOnboardingProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [propertyType, setPropertyType] = useState('house');
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [propertySize, setPropertySize] = useState('medium');
  const [postcode, setPostcode] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [preferredDay, setPreferredDay] = useState('');
  const [petInfo, setPetInfo] = useState('');
  const [budget, setBudget] = useState<'standard' | 'premium'>('standard');
  const [saving, setSaving] = useState(false);

  const totalSteps = 4;

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        name: name.trim() || user.name,
        email: email.trim() || null,
        onboarding_completed: true,
        bedrooms,
        bathrooms,
        property_size: propertySize,
        preferred_day: preferredDay || null,
        pet_info: petInfo || null,
        budget_preference: budget,
      }).eq('user_id', user.id);

      if (addressLine && postcode) {
        await supabase.from('addresses').insert({
          user_id: user.id,
          label: 'Home',
          line1: addressLine,
          postcode,
          city: 'London',
        });
      }

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
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-4">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
              <ChevronLeft className="h-4 w-4 text-foreground" strokeWidth={1.5} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-display font-black text-foreground">Welcome!</h1>
            <p className="text-xs text-muted-foreground">Let's set up your profile</p>
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
                  <p className="text-xs text-muted-foreground">What should we call you?</p>
                </div>
              </div>
              <Input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
              <Input placeholder="Email (optional)" value={email} onChange={e => setEmail(e.target.value)} type="email" className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <Home className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">Your Property</h3>
                  <p className="text-xs text-muted-foreground">Helps us price accurately</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Type</p>
                <div className="grid grid-cols-3 gap-2">
                  {propertyTypes.map(pt => (
                    <button key={pt.value} onClick={() => setPropertyType(pt.value)}
                      className={`py-4 rounded-2xl text-sm font-bold flex flex-col items-center gap-2 border transition-all ${
                        propertyType === pt.value ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'
                      }`}>
                      <pt.icon className="h-5 w-5" strokeWidth={1.5} />{pt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Bedrooms</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setBedrooms(n)}
                      className={`flex-1 py-3.5 rounded-2xl text-sm font-bold border transition-all ${
                        bedrooms === n ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'
                      }`}>{n}{n === 5 ? '+' : ''}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Bathrooms</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(n => (
                    <button key={n} onClick={() => setBathrooms(n)}
                      className={`flex-1 py-3.5 rounded-2xl text-sm font-bold border transition-all ${
                        bathrooms === n ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'
                      }`}>{n}{n === 4 ? '+' : ''}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Size</p>
                <div className="grid grid-cols-2 gap-2">
                  {propertySizes.map(ps => (
                    <button key={ps.value} onClick={() => setPropertySize(ps.value)}
                      className={`py-3 rounded-2xl text-sm font-bold border transition-all ${
                        propertySize === ps.value ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'
                      }`}>
                      {ps.label} <span className="text-[10px] opacity-60 block">{ps.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">Default Address</h3>
                  <p className="text-xs text-muted-foreground">We'll save this for future bookings</p>
                </div>
              </div>
              <Input placeholder="Postcode" value={postcode} onChange={e => setPostcode(e.target.value)} className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
              <Input placeholder="Address line" value={addressLine} onChange={e => setAddressLine(e.target.value)} className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">Preferences</h3>
                  <p className="text-xs text-muted-foreground">Customise your experience</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Preferred Day</p>
                <div className="flex flex-wrap gap-2">
                  {days.map(d => (
                    <button key={d} onClick={() => setPreferredDay(d)}
                      className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all ${
                        preferredDay === d ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'
                      }`}>{d.slice(0, 3)}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1"><Dog className="h-3 w-3" /> Pets or Allergies</p>
                <Input placeholder="e.g. 1 cat, no bleach products" value={petInfo} onChange={e => setPetInfo(e.target.value)} className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Service Tier</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'standard' as const, label: 'Standard', desc: 'Vetted cleaners, great value', icon: Check },
                    { value: 'premium' as const, label: 'Premium', desc: 'Top-rated, eco products', icon: Leaf },
                  ].map(tier => (
                    <button key={tier.value} onClick={() => setBudget(tier.value)}
                      className={`p-4 rounded-2xl text-left border-2 transition-all ${
                        budget === tier.value ? 'border-primary bg-primary/10' : 'border-border bg-card'
                      }`}>
                      <tier.icon className={`h-5 w-5 mb-2 ${budget === tier.value ? 'text-foreground' : 'text-muted-foreground'}`} strokeWidth={1.5} />
                      <h4 className="font-bold text-foreground text-sm">{tier.label}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{tier.desc}</p>
                      {tier.value === 'premium' && <span className="text-[9px] font-bold text-primary-ink mt-1 block">+30% pricing</span>}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-10 pt-4 bg-background">
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
      </div>
    </div>
  );
}
