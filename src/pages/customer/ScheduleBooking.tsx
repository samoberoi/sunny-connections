import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Home, Clock, MapPin, CalendarDays, Repeat, ChevronLeft, ChevronRight,
  UtensilsCrossed, ShowerHead, Sofa, Trash2, Wind, WashingMachine, Bed, Shirt,
  Brush, CheckCircle2, StickyNote, Building2, Landmark, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Category = 'cleaning' | 'housekeeping';

const serviceOptions: Record<Category, { id: string; icon: any; name: string; pricePerHour: number }[]> = {
  cleaning: [
    { id: 'kitchen', icon: UtensilsCrossed, name: 'Kitchen Cleaning', pricePerHour: 18 },
    { id: 'bathroom', icon: ShowerHead, name: 'Bathroom Cleaning', pricePerHour: 16 },
    { id: 'living', icon: Sofa, name: 'Living Room', pricePerHour: 14 },
    { id: 'bedroom', icon: Bed, name: 'Bedroom Cleaning', pricePerHour: 14 },
    { id: 'dusting', icon: Wind, name: 'Dusting & Surfaces', pricePerHour: 12 },
    { id: 'trash', icon: Trash2, name: 'Trash & Recycling', pricePerHour: 8 },
    { id: 'deep', icon: Sparkles, name: 'Deep Scrub & Sanitise', pricePerHour: 22 },
  ],
  housekeeping: [
    { id: 'laundry', icon: WashingMachine, name: 'Laundry & Folding', pricePerHour: 15 },
    { id: 'ironing', icon: Shirt, name: 'Ironing', pricePerHour: 14 },
    { id: 'bedmaking', icon: Bed, name: 'Bed Making & Linen Change', pricePerHour: 10 },
    { id: 'organise', icon: Brush, name: 'Organise & Declutter', pricePerHour: 16 },
    { id: 'freshen', icon: Wind, name: 'Air & Freshen Rooms', pricePerHour: 8 },
  ],
};

const frequencies = [
  { value: 'none' as const, label: 'One-time', desc: 'Single visit' },
  { value: 'weekly' as const, label: 'Weekly', desc: 'Every week', discount: 15 },
  { value: 'fortnightly' as const, label: 'Fortnightly', desc: 'Every 2 weeks', discount: 10 },
  { value: 'monthly' as const, label: 'Monthly', desc: 'Once a month', discount: 5 },
];

const timeSlots = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

const propertyTypes = [
  { value: 'flat', label: 'Flat', icon: Building2 },
  { value: 'house', label: 'House', icon: Home },
  { value: 'office', label: 'Office', icon: Landmark },
];

