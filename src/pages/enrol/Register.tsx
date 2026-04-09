import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CircleCheck, User, FileText, Briefcase, Users, ShieldCheck, Clock, CreditCard, FileCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import cleanerPortrait from '@/assets/cleaner-portrait.jpg';
import { useServices } from '@/hooks/useServices';

const steps = [
  { title: 'Personal Details', icon: User, desc: 'Tell us about yourself' },
  { title: 'Identity', icon: FileText, desc: 'Verify your identity' },
  { title: 'Experience', icon: Briefcase, desc: 'Your cleaning background' },
  { title: 'References', icon: Users, desc: 'Professional references' },
  { title: 'DBS Check', icon: ShieldCheck, desc: 'Safety first, always' },
  { title: 'Availability', icon: Clock, desc: 'When can you work?' },
  { title: 'Bank Details', icon: CreditCard, desc: 'Get paid promptly' },
  { title: 'Agreement', icon: FileCheck, desc: 'Almost there!' },
];

interface FormData {
  fullName: string; dob: string; phone: string; email: string; postcode: string;
  rightToWork: string; idType: string; experience: number; selectedSpecs: string[];
  ref1Name: string; ref1Phone: string; ref1Relation: string;
  ref2Name: string; ref2Phone: string; ref2Relation: string;
  dbsConsent: boolean; selectedDays: string[]; hours: string;
  sortCode: string; accountNumber: string; accountHolder: string;
  agreedTerms: boolean; agreedData: boolean;
}

