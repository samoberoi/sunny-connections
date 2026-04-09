import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Home, Clock, MapPin, CalendarDays, Repeat, ChevronLeft, ChevronRight,
  UtensilsCrossed, ShowerHead, Sofa, Trash2, Wind, WashingMachine, Bed, Shirt,
  Brush, CheckCircle2, StickyNote, Building2, Landmark, ArrowRight, Check, Crown, Locate, CreditCard, Banknote, Smartphone, Coins, Tag
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
import { useQuery } from '@tanstack/react-query';
import { useCoinBalance } from '@/components/CoinBalance';
import CouponCodeInput from '@/components/CouponCodeInput';
import { useServicesByMode, type ServiceRow } from '@/hooks/useServices';
import ActiveOffers from '@/components/ActiveOffers';

type Category = 'cleaning' | 'housekeeping';

const iconMap: Record<string, any> = {
  Sparkles, Home, ShowerHead, UtensilsCrossed, Wind, WashingMachine, Bed, Shirt, Brush, Sofa, Trash2, ChefHat: UtensilsCrossed, LayoutGrid: Brush,
};

// Name-based service question mapping
const serviceNameQuestions: Record<string, { label: string; question: string; options: number[]; pricePerUnit: number }> = {
  'Kitchen Deep Clean': { label: 'Kitchens', question: 'How many kitchens?', options: [1, 2, 3], pricePerUnit: 4 },
  'Bathroom Refresh': { label: 'Bathrooms', question: 'How many bathrooms?', options: [1, 2, 3, 4], pricePerUnit: 5 },
  'Bedroom Cleaning': { label: 'Bedrooms', question: 'How many bedrooms?', options: [1, 2, 3, 4, 5], pricePerUnit: 3 },
  'Living Room Tidy': { label: 'Living Rooms', question: 'How many living rooms?', options: [1, 2, 3], pricePerUnit: 3 },
  'Deep Cleaning': { label: 'Rooms', question: 'How many rooms?', options: [1, 2, 3, 4, 5, 6], pricePerUnit: 5 },
  'Laundry & Ironing': { label: 'People', question: "How many people's laundry?", options: [1, 2, 3, 4, 5], pricePerUnit: 4 },
  'Bed Making & Linen Change': { label: 'Beds', question: 'How many beds?', options: [1, 2, 3, 4, 5], pricePerUnit: 2 },
  'Organising & Decluttering': { label: 'Rooms', question: 'How many rooms to organise?', options: [1, 2, 3, 4], pricePerUnit: 4 },
  'Standard House Clean': { label: 'Rooms', question: 'How many rooms total?', options: [2, 3, 4, 5, 6, 7, 8], pricePerUnit: 3 },
  'Full Express Clean': { label: 'Rooms', question: 'How many rooms total?', options: [2, 3, 4, 5, 6, 7, 8], pricePerUnit: 3 },
  'General Housekeeping': { label: 'Rooms', question: 'How many rooms total?', options: [2, 3, 4, 5, 6, 7, 8], pricePerUnit: 3 },
  'End of Tenancy': { label: 'Rooms', question: 'How many rooms total?', options: [2, 3, 4, 5, 6, 7, 8, 9, 10], pricePerUnit: 4 },
};

function getQuestionForService(service: ServiceRow) {
  return serviceNameQuestions[service.name] || null;
}

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
const propertySizes = [
  { value: 'small', label: 'Small', desc: '<500 sqft', multiplier: 1.0 },
  { value: 'medium', label: 'Medium', desc: '500-1000', multiplier: 1.2 },
  { value: 'large', label: 'Large', desc: '1000-2000', multiplier: 1.5 },
  { value: 'xl', label: 'XL', desc: '2000+', multiplier: 2.0 },
];

