import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Wrench, ChevronRight, ChevronLeft, Check, MapPin, Briefcase, Locate, Eye, Zap, CalendarDays, Sparkles, Bed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentPositionSafe } from '@/lib/geolocate';
import { toast } from 'sonner';
import { useServices } from '@/hooks/useServices';

interface CleanerOnboardingProps {
  onComplete: () => void;
}

export default function CleanerOnboarding({ onComplete }: CleanerOnboardingProps) {
  const { user, refreshProfile } = useAuth();
  const { data: allServices = [] } = useServices();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine, setAddressLine] = useState('');
  const [postcode, setPostcode] = useState('');
  const [experience, setExperience] = useState(0);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const totalSteps = 5;

  const toggleItem = <T,>(list: T[], item: T, setter: (v: T[]) => void) =>
    setter(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);

  const availableSpecs = allServices.filter(s => {
    if (selectedTypes.length === 0) return false;
    const typeMatch = (selectedTypes.includes('cleaning') && s.category === 'cleaning') ||
                      (selectedTypes.includes('housekeeping') && s.category === 'housekeeping');
    return typeMatch;
  });

  const autoDetect = async () => {
    setDetecting(true);
    try {
      const pos = await getCurrentPositionSafe(10_000);
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&addressdetails=1`);
      const data = await res.json();
      if (data?.address) {
        setPostcode(data.address.postcode || '');
        setAddressLine([data.address.house_number, data.address.road, data.address.suburb, data.address.city || data.address.town].filter(Boolean).join(', '));
        toast.success('Address detected!');
      }
    } catch { toast.error('Could not detect location'); }
    finally { setDetecting(false); }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || user.name;
      const { error: profileError } = await supabase.from('profiles').update({
        name: fullName,
        onboarding_completed: true,
      }).eq('user_id', user.id);

      if (profileError) {
        console.error('Profile update failed:', profileError);
        toast.error('Could not save profile. Please try again.');
        setSaving(false);
        return;
      }

      await supabase.from('cleaners').update({
        name: fullName,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        address_line1: addressLine,
        address_postcode: postcode,
        experience,
        specialisations: selectedSpecs,
        service_modes: selectedModes,
      }).eq('user_id', user.id);

      await refreshProfile();
      toast.success('Profile set up! Let\'s start training 📚');
      onComplete();
    } catch (err) {
      console.error('Cleaner onboarding save error:', err);
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const fadeVariants = { enter: { opacity: 0, x: 30 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 } };

  const stepIcons = [User, Zap, Briefcase, Wrench, Eye];
  const stepTitles = ['Personal Info', 'Service Mode', 'Service Type & Experience', 'Specialisations', 'Review & Confirm'];
  const stepDescs = ['Tell us about yourself', 'How do you want to work?', 'What type of services?', 'Select what you\'re great at', 'Check everything looks good'];

  const canAdvance = () => {
    switch (step) {
      case 1: return firstName.trim().length > 0;
      case 2: return selectedModes.length > 0;
      case 3: return selectedTypes.length > 0;
      case 4: return selectedSpecs.length > 0;
      case 5: return true;
      default: return false;
    }
  };

  const StepIcon = stepIcons[step - 1];

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
            <h1 className="text-2xl font-display font-black text-foreground">Join the Team!</h1>
            <p className="text-xs text-muted-foreground">Step {step} of {totalSteps}</p>
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
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <motion.div key="cs1" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <StepIcon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">{stepTitles[0]}</h3>
                  <p className="text-xs text-muted-foreground">{stepDescs[0]}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
                <Input placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
              </div>
              <Input placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} className="h-14 rounded-2xl border-2 border-border bg-card text-base" inputMode="tel" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Address</p>
                  <Button variant="ghost" size="sm" onClick={autoDetect} disabled={detecting} className="text-[10px] font-bold text-primary h-7 px-2">
                    <Locate className="h-3 w-3 mr-1" /> {detecting ? 'Detecting...' : 'Auto-detect'}
                  </Button>
                </div>
                <Input placeholder="Address line" value={addressLine} onChange={e => setAddressLine(e.target.value)} className="h-13 rounded-2xl border-2 border-border bg-card text-base mb-2" />
                <Input placeholder="Postcode" value={postcode} onChange={e => setPostcode(e.target.value)} className="h-13 rounded-2xl border-2 border-border bg-card text-base" />
              </div>
            </motion.div>
          )}

          {/* Step 2: Service Mode */}
          {step === 2 && (
            <motion.div key="cs2" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <StepIcon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">{stepTitles[1]}</h3>
                  <p className="text-xs text-muted-foreground">{stepDescs[1]}</p>
                </div>
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select one or both</p>
              {[
                { key: 'express', icon: Zap, label: 'Express Cleaning', desc: 'On-demand, same-day jobs. Customers book and you respond quickly.' },
                { key: 'scheduled', icon: CalendarDays, label: 'Scheduled Cleaning', desc: 'Pre-booked recurring or one-time jobs. Plan your week ahead.' },
              ].map((mode, i) => (
                <motion.button key={mode.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.98 }} onClick={() => toggleItem(selectedModes, mode.key, setSelectedModes)}
                  className={`w-full text-left border rounded-3xl p-5 flex items-center gap-4 shadow-soft transition-all ${
                    selectedModes.includes(mode.key) ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border bg-card'
                  }`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${selectedModes.includes(mode.key) ? 'bg-primary text-primary-foreground' : 'bg-primary/15'}`}>
                    <mode.icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-bold text-foreground">{mode.label}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{mode.desc}</p>
                  </div>
                  {selectedModes.includes(mode.key) && <Check className="h-5 w-5 text-primary shrink-0" />}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Step 3: Service Type & Experience */}
          {step === 3 && (
            <motion.div key="cs3" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">{stepTitles[2]}</h3>
                  <p className="text-xs text-muted-foreground">{stepDescs[2]}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Experience (years)</p>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 5, 10].map(y => (
                    <button key={y} onClick={() => setExperience(y)}
                      className={`flex-1 py-3.5 rounded-2xl text-sm font-bold border transition-all ${
                        experience === y ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'
                      }`}>{y}{y === 10 ? '+' : ''}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Service Type (select one or both)</p>
                {[
                  { key: 'cleaning', icon: Sparkles, label: 'House Cleaning', desc: 'Kitchen, bathroom, deep clean & more' },
                  { key: 'housekeeping', icon: Bed, label: 'Housekeeping', desc: 'Laundry, ironing, bed making & organising' },
                ].map((type, i) => (
                  <motion.button key={type.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    whileTap={{ scale: 0.98 }} onClick={() => toggleItem(selectedTypes, type.key, setSelectedTypes)}
                    className={`w-full text-left border rounded-3xl p-4 flex items-center gap-4 shadow-soft mb-2 transition-all ${
                      selectedTypes.includes(type.key) ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border bg-card'
                    }`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${selectedTypes.includes(type.key) ? 'bg-primary text-primary-foreground' : 'bg-primary/15'}`}>
                      <type.icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground text-sm">{type.label}</h4>
                      <p className="text-[11px] text-muted-foreground">{type.desc}</p>
                    </div>
                    {selectedTypes.includes(type.key) && <Check className="h-5 w-5 text-primary shrink-0" />}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Specialisations from DB */}
          {step === 4 && (
            <motion.div key="cs4" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">{stepTitles[3]}</h3>
                  <p className="text-xs text-muted-foreground">{stepDescs[3]}</p>
                </div>
              </div>
              {availableSpecs.length > 0 && (
                <button onClick={() => {
                  const allNames = availableSpecs.map(s => s.name);
                  setSelectedSpecs(selectedSpecs.length === allNames.length ? [] : allNames);
                }} className="text-xs font-bold text-primary">
                  {selectedSpecs.length === availableSpecs.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
              <div className="flex flex-wrap gap-2">
                {availableSpecs.map(s => (
                  <button key={s.id} onClick={() => toggleItem(selectedSpecs, s.name, setSelectedSpecs)}
                    className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      selectedSpecs.includes(s.name) ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'
                    }`}>
                    {selectedSpecs.includes(s.name) && <Check className="h-3 w-3" />}
                    {s.name}
                  </button>
                ))}
              </div>
              {availableSpecs.length === 0 && (
                <p className="text-sm text-muted-foreground">Please go back and select a service type first.</p>
              )}
            </motion.div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <motion.div key="cs5" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-4 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">{stepTitles[4]}</h3>
                  <p className="text-xs text-muted-foreground">{stepDescs[4]}</p>
                </div>
              </div>
              <div className="bg-card rounded-3xl p-5 border border-border shadow-soft space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-xl">
                    {firstName[0]?.toUpperCase() || 'C'}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-foreground">{firstName} {lastName}</h4>
                    <p className="text-[11px] text-muted-foreground">{phone}</p>
                  </div>
                </div>
                {addressLine && <p className="text-xs text-muted-foreground"><MapPin className="h-3 w-3 inline mr-1" />{addressLine}, {postcode}</p>}
                <div className="pt-2 border-t border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Experience</p>
                  <p className="text-sm font-bold text-foreground">{experience} years</p>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Service Mode</p>
                  <div className="flex flex-wrap gap-1">{selectedModes.map(m => <span key={m} className="bg-primary/10 text-foreground text-[10px] rounded-full px-2 py-0.5 font-medium capitalize">{m}</span>)}</div>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Service Type</p>
                  <div className="flex flex-wrap gap-1">{selectedTypes.map(t => <span key={t} className="bg-primary/10 text-foreground text-[10px] rounded-full px-2 py-0.5 font-medium capitalize">{t === 'cleaning' ? 'House Cleaning' : 'Housekeeping'}</span>)}</div>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Specialisations</p>
                  <div className="flex flex-wrap gap-1">{selectedSpecs.map(s => <span key={s} className="bg-foreground text-background text-[10px] rounded-full px-2 py-0.5 font-medium">{s}</span>)}</div>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Availability</p>
                  <p className="text-xs text-foreground">Available any day — just go online when you're ready to work! 🟢</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-6 pb-10 pt-4 bg-background">
        <Button
          onClick={() => { if (step < totalSteps) setStep(s => s + 1); else handleSave(); }}
          disabled={!canAdvance() || saving}
          className="w-full h-14 text-base font-bold rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40"
        >
          {saving ? 'Saving...' : step < totalSteps ? (
            <>Continue <ChevronRight className="h-4 w-4 ml-1" strokeWidth={2} /></>
          ) : (
            <>Start Your Training 📚</>
          )}
        </Button>
      </div>
    </div>
  );
}