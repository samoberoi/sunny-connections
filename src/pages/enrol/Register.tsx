import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CircleCheck, User, FileText, Briefcase, Users, ShieldCheck, Clock, CreditCard, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import BackButton from '@/components/BackButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const steps = [
  { title: 'Personal Details', icon: User },
  { title: 'Identity', icon: FileText },
  { title: 'Experience', icon: Briefcase },
  { title: 'References', icon: Users },
  { title: 'DBS Check', icon: ShieldCheck },
  { title: 'Availability', icon: Clock },
  { title: 'Bank Details', icon: CreditCard },
  { title: 'Agreement', icon: FileCheck },
];

interface FormData {
  fullName: string;
  dob: string;
  phone: string;
  email: string;
  postcode: string;
  rightToWork: string;
  idType: string;
  experience: number;
  specialisations: string;
  ref1Name: string;
  ref1Phone: string;
  ref1Relation: string;
  ref2Name: string;
  ref2Phone: string;
  ref2Relation: string;
  dbsConsent: boolean;
  selectedDays: string[];
  hours: string;
  sortCode: string;
  accountNumber: string;
  accountHolder: string;
  agreedTerms: boolean;
  agreedData: boolean;
}

export default function Register() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState<FormData>({
    fullName: '', dob: '', phone: '', email: '', postcode: '', rightToWork: '', idType: 'Passport',
    experience: 0, specialisations: '',
    ref1Name: '', ref1Phone: '', ref1Relation: '',
    ref2Name: '', ref2Phone: '', ref2Relation: '',
    dbsConsent: false, selectedDays: [], hours: '',
    sortCode: '', accountNumber: '', accountHolder: '',
    agreedTerms: false, agreedData: false,
  });

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
      // Submit to database
      setSubmitting(true);
      try {
        const { error } = await supabase.from('enrolment_applications').insert({
          user_id: user?.id || null,
          full_name: form.fullName,
          dob: form.dob || '2000-01-01',
          phone: form.phone,
          email: form.email,
          postcode: form.postcode,
          right_to_work: form.rightToWork || 'UK Citizen',
          id_type: form.idType,
          experience: form.experience,
          specialisations: form.specialisations.split(',').map(s => s.trim()).filter(Boolean),
          reference_contacts: [
            { name: form.ref1Name, phone: form.ref1Phone, relation: form.ref1Relation },
            { name: form.ref2Name, phone: form.ref2Phone, relation: form.ref2Relation },
          ],
          dbs_consent: form.dbsConsent,
          availability: { days: form.selectedDays, hours: form.hours },
          bank_sort_code: form.sortCode || null,
          bank_account_number: form.accountNumber || null,
          agreed_terms: form.agreedTerms,
        });
        if (error) throw error;
        setSubmitted(true);
        toast.success("Brilliant! We'll have a proper gander at your application.");
      } catch (err: any) {
        toast.error('Failed to submit application');
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const prev = () => { if (step > 0) setStep(step - 1); };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-background">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="text-center">
          <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-5">
            <CircleCheck className="h-12 w-12 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
          <p className="text-muted-foreground mb-8">Brilliant! We'll have a proper gander at your application and get back to you within 48 hours.</p>
          <Button onClick={() => navigate('/enrol/status')} className="gradient-blue text-primary-foreground rounded-2xl shadow-blue h-12 px-8">Track Application</Button>
        </motion.div>
      </div>
    );
  }

  const inputClass = "h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-primary/30";

  const slideVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero px-5 pt-6 pb-10 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => step > 0 ? prev() : navigate('/')} className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
            <ChevronLeftIcon />
          </button>
          <span className="font-bold text-primary-foreground">Join <span className="opacity-80">Clean Fit</span></span>
        </div>
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${i <= step ? 'bg-primary-foreground' : 'bg-primary-foreground/20'}`} />
          ))}
        </div>
        <p className="text-primary-foreground/60 text-xs mt-2">Step {step + 1} of {steps.length}: {steps[step].title}</p>
      </div>

      <div className="px-5 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={step} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-4">
            {step === 0 && (
              <>
                <h2 className="text-lg font-bold text-foreground">Personal Details</h2>
                <Input placeholder="Full name" value={form.fullName} onChange={e => updateForm('fullName', e.target.value)} className={inputClass} />
                <Input placeholder="Date of birth (DD/MM/YYYY)" value={form.dob} onChange={e => updateForm('dob', e.target.value)} className={inputClass} />
                <Input placeholder="Mobile number (07...)" inputMode="numeric" maxLength={11} value={form.phone} onChange={e => updateForm('phone', e.target.value.replace(/[^0-9]/g, '').slice(0, 11))} className={inputClass} />
                <Input placeholder="Email address" type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} className={inputClass} />
                <Input placeholder="Postcode" value={form.postcode} onChange={e => updateForm('postcode', e.target.value)} className={inputClass} />
                <Input placeholder="Right to work status" value={form.rightToWork} onChange={e => updateForm('rightToWork', e.target.value)} className={inputClass} />
              </>
            )}
            {step === 1 && (
              <>
                <h2 className="text-lg font-bold text-foreground">Identity Verification</h2>
                <p className="text-sm text-muted-foreground">Select your ID type</p>
                {['Passport', 'Driving Licence', 'BRP Card'].map(t => (
                  <motion.button
                    key={t}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => updateForm('idType', t)}
                    className={`w-full glass-card rounded-2xl p-4 flex items-center justify-between transition-shadow ${
                      form.idType === t ? 'ring-2 ring-primary shadow-blue/20' : 'hover:shadow-apple-lg'
                    }`}
                  >
                    <span className="font-medium text-foreground text-sm">{t}</span>
                    <div className={`px-4 py-2 rounded-xl text-xs font-semibold ${form.idType === t ? 'gradient-blue text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
                      {form.idType === t ? 'Selected' : 'Select'}
                    </div>
                  </motion.button>
                ))}
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="text-lg font-bold text-foreground">Experience</h2>
                <Input placeholder="Years of cleaning experience" type="number" value={form.experience || ''} onChange={e => updateForm('experience', parseInt(e.target.value) || 0)} className={inputClass} />
                <Input placeholder="Specialisations (comma separated)" value={form.specialisations} onChange={e => updateForm('specialisations', e.target.value)} className={inputClass} />
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="text-lg font-bold text-foreground">Professional References</h2>
                <p className="text-sm text-muted-foreground">Please provide 2 references</p>
                {[1, 2].map(n => (
                  <div key={n} className="glass-card rounded-2xl p-4 space-y-3 shadow-apple">
                    <p className="text-sm font-semibold text-foreground">Reference {n}</p>
                    <Input placeholder="Full name" value={n === 1 ? form.ref1Name : form.ref2Name} onChange={e => updateForm(n === 1 ? 'ref1Name' : 'ref2Name', e.target.value)} className={inputClass} />
                    <Input placeholder="Phone number" maxLength={11} inputMode="numeric" value={n === 1 ? form.ref1Phone : form.ref2Phone} onChange={e => updateForm(n === 1 ? 'ref1Phone' : 'ref2Phone', e.target.value)} className={inputClass} />
                    <Input placeholder="Relationship" value={n === 1 ? form.ref1Relation : form.ref2Relation} onChange={e => updateForm(n === 1 ? 'ref1Relation' : 'ref2Relation', e.target.value)} className={inputClass} />
                  </div>
                ))}
              </>
            )}
            {step === 4 && (
              <>
                <h2 className="text-lg font-bold text-foreground">DBS Check Consent</h2>
                <div className="glass-card rounded-2xl p-5 shadow-apple">
                  <p className="text-sm text-muted-foreground mb-5">
                    A Disclosure and Barring Service (DBS) check is required for all Clean Fit professionals.
                    By consenting, you authorise us to process a basic DBS check on your behalf.
                  </p>
                  <div className="flex items-start gap-3">
                    <Checkbox id="dbs" checked={form.dbsConsent} onCheckedChange={v => updateForm('dbsConsent', !!v)} />
                    <label htmlFor="dbs" className="text-sm text-foreground">I consent to a DBS check and confirm all information is accurate.</label>
                  </div>
                </div>
              </>
            )}
            {step === 5 && (
              <>
                <h2 className="text-lg font-bold text-foreground">Availability</h2>
                <p className="text-sm text-muted-foreground">Select your preferred working days</p>
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <motion.button
                      key={d}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleDay(d)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        form.selectedDays.includes(d) ? 'gradient-blue text-primary-foreground shadow-blue/30' : 'bg-muted text-muted-foreground'
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
                <h2 className="text-lg font-bold text-foreground">Bank Details</h2>
                <p className="text-sm text-muted-foreground">For payment — securely stored</p>
                <Input placeholder="Sort code (XX-XX-XX)" value={form.sortCode} onChange={e => updateForm('sortCode', e.target.value)} className={inputClass} />
                <Input placeholder="Account number (8 digits)" maxLength={8} inputMode="numeric" value={form.accountNumber} onChange={e => updateForm('accountNumber', e.target.value)} className={inputClass} />
                <Input placeholder="Account holder name" value={form.accountHolder} onChange={e => updateForm('accountHolder', e.target.value)} className={inputClass} />
              </>
            )}
            {step === 7 && (
              <>
                <h2 className="text-lg font-bold text-foreground">Terms & Agreement</h2>
                <div className="glass-card rounded-2xl p-5 space-y-4 shadow-apple">
                  <div className="flex items-start gap-3">
                    <Checkbox id="terms" checked={form.agreedTerms} onCheckedChange={v => updateForm('agreedTerms', !!v)} />
                    <label htmlFor="terms" className="text-sm text-foreground">I agree to the Clean Fit Terms of Service and Code of Conduct</label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox id="data" checked={form.agreedData} onCheckedChange={v => updateForm('agreedData', !!v)} />
                    <label htmlFor="data" className="text-sm text-foreground">I consent to the processing of my personal data in accordance with UK GDPR</label>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-8">
          {step > 0 && <Button variant="outline" onClick={prev} className="flex-1 h-12 rounded-2xl">Back</Button>}
          <Button onClick={next} disabled={submitting} className="flex-1 h-12 gradient-blue text-primary-foreground rounded-2xl shadow-blue font-semibold transition-opacity hover:opacity-95 disabled:opacity-50">
            {submitting ? 'Submitting...' : step < steps.length - 1 ? <>Next <ArrowRight className="h-4 w-4 ml-1" strokeWidth={1.5} /></> : 'Submit Application'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"><path d="m15 18-6-6 6-6"/></svg>
  );
}