export default function ScheduleBooking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceQuantities, setServiceQuantities] = useState<Record<string, number>>({});
  const [recurring, setRecurring] = useState<'none' | 'weekly' | 'fortnightly' | 'monthly'>('none');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(2);
  const [propertyType, setPropertyType] = useState('house');
  const [propertySize, setPropertySize] = useState('medium');
  const [tier, setTier] = useState<'standard' | 'premium'>('standard');
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [referralCode, setReferralCode] = useState(() => localStorage.getItem('applied_referral_code') || '');
  const [useCoins, setUseCoins] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const totalSteps = 6;

  const { data: coinData } = useCoinBalance();
  const { data: dbScheduledServices = [] } = useServicesByMode('scheduled');

  // Fetch saved addresses
  const { data: savedAddresses = [] } = useQuery({
    queryKey: ['my-addresses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at');
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Auto-fill address from saved addresses on mount
  useEffect(() => {
    if (savedAddresses.length > 0 && !address && !postcode) {
      const home = savedAddresses.find((a: any) => a.label === 'Home') || savedAddresses[0];
      setAddress((home as any).line1);
      setPostcode((home as any).postcode);
      setSelectedAddressId((home as any).id);
    }
  }, [savedAddresses]);

  const toggleService = (id: string) => {
    setSelectedServices(prev => {
      if (prev.includes(id)) {
        const newQuantities = { ...serviceQuantities };
        delete newQuantities[id];
        setServiceQuantities(newQuantities);
        return prev.filter(s => s !== id);
      }
      // Set default quantity based on name-based question
      const svc = dbScheduledServices.find(s => s.id === id);
      const q = svc ? getQuestionForService(svc) : null;
      if (q) setServiceQuantities(prev2 => ({ ...prev2, [id]: q.options[0] }));
      return [...prev, id];
    });
  };

  const selectedServiceDetails = dbScheduledServices.filter(s => selectedServices.includes(s.id));
  const baseRate = selectedServiceDetails.reduce((sum, s) => sum + s.rate_per_hour, 0);

  // Calculate service-specific surcharges using name-based mapping
  const serviceSurcharge = selectedServices.reduce((sum, svcId) => {
    const svc = dbScheduledServices.find(s => s.id === svcId);
    const q = svc ? getQuestionForService(svc) : null;
    if (!q) return sum;
    const qty = serviceQuantities[svcId] || q.options[0];
    return sum + (Math.max(0, qty - 1) * q.pricePerUnit);
  }, 0);

  // Services that have follow-up questions
  const serviceQuestionsToShow = selectedServices.filter(id => {
    const svc = dbScheduledServices.find(s => s.id === id);
    return svc && getQuestionForService(svc);
  });

  const freq = frequencies.find(f => f.value === recurring);
  const discount = freq?.discount || 0;
  const sizeMultiplier = propertySizes.find(s => s.value === propertySize)?.multiplier || 1;
  const tierMultiplier = tier === 'premium' ? 1.3 : 1.0;
  const subtotal = (baseRate * duration * sizeMultiplier * tierMultiplier) + (serviceSurcharge * duration);
  const afterFreqDiscount = Math.round(subtotal * (1 - discount / 100));
  const afterCoupon = couponDiscount > 0 ? Math.round(afterFreqDiscount * (1 - couponDiscount / 100)) : afterFreqDiscount;
  const preCoinCost = afterCoupon;
  const coinBalance = coinData?.balance || 0;
  const coinDiscount = useCoins ? Math.min(coinBalance, preCoinCost * 10) : 0;
  const coinPoundValue = Math.floor(coinDiscount / 10);
  const totalCost = Math.max(0, preCoinCost - coinPoundValue);
  const selectedNames = selectedServiceDetails.map(s => s.name).join(', ');

  const canAdvance = () => {
    switch (step) {
      case 1: return category !== null && selectedServices.length > 0;
      case 2: return true;
      case 3: return !!recurring;
      case 4: return !!date && !!time;
      case 5: return !!address && !!postcode;
      case 6: return true;
      default: return false;
    }
  };

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
          const parts = [addr.house_number, addr.road, addr.suburb, addr.city || addr.town || addr.village].filter(Boolean);
          setAddress(parts.join(', '));
          setSelectedAddressId(null);
          toast.success('Address detected!');
        }
      }
    } catch {
      toast.error('Could not detect location');
    } finally {
      setDetecting(false);
    }
  };

  const handleBook = async () => {
    if (!user || !date || !address || !postcode) return;
    setSubmitting(true);
    try {
      const serviceId = selectedServiceDetails[0]?.id;
      if (!serviceId) { toast.error('No services selected'); setSubmitting(false); return; }
      const { data: booking, error } = await supabase.from('bookings').insert({
        customer_id: user.id, customer_name: user.name, service_id: serviceId, service_name: `Scheduled: ${selectedNames}`,
        date: date.toISOString().split('T')[0], time, duration, recurring, address_line1: address, address_postcode: postcode,
        address_city: 'London', total_cost: totalCost, property_type: propertyType, notes: notes || null,
        tier, payment_method: paymentMethod, referral_code: referralCode || null,
      }).select().single();
      if (error) throw error;

      // Generate future recurring instances
      if (recurring !== 'none' && date) {
        const intervalDays = recurring === 'weekly' ? 7 : recurring === 'fortnightly' ? 14 : 30;
        const futureCount = recurring === 'weekly' ? 11 : recurring === 'fortnightly' ? 7 : 5; // ~3 months
        const futureBookings = [];
        for (let i = 1; i <= futureCount; i++) {
          const futureDate = new Date(date);
          futureDate.setDate(futureDate.getDate() + intervalDays * i);
          futureBookings.push({
            customer_id: user.id, customer_name: user.name, service_id: serviceId,
            service_name: `Scheduled: ${selectedNames}`,
            date: futureDate.toISOString().split('T')[0], time, duration, recurring,
            address_line1: address, address_postcode: postcode, address_city: 'London',
            total_cost: totalCost, property_type: propertyType, notes: notes || null,
            tier, payment_method: paymentMethod, referral_code: referralCode || null,
          });
        }
        if (futureBookings.length > 0) {
          await supabase.from('bookings').insert(futureBookings);
        }
      }

      await supabase.from('notifications').insert({
        user_id: user.id, title: 'Booking Confirmed! 🎉',
        message: `Your ${selectedNames} booking is confirmed. We're searching for a cleaner.`, type: 'booking',
      });

      if (useCoins && coinDiscount > 0 && user.id) {
        const actualCoinsUsed = Math.min(coinDiscount, coinBalance);
        await supabase.from('customer_coins').update({
          balance: coinBalance - actualCoinsUsed,
          total_spent: (coinData?.total_spent || 0) + actualCoinsUsed,
        }).eq('customer_id', user.id);
        await supabase.from('coin_transactions').insert({
          customer_id: user.id, amount: actualCoinsUsed, type: 'spent',
          description: 'Redeemed on booking', booking_id: booking.id,
        });
      }

      if (!selectedAddressId && address && postcode) {
        const { data: existing } = await supabase.from('addresses').select('id').eq('user_id', user.id).eq('label', 'Home').maybeSingle();
        if (existing) {
          await supabase.from('addresses').update({ line1: address, postcode, city: 'London' }).eq('id', existing.id);
        } else {
          await supabase.from('addresses').insert({ user_id: user.id, label: 'Home', line1: address, postcode, city: 'London' });
        }
      }

      navigate('/searching-cleaner', { state: { bookingId: booking.id, service: { name: `Scheduled: ${selectedNames}` }, date: date.toISOString(), time, duration, recurring, address, postcode, totalCost, otp: booking.otp } });
    } catch { toast.error('Failed to create booking'); } finally { setSubmitting(false); }
  };

  const fadeVariants = { enter: { opacity: 0, x: 30 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 } };

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-14 pb-28">
          <div className="flex items-center gap-3 mb-2">
            {step === 1 ? <BackButton /> : (
              <button onClick={() => setStep(s => s - 1)} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
                <ChevronLeft className="h-4 w-4 text-foreground" strokeWidth={1.5} />
              </button>
            )}
            <h1 className="text-2xl font-display font-black text-foreground">Schedule</h1>
          </div>

          {/* Progress */}
          <div className="flex gap-1.5 mb-6 ml-12">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < step ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Category & Service Selection + Smart Questions */}
            {step === 1 && (
              <motion.div key="step1" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                {!category ? (
                  <div className="space-y-3">
                    <p className="font-display font-bold text-foreground text-sm mb-3">What do you need?</p>
                    {([
                      { key: 'cleaning' as Category, icon: Sparkles, label: 'House Cleaning', desc: 'Kitchen, bathroom, deep clean' },
                      { key: 'housekeeping' as Category, icon: Bed, label: 'Housekeeping', desc: 'Laundry, ironing, organising' },
                    ]).map((cat, i) => (
                      <motion.button key={cat.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.98 }} onClick={() => setCategory(cat.key)}
                        className="w-full text-left bg-card border border-border rounded-3xl p-5 flex items-center gap-4 shadow-soft">
                        <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                          <cat.icon className="h-6 w-6 text-foreground" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-bold text-foreground">{cat.label}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{cat.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      </motion.button>
                    ))}
                    {selectedServices.length > 0 && (
                      <div className="mt-4 p-3 bg-primary/10 rounded-2xl">
                        <p className="text-xs text-muted-foreground mb-1">Selected ({selectedServices.length})</p>
                        <p className="text-sm font-bold text-foreground">{selectedNames}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <button onClick={() => setCategory(null)} className="text-xs text-primary-ink font-bold mb-3 flex items-center gap-1">← Categories</button>
                    <p className="font-display font-bold text-foreground text-sm mb-3">{category === 'cleaning' ? '🧹 Cleaning' : '🏠 Housekeeping'}</p>
                    <div className="space-y-2">
                      {dbScheduledServices.filter(s => s.category === category).map((svc, i) => {
                        const isSelected = selectedServices.includes(svc.id);
                        const IconComp = iconMap[svc.icon] || Sparkles;
                        return (
                          <motion.button key={svc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            whileTap={{ scale: 0.98 }} onClick={() => toggleService(svc.id)}
                            className={`w-full text-left border rounded-3xl p-4 flex items-center gap-3 transition-all shadow-soft ${
                              isSelected ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border bg-card'
                            }`}>
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-foreground'}`}>
                              <IconComp className="h-4 w-4" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-foreground text-sm">{svc.name}</h4>
                              <p className="text-[10px] text-muted-foreground">£{svc.rate_per_hour}/hr</p>
                            </div>
                            {isSelected && <CheckCircle2 className="h-5 w-5 text-foreground shrink-0" strokeWidth={1.5} />}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Smart service-specific follow-up questions */}
                    {serviceQuestionsToShow.length > 0 && (
                      <div className="mt-5 space-y-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quick Details</p>
                        {serviceQuestionsToShow.map(svcId => {
                          const svc = dbScheduledServices.find(s => s.id === svcId)!;
                          const q = getQuestionForService(svc)!;
                          return (
                            <div key={svcId} className="bg-card border border-border rounded-2xl p-4">
                              <p className="text-xs font-bold text-foreground mb-2">{svc.name}: {q.question}</p>
                              <div className="flex gap-2">
                                {q.options.map(n => (
                                  <button key={n} onClick={() => setServiceQuantities(prev => ({ ...prev, [svcId]: n }))}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                                      (serviceQuantities[svcId] || q.options[0]) === n
                                        ? 'bg-foreground text-background border-foreground'
                                        : 'border-border bg-card text-muted-foreground'
                                    }`}>{n}</button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {selectedServices.length > 0 && (
                      <div className="mt-4 p-3 bg-primary/10 rounded-2xl">
                        <p className="text-xs text-muted-foreground mb-1">Selected ({selectedServices.length})</p>
                        <p className="text-sm font-bold text-foreground">{selectedNames}</p>
                        <p className="text-xs text-primary-ink font-bold mt-1">Base: £{baseRate}/hr {serviceSurcharge > 0 && `+ £${serviceSurcharge} extras`}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Property Details & Tier (no bedrooms/bathrooms - captured contextually) */}
            {step === 2 && (
              <motion.div key="step2" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5">
                <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-2"><Home className="h-4 w-4" strokeWidth={1.5} /> Tell us about your home</h3>
                
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">Size</p>
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

                {/* Tier selection */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">Service Tier</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setTier('standard')}
                      className={`p-4 rounded-2xl text-left border-2 transition-all ${tier === 'standard' ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                      <Check className={`h-5 w-5 mb-2 ${tier === 'standard' ? 'text-foreground' : 'text-muted-foreground'}`} strokeWidth={1.5} />
                      <h4 className="font-bold text-foreground text-sm">Standard</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Great value cleaning</p>
                    </button>
                    <button onClick={() => setTier('premium')}
                      className={`p-4 rounded-2xl text-left border-2 transition-all relative overflow-hidden ${tier === 'premium' ? 'border-amber-400 bg-amber-50' : 'border-border bg-card'}`}>
                      <Crown className={`h-5 w-5 mb-2 ${tier === 'premium' ? 'text-amber-600' : 'text-muted-foreground'}`} strokeWidth={1.5} />
                      <h4 className="font-bold text-foreground text-sm">Premium</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Top cleaners, eco products</p>
                      <span className="text-[9px] font-bold text-amber-600 mt-1 block">+30%</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Frequency & Duration */}
            {step === 3 && (
              <motion.div key="step3" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <section className="mb-6">
                  <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2"><Repeat className="h-4 w-4" strokeWidth={1.5} /> How Often?</h3>
                  <div className="space-y-2">
                    {frequencies.map(f => (
                      <motion.button key={f.value} whileTap={{ scale: 0.98 }} onClick={() => setRecurring(f.value)}
                        className={`w-full text-left border rounded-3xl p-4 flex items-center justify-between transition-all shadow-soft ${
                          recurring === f.value ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border bg-card'
                        }`}>
                        <div>
                          <h4 className="font-bold text-foreground text-sm">{f.label}</h4>
                          <p className="text-xs text-muted-foreground">{f.desc}</p>
                        </div>
                        {f.discount && <span className="text-xs font-bold text-primary-foreground bg-foreground px-3 py-1.5 rounded-full">{f.discount}% off</span>}
                      </motion.button>
                    ))}
                  </div>
                </section>
                <section>
                  <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2"><Clock className="h-4 w-4" strokeWidth={1.5} /> Duration</h3>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5, 6].map(d => (
                      <motion.button key={d} whileTap={{ scale: 0.97 }} onClick={() => setDuration(d)}
                        className={`flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all border ${duration === d ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'}`}>
                        {d}h
                      </motion.button>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {/* Step 4: Date & Time */}
            {step === 4 && (
              <motion.div key="step4" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <section className="mb-6">
                  <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2"><CalendarDays className="h-4 w-4" strokeWidth={1.5} /> Date</h3>
                  <div className="border border-border rounded-3xl p-3 bg-card">
                    <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} className={cn("mx-auto pointer-events-auto")} />
                  </div>
                </section>
                <section>
                  <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2"><Clock className="h-4 w-4" strokeWidth={1.5} /> Time</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map(t => (
                      <motion.button key={t} whileTap={{ scale: 0.97 }} onClick={() => setTime(t)}
                        className={`py-3 rounded-2xl text-sm font-bold transition-all border ${time === t ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'}`}>
                        {t}
                      </motion.button>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {/* Step 5: Address */}
            {step === 5 && (
              <motion.div key="step5" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <section className="mb-6">
                  <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2"><Home className="h-4 w-4" strokeWidth={1.5} /> Property</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {propertyTypes.map(pt => (
                      <motion.button key={pt.value} whileTap={{ scale: 0.97 }} onClick={() => setPropertyType(pt.value)}
                        className={`py-4 rounded-2xl text-sm font-bold flex flex-col items-center gap-2 border transition-all ${
                          propertyType === pt.value ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'
                        }`}>
                        <pt.icon className="h-5 w-5" strokeWidth={1.5} />{pt.label}
                      </motion.button>
                    ))}
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2"><MapPin className="h-4 w-4" strokeWidth={1.5} /> Address</h3>

                  {savedAddresses.length > 0 && (
                    <div className="space-y-2 mb-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Saved Addresses</p>
                      {savedAddresses.map((addr: any) => (
                        <button key={addr.id} onClick={() => { setAddress(addr.line1); setPostcode(addr.postcode); setSelectedAddressId(addr.id); }}
                          className={`w-full text-left border rounded-2xl p-3 flex items-center gap-3 transition-all ${
                            selectedAddressId === addr.id ? 'border-primary bg-primary/10 ring-1 ring-primary/20' : 'border-border bg-card'
                          }`}>
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground">{addr.label}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{addr.line1}, {addr.postcode}</p>
                          </div>
                          {selectedAddressId === addr.id && <CheckCircle2 className="h-4 w-4 text-foreground shrink-0" strokeWidth={1.5} />}
                        </button>
                      ))}
                    </div>
                  )}

                  <button onClick={() => { setSelectedAddressId(null); setAddress(''); setPostcode(''); }}
                    className={`w-full text-left border rounded-2xl p-3 flex items-center gap-3 transition-all mb-3 ${
                      !selectedAddressId ? 'border-primary bg-primary/10' : 'border-border bg-card'
                    }`}>
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                    <span className="text-xs font-bold text-foreground">Use a different address</span>
                  </button>

                  {!selectedAddressId && (
                    <div className="space-y-2">
                      <Button variant="outline" onClick={autoDetectAddress} disabled={detecting}
                        className="w-full h-10 rounded-2xl border-dashed border-primary/30 text-xs font-bold">
                        <Locate className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
                        {detecting ? 'Detecting...' : 'Auto-detect location'}
                      </Button>
                      <Input placeholder="Postcode" value={postcode} onChange={e => setPostcode(e.target.value)} className="h-13 rounded-2xl border-2 border-border bg-card text-base" />
                      <Input placeholder="Address line" value={address} onChange={e => setAddress(e.target.value)} className="h-13 rounded-2xl border-2 border-border bg-card text-base" />
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2"><StickyNote className="h-4 w-4" strokeWidth={1.5} /> Notes</h3>
                  <Textarea placeholder="Special instructions..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="rounded-2xl border-border resize-none" />
                </section>
              </motion.div>
            )}

            {/* Step 6: Review */}
            {step === 6 && (
              <motion.div key="step6" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <div className="bg-card rounded-3xl p-5 mb-4 space-y-3 shadow-soft border border-border">
                  <h3 className="font-display font-bold text-foreground">Summary</h3>
                  <div className="space-y-2.5 text-sm">
                    {[
                      ['Services', selectedNames],
                      ['Tier', tier === 'premium' ? '👑 Premium' : 'Standard'],
                      ['Property', `${propertyType} · ${propertySize}`],
                      ['Frequency', freq?.label],
                      ['Date', date?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' at ' + time],
                      ['Duration', `${duration} hours`],
                      ['Address', `${address}, ${postcode}`],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between">
                        <span className="text-muted-foreground">{l}</span>
                        <span className="text-foreground font-medium text-right max-w-[60%]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card rounded-3xl p-5 mb-4 shadow-soft border border-border">
                  <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" strokeWidth={1.5} /> Payment Method
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'card', label: 'Card', icon: CreditCard },
                      { value: 'online', label: 'Online', icon: Smartphone },
                      { value: 'cash', label: 'Cash', icon: Banknote },
                    ].map(pm => (
                      <motion.button key={pm.value} whileTap={{ scale: 0.97 }} onClick={() => setPaymentMethod(pm.value)}
                        className={`py-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 border transition-all ${
                          paymentMethod === pm.value ? 'bg-foreground text-background border-foreground' : 'border-border bg-card text-muted-foreground'
                        }`}>
                        <pm.icon className="h-4 w-4" strokeWidth={1.5} />
                        {pm.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* CleanFit Coins */}
                {coinBalance > 0 && (
                  <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    onClick={() => setUseCoins(!useCoins)}
                    className={`w-full text-left rounded-3xl p-4 mb-4 flex items-center gap-3 border transition-all ${
                      useCoins ? 'border-primary bg-primary/10' : 'border-border bg-card'
                    }`}>
                    <Coins className="h-5 w-5 text-amber-600 shrink-0" strokeWidth={1.5} />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground">Use CleanFit Coins</p>
                      <p className="text-[10px] text-muted-foreground">{coinBalance} coins = £{(coinBalance / 10).toFixed(2)} discount</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${useCoins ? 'bg-primary border-primary' : 'border-border'}`}>
                      {useCoins && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={2} />}
                    </div>
                  </motion.button>
                )}

                {/* Active Offers */}
                <ActiveOffers onApplyOffer={(discount) => setCouponDiscount(discount)} />

                {/* Coupon / Referral combined */}
                <div className="bg-card rounded-3xl p-4 shadow-soft border border-border space-y-2">
                  <h4 className="font-display font-bold text-foreground text-xs flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5" strokeWidth={1.5} /> Promo / Referral Code
                  </h4>
                  <CouponCodeInput onApply={(discount) => setCouponDiscount(discount)} />
                  <Input placeholder="Referral code (optional)" value={referralCode} onChange={e => setReferralCode(e.target.value.toUpperCase())}
                    className="h-11 rounded-2xl border-border bg-background text-sm font-mono uppercase" />
                </div>

                {/* Price Breakdown */}
                <div className="bg-foreground rounded-3xl p-5 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-background/50">Base rate</span>
                    <span className="text-background">£{baseRate}/hr × {duration}h</span>
                  </div>
                  {sizeMultiplier !== 1 && (
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-background/50">Size ({propertySize})</span>
                      <span className="text-background">×{sizeMultiplier}</span>
                    </div>
                  )}
                  {serviceSurcharge > 0 && (
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-background/50">Service extras</span>
                      <span className="text-background">+£{serviceSurcharge * duration}</span>
                    </div>
                  )}
                  {tier === 'premium' && (
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-background/50">Premium tier</span>
                      <span className="text-amber-400">+30%</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-background/50">{freq?.label}</span>
                      <span className="text-primary">-{discount}%</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-background/50">Coupon</span>
                      <span className="text-primary">-{couponDiscount}%</span>
                    </div>
                  )}
                  {useCoins && coinPoundValue > 0 && (
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-background/50">🪙 Coins ({coinDiscount})</span>
                      <span className="text-primary">-£{coinPoundValue}</span>
                    </div>
                  )}
                  <div className="border-t border-background/20 mt-2 pt-2 flex justify-between font-display font-black text-2xl">
                    <span className="text-background">Total</span>
                    <span className="text-primary">£{totalCost}</span>
                  </div>
                </div>

                <Button onClick={handleBook} disabled={submitting} className="w-full h-14 text-base font-bold rounded-full bg-primary text-primary-foreground disabled:opacity-40">
                  {submitting ? 'Booking...' : `Pay £${totalCost} & Find Cleaner`} <ArrowRight className="h-4 w-4 ml-2" strokeWidth={2} />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {step < 6 && (
            <div className="mt-6">
              <Button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}
                className="w-full h-14 text-base font-bold rounded-full bg-foreground text-background disabled:opacity-40">
                Continue <ChevronRight className="h-4 w-4 ml-1" strokeWidth={2} />
              </Button>
            </div>
          )}
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
