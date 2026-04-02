import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Leaf, User, FileText, Briefcase, Users, Shield, Clock, CreditCard, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const steps = [
  { title: 'Personal Details', icon: User },
  { title: 'Identity', icon: FileText },
  { title: 'Experience', icon: Briefcase },
  { title: 'References', icon: Users },
  { title: 'DBS Check', icon: Shield },
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
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <CheckCircle className="h-20 w-20 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
          <p className="text-muted-foreground mb-6">We'll review your application and get back to you within 48 hours.</p>
          <Button onClick={() => navigate('/enrol/status')} className="gradient-primary text-primary-foreground">Track Application</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero px-6 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => step > 0 ? prev() : navigate('/')} className="p-2 rounded-lg bg-primary-foreground/10"><ArrowLeft className="h-4 w-4 text-primary-foreground" /></button>
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-secondary" />
            <span className="font-display font-bold text-primary-foreground">Join Indiana Green</span>
          </div>
        </div>
        {/* Progress */}
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? 'bg-secondary' : 'bg-primary-foreground/20'}`} />
          ))}
        </div>
        <p className="text-primary-foreground/70 text-xs mt-2">Step {step + 1} of {steps.length}: {steps[step].title}</p>
      </div>

      <div className="px-6 py-6">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {step === 0 && (
            <>
              <h2 className="font-display text-lg font-semibold text-foreground">Personal Details</h2>
              <Input placeholder="Full name" />
              <Input placeholder="Date of birth (DD/MM/YYYY)" />
              <Input placeholder="Mobile number (+44...)" />
              <Input placeholder="Email address" type="email" />
              <Input placeholder="Postcode" />
              <Input placeholder="Right to work status (e.g. British Citizen, Settled Status)" />
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="font-display text-lg font-semibold text-foreground">Identity Verification</h2>
              <p className="text-sm text-muted-foreground">Upload a valid form of ID</p>
              <div className="space-y-3">
                {['Passport', 'Driving Licence', 'BRP Card'].map(t => (
                  <div key={t} className="glass-card rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-accent/50">
                    <span className="text-foreground">{t}</span>
                    <div className="w-24 h-8 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">Upload</div>
                  </div>
                ))}
              </div>
              <Input placeholder="Proof of address (utility bill / bank statement)" />
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="font-display text-lg font-semibold text-foreground">Experience</h2>
              <Input placeholder="Years of cleaning experience" type="number" />
              <Input placeholder="Previous employer(s)" />
              <Input placeholder="Specialisations (e.g. Deep Cleaning, Laundry)" />
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="font-display text-lg font-semibold text-foreground">Professional References</h2>
              <p className="text-sm text-muted-foreground">Please provide 2 references</p>
              {[1, 2].map(n => (
                <div key={n} className="glass-card rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">Reference {n}</p>
                  <Input placeholder="Full name" />
                  <Input placeholder="Phone number" />
                  <Input placeholder="Relationship (e.g. Previous Employer)" />
                </div>
              ))}
            </>
          )}
          {step === 4 && (
            <>
              <h2 className="font-display text-lg font-semibold text-foreground">DBS Check Consent</h2>
              <div className="glass-card rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  A Disclosure and Barring Service (DBS) check is required for all Indiana Green professionals. 
                  By consenting, you authorise us to process a basic DBS check on your behalf.
                </p>
                <div className="flex items-start gap-3">
                  <Checkbox id="dbs" />
                  <label htmlFor="dbs" className="text-sm text-foreground">
                    I consent to a DBS check being carried out and confirm all information provided is accurate.
                  </label>
                </div>
              </div>
            </>
          )}
          {step === 5 && (
            <>
              <h2 className="font-display text-lg font-semibold text-foreground">Availability</h2>
              <p className="text-sm text-muted-foreground">Select your preferred working days</p>
              <div className="flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <button key={d} className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-primary hover:text-primary-foreground transition-colors">
                    {d}
                  </button>
                ))}
              </div>
              <Input placeholder="Preferred hours (e.g. 08:00 - 18:00)" />
              <Input placeholder="Maximum travel radius (miles)" type="number" />
            </>
          )}
          {step === 6 && (
            <>
              <h2 className="font-display text-lg font-semibold text-foreground">Bank Details</h2>
              <p className="text-sm text-muted-foreground">For payment — securely stored</p>
              <Input placeholder="Sort code (XX-XX-XX)" />
              <Input placeholder="Account number (8 digits)" />
              <Input placeholder="Account holder name" />
            </>
          )}
          {step === 7 && (
            <>
              <h2 className="font-display text-lg font-semibold text-foreground">Terms & Agreement</h2>
              <div className="glass-card rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox id="terms" />
                  <label htmlFor="terms" className="text-sm text-foreground">
                    I agree to the Indiana Green Terms of Service and Code of Conduct
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox id="data" />
                  <label htmlFor="data" className="text-sm text-foreground">
                    I consent to the processing of my personal data in accordance with UK GDPR
                  </label>
                </div>
              </div>
            </>
          )}
        </motion.div>

        <div className="flex gap-3 mt-8">
          {step > 0 && <Button variant="outline" onClick={prev} className="flex-1">Back</Button>}
          <Button onClick={next} className="flex-1 gradient-primary text-primary-foreground">
            {step < steps.length - 1 ? <>Next <ArrowRight className="h-4 w-4 ml-1" /></> : 'Submit Application'}
          </Button>
        </div>
      </div>
    </div>
  );
}
