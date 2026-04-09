import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Wrench, Clock, ChevronRight, ChevronLeft, Check, MapPin, Briefcase, Locate, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const categories = ['Regular Cleaning', 'General Housekeeping', 'Deep Cleaning', 'End of Tenancy'];
const specialisations = [
  'Kitchen Deep Clean', 'Deep Cleaning', 'Regular Cleaning', 'End of Tenancy',
  'Laundry & Ironing', 'Bed Making & Linen Change', 'Organising & Decluttering', 'General Housekeeping',
];

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeSlots = ['Morning', 'Afternoon', 'Evening'];

interface CleanerOnboardingProps {
  onComplete: () => void;
}

export default function CleanerOnboarding({ onComplete }: CleanerOnboardingProps) {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine, setAddressLine] = useState('');
  const [postcode, setPostcode] = useState('');
  const [experience, setExperience] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['Morning', 'Afternoon']);
  const [preferredHours, setPreferredHours] = useState('8');
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const totalSteps = 5;

  const toggleItem = <T,>(list: T[], item: T, setter: (v: T[]) => void) =>
    setter(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);

  const autoDetect = async () => {
    setDetecting(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
      );
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
      await supabase.from('profiles').update({
        name: fullName,
        onboarding_completed: true,
      }).eq('user_id', user.id);

      await supabase.from('cleaners').update({
        name: fullName,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        address_line1: addressLine,
        address_postcode: postcode,
        experience,
        specialisations: [...selectedCategories, ...selectedSpecs],
      }).eq('user_id', user.id);

      const { data: cleaner } = await supabase.from('cleaners').select('id').eq('user_id', user.id).maybeSingle();
      if (cleaner) {
        const rows = selectedDays.map(day => ({
          cleaner_id: cleaner.id,
          day_of_week: day,
          start_time: selectedTimes.includes('Morning') ? '07:00' : selectedTimes.includes('Afternoon') ? '12:00' : '17:00',
          end_time: selectedTimes.includes('Evening') ? '21:00' : selectedTimes.includes('Afternoon') ? '17:00' : '12:00',
          available: true,
        }));
        await supabase.from('cleaner_availability').insert(rows);
      }

      // Refresh profile so name updates immediately (fixes "Hi, New" issue)
      await refreshProfile();

      toast.success('Profile set up! Let\'s start training 📚');
      // Don't call onComplete here - the ProtectedRoute will detect onboarding is done
      // and then show CleanerTrainingGate since training is not complete yet
      onComplete();
    } catch { toast.error('Something went wrong'); }
    finally { setSaving(false); }
  };

  const fadeVariants = { enter: { opacity: 0, x: 30 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 } };

  const stepIcons = [User, Briefcase, Wrench, Clock, Eye];
  const stepTitles = ['Personal Info', 'Experience & Interests', 'Specialisations', 'Availability', 'Review & Confirm'];
  const stepDescs = ['Tell us about yourself', 'Your background & services', 'Select what you\'re great at', 'When can you work?', 'Check everything looks good'];

  const canAdvance = () => {
    switch (step) {
      case 1: return firstName.trim().length > 0;
      case 2: return selectedCategories.length > 0;
      case 3: return selectedSpecs.length > 0;
      case 4: return selectedDays.length > 0 && selectedTimes.length > 0;
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
                  <Button variant="ghost" size="sm" onClick={autoDetect} disabled={detecting} className="text-[10px] font-bold text-primary-ink h-7 px-2">
                    <Locate className="h-3 w-3 mr-1" /> {detecting ? 'Detecting...' : 'Auto-detect'}
                  </Button>
                </div>
                <Input placeholder="Address line" value={addressLine} onChange={e => setAddressLine(e.target.value)} className="h-13 rounded-2xl border-2 border-border bg-card text-base mb-2" />
                <Input placeholder="Postcode" value={postcode} onChange={e => setPostcode(e.target.value)} className="h-13 rounded-2xl border-2 border-border bg-card text-base" />
              </div>
            </motion.div>
          )}

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
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Interested in (select all)</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button key={c} onClick={() => toggleItem(selectedCategories, c, setSelectedCategories)}
                      className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        selectedCategories.includes(c) ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'
                      }`}>
                      {selectedCategories.includes(c) && <Check className="h-3 w-3" />}
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="cs3" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">{stepTitles[2]}</h3>
                  <p className="text-xs text-muted-foreground">{stepDescs[2]}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {specialisations.map(s => (
                  <button key={s} onClick={() => toggleItem(selectedSpecs, s, setSelectedSpecs)}
                    className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      selectedSpecs.includes(s) ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'
                    }`}>
                    {selectedSpecs.includes(s) && <Check className="h-3 w-3" />}
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="cs4" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">{stepTitles[3]}</h3>
                  <p className="text-xs text-muted-foreground">{stepDescs[3]}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Days</p>
                <div className="flex gap-2">
                  {dayLabels.map((d, i) => (
                    <button key={i} onClick={() => toggleItem(selectedDays, i, setSelectedDays)}
                      className={`flex-1 py-3 rounded-2xl text-xs font-bold border transition-all ${
                        selectedDays.includes(i) ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'
                      }`}>{d}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Preferred Times</p>
                <div className="flex gap-2">
                  {timeSlots.map(t => (
                    <button key={t} onClick={() => toggleItem(selectedTimes, t, setSelectedTimes)}
                      className={`flex-1 py-3.5 rounded-2xl text-xs font-bold border transition-all ${
                        selectedTimes.includes(t) ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Preferred hours/day</p>
                <div className="flex gap-2">
                  {['4', '6', '8', '10'].map(h => (
                    <button key={h} onClick={() => setPreferredHours(h)}
                      className={`flex-1 py-3 rounded-2xl text-sm font-bold border transition-all ${
                        preferredHours === h ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'
                      }`}>{h}h</button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

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
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Interests</p>
                  <div className="flex flex-wrap gap-1">{selectedCategories.map(c => <span key={c} className="bg-primary/10 text-foreground text-[10px] rounded-full px-2 py-0.5 font-medium">{c}</span>)}</div>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Specialisations</p>
                  <div className="flex flex-wrap gap-1">{selectedSpecs.map(s => <span key={s} className="bg-foreground text-background text-[10px] rounded-full px-2 py-0.5 font-medium">{s}</span>)}</div>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Availability</p>
                  <p className="text-xs text-foreground">{selectedDays.map(d => dayLabels[d]).join(', ')} · {selectedTimes.join(', ')} · {preferredHours}h/day</p>
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
