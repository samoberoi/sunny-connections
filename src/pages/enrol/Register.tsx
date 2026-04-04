import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CircleCheck, User, FileText, Briefcase, Users, ShieldCheck, Clock, CreditCard, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import BackButton from '@/components/BackButton';

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

export default function Register() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const next = () => { if (step < steps.length - 1) setStep(step + 1); else setSubmitted(true); };
  const prev = () => { if (step > 0) setStep(step - 1); };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-background">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="text-center">
          <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-5">
            <CircleCheck className="h-12 w-12 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
          <p className="text-muted-foreground mb-8">We'll review your application and get back to you within 48 hours.</p>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span className="font-bold text-primary-foreground">Join <span className="opacity-80">Cleanfit</span></span>
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
                <Input placeholder="Full name" className={inputClass} />
                <Input placeholder="Date of birth (DD/MM/YYYY)" className={inputClass} />
                <Input placeholder="Mobile number (07...)" inputMode="numeric" maxLength={11} className={inputClass} />
                <Input placeholder="Email address" type="email" className={inputClass} />
                <Input placeholder="Postcode" className={inputClass} />
                <Input placeholder="Right to work status" className={inputClass} />
              </>
            )}
            {step === 1 && (
              <>
                <h2 className="text-lg font-bold text-foreground">Identity Verification</h2>
                <p className="text-sm text-muted-foreground">Upload a valid form of ID</p>
                {['Passport', 'Driving Licence', 'BRP Card'].map(t => (
                  <div key={t} className="glass-card rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:shadow-apple-lg transition-shadow">
                    <span className="font-medium text-foreground text-sm">{t}</span>
                    <div className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold">Upload</div>
                  </div>
                ))}
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="text-lg font-bold text-foreground">Experience</h2>
                <Input placeholder="Years of cleaning experience" type="number" className={inputClass} />
                <Input placeholder="Previous employer(s)" className={inputClass} />
                <Input placeholder="Specialisations" className={inputClass} />
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="text-lg font-bold text-foreground">Professional References</h2>
                <p className="text-sm text-muted-foreground">Please provide 2 references</p>
                {[1, 2].map(n => (
                  <div key={n} className="glass-card rounded-2xl p-4 space-y-3 shadow-apple">
                    <p className="text-sm font-semibold text-foreground">Reference {n}</p>
                    <Input placeholder="Full name" className={inputClass} />
                    <Input placeholder="Phone number" maxLength={11} inputMode="numeric" className={inputClass} />
                    <Input placeholder="Relationship" className={inputClass} />
                  </div>
                ))}
              </>
            )}
            {step === 4 && (
              <>
                <h2 className="text-lg font-bold text-foreground">DBS Check Consent</h2>
                <div className="glass-card rounded-2xl p-5 shadow-apple">
                  <p className="text-sm text-muted-foreground mb-5">
                    A Disclosure and Barring Service (DBS) check is required for all Cleanfit professionals.
                    By consenting, you authorise us to process a basic DBS check on your behalf.
                  </p>
                  <div className="flex items-start gap-3">
                    <Checkbox id="dbs" />
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
                    <button key={d} className="px-5 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                      {d}
                    </button>
                  ))}
                </div>
                <Input placeholder="Preferred hours (e.g. 08:00-18:00)" className={inputClass} />
                <Input placeholder="Maximum travel radius (miles)" type="number" className={inputClass} />
              </>
            )}
            {step === 6 && (
              <>
                <h2 className="text-lg font-bold text-foreground">Bank Details</h2>
                <p className="text-sm text-muted-foreground">For payment — securely stored</p>
                <Input placeholder="Sort code (XX-XX-XX)" className={inputClass} />
                <Input placeholder="Account number (8 digits)" maxLength={8} inputMode="numeric" className={inputClass} />
                <Input placeholder="Account holder name" className={inputClass} />
              </>
            )}
            {step === 7 && (
              <>
                <h2 className="text-lg font-bold text-foreground">Terms & Agreement</h2>
                <div className="glass-card rounded-2xl p-5 space-y-4 shadow-apple">
                  <div className="flex items-start gap-3">
                    <Checkbox id="terms" />
                    <label htmlFor="terms" className="text-sm text-foreground">I agree to the Cleanfit Terms of Service and Code of Conduct</label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox id="data" />
                    <label htmlFor="data" className="text-sm text-foreground">I consent to the processing of my personal data in accordance with UK GDPR</label>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-8">
          {step > 0 && <Button variant="outline" onClick={prev} className="flex-1 h-12 rounded-2xl">Back</Button>}
          <Button onClick={next} className="flex-1 h-12 gradient-blue text-primary-foreground rounded-2xl shadow-blue font-semibold transition-opacity hover:opacity-95">
            {step < steps.length - 1 ? <>Next <ArrowRight className="h-4 w-4 ml-1" strokeWidth={1.5} /></> : 'Submit Application'}
          </Button>
        </div>
      </div>
    </div>
  );
}