export default function Register() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState<FormData>({
    fullName: '', dob: '', phone: '', email: '', postcode: '', rightToWork: '', idType: 'Passport',
    experience: 0, selectedSpecs: [],
    ref1Name: '', ref1Phone: '', ref1Relation: '',
    ref2Name: '', ref2Phone: '', ref2Relation: '',
    dbsConsent: false, selectedDays: [], hours: '',
    sortCode: '', accountNumber: '', accountHolder: '',
    agreedTerms: false, agreedData: false,
  });
  const { data: allServices = [] } = useServices();

  const updateForm = (field: keyof FormData, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day],
    }));
  };

  const next = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setSubmitting(true);
      try {
        const { error } = await supabase.from('enrolment_applications').insert({
          user_id: user?.id || null,
          full_name: form.fullName, dob: form.dob || '2000-01-01',
          phone: form.phone, email: form.email, postcode: form.postcode,
          right_to_work: form.rightToWork || 'UK Citizen', id_type: form.idType,
          experience: form.experience,
          specialisations: form.selectedSpecs,
          reference_contacts: [
            { name: form.ref1Name, phone: form.ref1Phone, relation: form.ref1Relation },
            { name: form.ref2Name, phone: form.ref2Phone, relation: form.ref2Relation },
          ],
          dbs_consent: form.dbsConsent,
          availability: { days: form.selectedDays, hours: form.hours },
          bank_sort_code: form.sortCode || null, bank_account_number: form.accountNumber || null,
          agreed_terms: form.agreedTerms,
        });
        if (error) throw error;
        setSubmitted(true);
        toast.success("Brilliant! We'll review your application shortly.");
      } catch (err: any) {
        toast.error('Failed to submit application');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const prev = () => { if (step > 0) setStep(step - 1); };
  const progress = ((step + 1) / steps.length) * 100;

  const inputClass = "h-12 rounded-xl border-border bg-background focus-visible:ring-primary/30";

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-background">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="text-center">
          <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-5">
            <CircleCheck className="h-12 w-12 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-display font-black text-foreground mb-2">Application Submitted!</h2>
          <p className="text-muted-foreground mb-8">Brilliant! We'll have a proper gander at your application and get back to you within 48 hours.</p>
          <Button onClick={() => navigate('/enrol/status')} className="bg-primary text-primary-foreground rounded-2xl h-12 px-8 font-semibold">
            Track Application
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header with image */}
      <div className="relative h-44 overflow-hidden">
        <img src={cleanerPortrait} alt="Join Clean Fit" className="w-full h-full object-cover" loading="lazy" width={640} height={640} />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 to-foreground/90" />
        <div className="absolute inset-0 px-5 pt-6 pb-4 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => step > 0 ? prev() : navigate('/')} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <ArrowLeft className="h-4 w-4 text-white" strokeWidth={1.5} />
            </button>
            <span className="font-display font-bold text-white">Join Clean Fit</span>
          </div>
          <div>
            {(() => { const StepIcon = steps[step].icon; return (
            <div className="flex items-center gap-2 mb-2">
              <StepIcon className="h-4 w-4 text-primary" strokeWidth={1.5} />
              <span className="text-white text-sm font-semibold">{steps[step].title}</span>
            </div>
            ); })()}
            <p className="text-white/50 text-xs mb-3">{steps[step].desc}</p>
            {/* Progress bar */}
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="h-full bg-primary rounded-full"
              />
            </div>
            <p className="text-white/40 text-[10px] mt-1.5">Step {step + 1} of {steps.length}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={step} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="space-y-4">
            {step === 0 && (
              <>
                <Input placeholder="Full name" value={form.fullName} onChange={e => updateForm('fullName', e.target.value)} className={inputClass} />
                <Input placeholder="Date of birth (DD/MM/YYYY)" value={form.dob} onChange={e => updateForm('dob', e.target.value)} className={inputClass} />
                <Input placeholder="Mobile number" inputMode="numeric" maxLength={10} value={form.phone} onChange={e => updateForm('phone', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))} className={inputClass} />
                <Input placeholder="Email address" type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} className={inputClass} />
                <Input placeholder="Postcode" value={form.postcode} onChange={e => updateForm('postcode', e.target.value)} className={inputClass} />
                <Input placeholder="Right to work status" value={form.rightToWork} onChange={e => updateForm('rightToWork', e.target.value)} className={inputClass} />
              </>
            )}
            {step === 1 && (
              <>
                <p className="text-sm text-muted-foreground">Select your ID type</p>
                <div className="space-y-2">
                  {['Passport', 'Driving Licence', 'BRP Card'].map(t => (
                    <motion.button
                      key={t}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateForm('idType', t)}
                      className={`w-full border rounded-2xl p-4 flex items-center justify-between transition-all duration-200 ${
                        form.idType === t ? 'border-primary bg-accent' : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <span className="font-medium text-foreground text-sm">{t}</span>
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        form.idType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {form.idType === t ? 'Selected' : 'Select'}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <Input placeholder="Years of cleaning experience" type="number" value={form.experience || ''} onChange={e => updateForm('experience', parseInt(e.target.value) || 0)} className={inputClass} />
                <p className="text-xs font-bold text-muted-foreground mt-2 mb-1">Specialisations (select all that apply)</p>
                <div className="flex flex-wrap gap-2">
                  {allServices.map(svc => (
                    <motion.button key={svc.id} whileTap={{ scale: 0.95 }}
                      onClick={() => updateForm('selectedSpecs', form.selectedSpecs.includes(svc.name) ? form.selectedSpecs.filter((s: string) => s !== svc.name) : [...form.selectedSpecs, svc.name])}
                      className={`px-4 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        form.selectedSpecs.includes(svc.name) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/30'
                      }`}>
                      {form.selectedSpecs.includes(svc.name) && <Check className="h-3 w-3" />}
                      {svc.name}
                    </motion.button>
                  ))}
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <p className="text-sm text-muted-foreground mb-2">Please provide 2 professional references</p>
                {[1, 2].map(n => (
                  <div key={n} className="border border-border rounded-2xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-foreground">Reference {n}</p>
                    <Input placeholder="Full name" value={n === 1 ? form.ref1Name : form.ref2Name} onChange={e => updateForm(n === 1 ? 'ref1Name' : 'ref2Name', e.target.value)} className={inputClass} />
                    <Input placeholder="Phone number" maxLength={10} inputMode="numeric" value={n === 1 ? form.ref1Phone : form.ref2Phone} onChange={e => updateForm(n === 1 ? 'ref1Phone' : 'ref2Phone', e.target.value)} className={inputClass} />
                    <Input placeholder="Relationship" value={n === 1 ? form.ref1Relation : form.ref2Relation} onChange={e => updateForm(n === 1 ? 'ref1Relation' : 'ref2Relation', e.target.value)} className={inputClass} />
                  </div>
                ))}
              </>
            )}
            {step === 4 && (
              <div className="border border-border rounded-2xl p-5">
                <ShieldCheck className="h-8 w-8 text-primary mb-3" strokeWidth={1.5} />
                <h3 className="font-display font-bold text-foreground mb-2">DBS Check Consent</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  A Disclosure and Barring Service (DBS) check is required for all Clean Fit professionals. This keeps everyone safe — proper due diligence, innit?
                </p>
                <div className="flex items-start gap-3">
                  <Checkbox id="dbs" checked={form.dbsConsent} onCheckedChange={v => updateForm('dbsConsent', !!v)} />
                  <label htmlFor="dbs" className="text-sm text-foreground leading-relaxed">I consent to a DBS check and confirm all information is accurate.</label>
                </div>
              </div>
            )}
            {step === 5 && (
              <>
                <p className="text-sm text-muted-foreground mb-2">Select your preferred working days</p>
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <motion.button
                      key={d}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleDay(d)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                        form.selectedDays.includes(d) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {d}
                    </motion.button>
                  ))}
                </div>
                <Input placeholder="Preferred hours (e.g. 08:00-18:00)" value={form.hours} onChange={e => updateForm('hours', e.target.value)} className={inputClass} />
              </>
            )}
            {step === 6 && (
              <>
                <p className="text-sm text-muted-foreground mb-2">For payment — securely stored 🔒</p>
                <Input placeholder="Sort code (XX-XX-XX)" value={form.sortCode} onChange={e => updateForm('sortCode', e.target.value)} className={inputClass} />
                <Input placeholder="Account number (8 digits)" maxLength={8} inputMode="numeric" value={form.accountNumber} onChange={e => updateForm('accountNumber', e.target.value)} className={inputClass} />
                <Input placeholder="Account holder name" value={form.accountHolder} onChange={e => updateForm('accountHolder', e.target.value)} className={inputClass} />
              </>
            )}
            {step === 7 && (
              <div className="border border-border rounded-2xl p-5 space-y-5">
                <div className="flex items-start gap-3">
                  <Checkbox id="terms" checked={form.agreedTerms} onCheckedChange={v => updateForm('agreedTerms', !!v)} />
                  <label htmlFor="terms" className="text-sm text-foreground leading-relaxed">I agree to the Clean Fit Terms of Service and Code of Conduct</label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox id="data" checked={form.agreedData} onCheckedChange={v => updateForm('agreedData', !!v)} />
                  <label htmlFor="data" className="text-sm text-foreground leading-relaxed">I consent to the processing of my personal data in accordance with UK GDPR</label>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button variant="outline" onClick={prev} className="h-12 rounded-2xl px-6 border-border">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          )}
          <Button onClick={next} disabled={submitting} className="flex-1 h-12 bg-primary text-primary-foreground rounded-2xl font-semibold transition-opacity hover:bg-primary/90 disabled:opacity-50">
            {submitting ? 'Submitting...' : step < steps.length - 1 ? (
              <>Next <ArrowRight className="h-4 w-4 ml-1" strokeWidth={1.5} /></>
            ) : 'Submit Application'}
          </Button>
        </div>
      </div>
    </div>
  );
}
