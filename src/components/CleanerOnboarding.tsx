import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Wrench, Clock, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const specialisations = [
  'Kitchen Cleaning', 'Bathroom Cleaning', 'Deep Clean', 'Laundry & Ironing',
  'Bed Making', 'Organising', 'Window Cleaning', 'Carpet Cleaning',
];

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeSlots = ['Morning', 'Afternoon', 'Evening'];

interface CleanerOnboardingProps {
  onComplete: () => void;
}

export default function CleanerOnboarding({ onComplete }: CleanerOnboardingProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name || '');
  const [experience, setExperience] = useState(0);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['Morning', 'Afternoon']);
  const [saving, setSaving] = useState(false);
  const totalSteps = 3;

  const toggleSpec = (s: string) => setSelectedSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleDay = (d: number) => setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  const toggleTime = (t: string) => setSelectedTimes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        name: name.trim() || user.name,
        onboarding_completed: true,
      }).eq('user_id', user.id);

      await supabase.from('cleaners').update({
        name: name.trim() || user.name,
        experience,
        specialisations: selectedSpecs,
      }).eq('user_id', user.id);

      // Save availability
      const rows = selectedDays.map(day => ({
        cleaner_id: '', // Will be set below
        day_of_week: day,
        start_time: selectedTimes.includes('Morning') ? '07:00' : selectedTimes.includes('Afternoon') ? '12:00' : '17:00',
        end_time: selectedTimes.includes('Evening') ? '21:00' : selectedTimes.includes('Afternoon') ? '17:00' : '12:00',
        available: true,
      }));

      const { data: cleaner } = await supabase.from('cleaners').select('id').eq('user_id', user.id).maybeSingle();
      if (cleaner) {
        const finalRows = rows.map(r => ({ ...r, cleaner_id: cleaner.id }));
        await supabase.from('cleaner_availability').insert(finalRows);
      }

      toast.success('Profile set up! Let\'s get cleaning 🧹');
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
            <h1 className="text-2xl font-display font-black text-foreground">Join the Team!</h1>
            <p className="text-xs text-muted-foreground">Quick profile setup</p>
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
                  <User className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">Personal Info</h3>
                  <p className="text-xs text-muted-foreground">Tell us about yourself</p>
                </div>
              </div>
              <Input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="h-14 rounded-2xl border-2 border-border bg-card text-base" />
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
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="cs2" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">Specialisations</h3>
                  <p className="text-xs text-muted-foreground">Select what you're great at</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {specialisations.map(s => (
                  <button key={s} onClick={() => toggleSpec(s)}
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

          {step === 3 && (
            <motion.div key="cs3" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">Availability</h3>
                  <p className="text-xs text-muted-foreground">When can you work?</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Days</p>
                <div className="flex gap-2">
                  {dayLabels.map((d, i) => (
                    <button key={i} onClick={() => toggleDay(i)}
                      className={`flex-1 py-3 rounded-2xl text-xs font-bold border transition-all ${
                        selectedDays.includes(i) ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'
                      }`}>{d}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Times</p>
                <div className="flex gap-2">
                  {timeSlots.map(t => (
                    <button key={t} onClick={() => toggleTime(t)}
                      className={`flex-1 py-3.5 rounded-2xl text-xs font-bold border transition-all ${
                        selectedTimes.includes(t) ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-6 pb-10 pt-4 bg-background">
        <Button
          onClick={() => { if (step < totalSteps) setStep(s => s + 1); else handleSave(); }}
          disabled={step === 1 && !name.trim() || saving}
          className="w-full h-14 text-base font-bold rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40"
        >
          {saving ? 'Saving...' : step < totalSteps ? (
            <>Continue <ChevronRight className="h-4 w-4 ml-1" strokeWidth={2} /></>
          ) : (
            <>Start Earning! 💪</>
          )}
        </Button>
      </div>
    </div>
  );
}