export default function ScheduleBooking() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [recurring, setRecurring] = useState<'none' | 'weekly' | 'fortnightly' | 'monthly'>('none');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(2);
  const [propertyType, setPropertyType] = useState('house');
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalSteps = 5;

  const toggleService = (id: string) => {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const allServices = [...serviceOptions.cleaning, ...serviceOptions.housekeeping];
  const selectedServiceDetails = allServices.filter(s => selectedServices.includes(s.id));
  const baseRate = selectedServiceDetails.reduce((sum, s) => sum + s.pricePerHour, 0);
  const freq = frequencies.find(f => f.value === recurring);
  const discount = freq?.discount || 0;
  const totalCost = Math.round(baseRate * duration * (1 - discount / 100));
  const selectedNames = selectedServiceDetails.map(s => s.name).join(', ');

  const canAdvance = () => {
    switch (step) {
      case 1: return category !== null && selectedServices.length > 0;
      case 2: return !!recurring;
      case 3: return !!date && !!time;
      case 4: return !!address && !!postcode;
      case 5: return true;
      default: return false;
    }
  };

  const handleBook = async () => {
    if (!user || !date || !address || !postcode) return;
    setSubmitting(true);
    try {
      const { data: services } = await supabase.from('services').select('id').limit(1);
      const serviceId = services?.[0]?.id;
      if (!serviceId) { toast.error('No services available'); setSubmitting(false); return; }

      const { data: booking, error } = await supabase.from('bookings').insert({
        customer_id: user.id,
        customer_name: user.name,
        service_id: serviceId,
        service_name: `Scheduled: ${selectedNames}`,
        date: date.toISOString().split('T')[0],
        time,
        duration,
        recurring,
        address_line1: address,
        address_postcode: postcode,
        address_city: 'London',
        total_cost: totalCost,
        property_type: propertyType,
        notes: notes || null,
      }).select().single();

      if (error) throw error;

      navigate('/searching-cleaner', {
        state: {
          bookingId: booking.id,
          service: { name: `Scheduled: ${selectedNames}` },
          date: date.toISOString(),
          time,
          duration,
          recurring,
          address,
          postcode,
          totalCost,
          otp: booking.otp,
        },
      });
    } catch {
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fadeVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-28">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            {step === 1 ? <BackButton /> : (
              <button onClick={() => setStep(s => s - 1)} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
                <ChevronLeft className="h-4 w-4 text-foreground" strokeWidth={1.5} />
              </button>
            )}
            <h1 className="text-xl font-display font-black text-foreground">Schedule Cleaning</h1>
          </div>

          {/* Progress bar */}
          <div className="flex gap-1.5 mb-6 ml-12">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < step ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Category + Services */}
            {step === 1 && (
              <motion.div key="step1" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                {!category ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground mb-3">What do you need?</p>
                    {([
                      { key: 'cleaning' as Category, icon: Sparkles, label: 'House Cleaning', desc: 'Kitchen, bathroom, dusting, deep clean & more' },
                      { key: 'housekeeping' as Category, icon: Bed, label: 'Housekeeping', desc: 'Laundry, ironing, bed making & organising' },
                    ]).map((cat, i) => (
                      <motion.button
                        key={cat.key}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCategory(cat.key)}
                        className="w-full text-left bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 transition-all shadow-soft"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                          <cat.icon className="h-6 w-6 text-foreground" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-bold text-foreground">{cat.label}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{cat.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                      </motion.button>
                    ))}

                    {selectedServices.length > 0 && (
                      <div className="mt-4 p-3 bg-accent rounded-xl">
                        <p className="text-xs text-muted-foreground mb-1">Selected ({selectedServices.length})</p>
                        <p className="text-sm font-semibold text-foreground">{selectedNames}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <button onClick={() => setCategory(null)} className="text-xs text-primary font-semibold mb-3 flex items-center gap-1 hover:underline">
                      ← Back to categories
                    </button>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      {category === 'cleaning' ? '🧹 House Cleaning' : '🏠 Housekeeping'}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">Select all services you need (multi-select)</p>

                    <div className="space-y-2">
                      {serviceOptions[category].map((svc, i) => {
                        const isSelected = selectedServices.includes(svc.id);
                        return (
                          <motion.button
                            key={svc.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleService(svc.id)}
                            className={`w-full text-left border rounded-2xl p-4 flex items-center gap-3 transition-all duration-200 shadow-soft ${
                              isSelected ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border bg-card hover:border-primary/20'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-foreground'
                            }`}>
                              <svc.icon className="h-4 w-4" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-foreground text-sm">{svc.name}</h4>
                              <p className="text-[10px] text-muted-foreground">£{svc.pricePerHour}/hr</p>
                            </div>
                            {isSelected && <CheckCircle2 className="h-5 w-5 text-foreground shrink-0" strokeWidth={1.5} />}
                          </motion.button>
                        );
                      })}
                    </div>

                    {selectedServices.length > 0 && (
                      <div className="mt-4 p-3 bg-accent rounded-xl">
                        <p className="text-xs text-muted-foreground mb-1">Selected ({selectedServices.length})</p>
                        <p className="text-sm font-semibold text-foreground">{selectedNames}</p>
                        <p className="text-xs text-primary font-medium mt-1">Base rate: £{baseRate}/hr</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Frequency + Duration */}
            {step === 2 && (
              <motion.div key="step2" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <section className="mb-6">
                  <h3 className="font-display font-semibold mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <Repeat className="h-3.5 w-3.5" strokeWidth={1.5} /> How Often?
                  </h3>
                  <div className="space-y-2">
                    {frequencies.map(f => (
                      <motion.button
                        key={f.value}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setRecurring(f.value)}
                        className={`w-full text-left border rounded-2xl p-4 flex items-center justify-between transition-all duration-200 shadow-soft ${
                          recurring === f.value ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border bg-card hover:border-primary/20'
                        }`}
                      >
                        <div>
                          <h4 className="font-bold text-foreground text-sm">{f.label}</h4>
                          <p className="text-xs text-muted-foreground">{f.desc}</p>
                        </div>
                        {f.discount && (
                          <span className="text-xs font-bold text-primary-foreground bg-foreground px-2.5 py-1 rounded-full">
                            {f.discount}% off
                          </span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="font-display font-semibold mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" strokeWidth={1.5} /> Duration
                  </h3>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5, 6].map(d => (
                      <motion.button key={d} whileTap={{ scale: 0.97 }} onClick={() => setDuration(d)}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${
                          duration === d ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground hover:border-foreground/30'
                        }`}>
                        {d}h
                      </motion.button>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <motion.div key="step3" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <section className="mb-6">
                  <h3 className="font-display font-semibold mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} /> Select Date
                  </h3>
                  <div className="border border-border rounded-2xl p-3">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                      className={cn("mx-auto pointer-events-auto")}
                    />
                  </div>
                </section>

                <section>
                  <h3 className="font-display font-semibold mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" strokeWidth={1.5} /> Preferred Time
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map(t => (
                      <motion.button key={t} whileTap={{ scale: 0.97 }} onClick={() => setTime(t)}
                        className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                          time === t ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground hover:border-foreground/30'
                        }`}>
                        {t}
                      </motion.button>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {/* Step 4: Address */}
            {step === 4 && (
              <motion.div key="step4" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <section className="mb-6">
                  <h3 className="font-display font-semibold mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <Home className="h-3.5 w-3.5" strokeWidth={1.5} /> Property Type
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {propertyTypes.map(pt => (
                      <motion.button key={pt.value} whileTap={{ scale: 0.97 }} onClick={() => setPropertyType(pt.value)}
                        className={`py-4 rounded-xl text-sm font-bold flex flex-col items-center gap-2 border transition-all ${
                          propertyType === pt.value ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground hover:border-foreground/30'
                        }`}>
                        <pt.icon className="h-5 w-5" strokeWidth={1.5} />
                        {pt.label}
                      </motion.button>
                    ))}
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="font-display font-semibold mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} /> Your Address
                  </h3>
                  <div className="space-y-2">
                    <Input placeholder="Postcode (e.g. SW1A 1AA)" value={postcode} onChange={e => setPostcode(e.target.value)} className="h-12 rounded-2xl border-2 border-border bg-card focus-visible:ring-primary/30 focus-visible:border-primary" />
                    <Input placeholder="Address line" value={address} onChange={e => setAddress(e.target.value)} className="h-12 rounded-2xl border-2 border-border bg-card focus-visible:ring-primary/30 focus-visible:border-primary" />
                  </div>
                </section>

                <section>
                  <h3 className="font-display font-semibold mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <StickyNote className="h-3.5 w-3.5" strokeWidth={1.5} /> Special Instructions
                  </h3>
                  <Textarea placeholder="Leave key under mat, allergies, pets..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="rounded-xl border-border resize-none focus-visible:ring-primary/30" />
                </section>
              </motion.div>
            )}

            {/* Step 5: Review & Confirm */}
            {step === 5 && (
              <motion.div key="step5" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <div className="border border-border rounded-2xl p-5 mb-4 space-y-4">
                  <h3 className="font-display font-bold text-foreground text-sm">Booking Summary</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Services</span>
                      <span className="text-foreground font-medium text-right max-w-[60%]">{selectedNames}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frequency</span>
                      <span className="text-foreground font-medium">{freq?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Time</span>
                      <span className="text-foreground font-medium">{date?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at {time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="text-foreground font-medium">{duration} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property</span>
                      <span className="text-foreground font-medium capitalize">{propertyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address</span>
                      <span className="text-foreground font-medium text-right">{address}, {postcode}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing breakdown */}
                <div className="bg-primary rounded-2xl p-5 text-primary-foreground mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-primary-foreground/60">Base rate</span>
                    <span>£{baseRate}/hr × {duration}h = £{baseRate * duration}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-primary-foreground/60">{freq?.label} discount</span>
                      <span className="text-green-300">-{discount}%</span>
                    </div>
                  )}
                  <div className="border-t border-primary-foreground/20 mt-2 pt-2 flex justify-between font-display font-black text-xl">
                    <span>Total</span>
                    <span>£{totalCost}</span>
                  </div>
                  {recurring !== 'none' && (
                    <p className="text-[10px] text-primary-foreground/50 mt-1">per session</p>
                  )}
                </div>

                {notes && (
                  <div className="bg-accent rounded-xl p-3 mb-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm text-foreground">{notes}</p>
                  </div>
                )}

                <Button onClick={handleBook} disabled={submitting}
                  className="w-full h-14 text-base font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40">
                  {submitting ? 'Booking...' : 'Confirm & Find Cleaner'}
                  <ArrowRight className="h-4 w-4 ml-2" strokeWidth={1.5} />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next button (steps 1-4) */}
          {step < 5 && (
            <div className="mt-6">
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!canAdvance()}
                className="w-full h-14 text-base font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-1" strokeWidth={1.5} />
              </Button>
            </div>
          )}
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
