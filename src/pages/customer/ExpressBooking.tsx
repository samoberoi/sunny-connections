import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Sparkles, Home, MapPin, ChevronRight, Bed, Locate, CheckCircle2, UtensilsCrossed, ShowerHead, Wind, WashingMachine, Brush, Sofa, Trash2, Tag, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CouponCodeInput from '@/components/CouponCodeInput';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useServicesByMode } from '@/hooks/useServices';

type Category = 'cleaning' | 'housekeeping';

const iconMap: Record<string, any> = {
  Sparkles, Home, ShowerHead, UtensilsCrossed, Wind, WashingMachine, Bed, Brush, Sofa, Trash2, ChefHat: UtensilsCrossed, LayoutGrid: Brush,
};

export default function ExpressBooking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: dbServices = [] } = useServicesByMode('express');
  const [category, setCategory] = useState<Category | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [referralCode, setReferralCode] = useState(() => localStorage.getItem('applied_referral_code') || '');
  const [couponDiscount, setCouponDiscount] = useState(0);

  const services = category ? dbServices.filter(s => s.category === category) : [];
  const service = dbServices.find(s => s.id === selected);

  const { data: savedAddresses = [] } = useQuery({
    queryKey: ['my-addresses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at');
      return data || [];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (savedAddresses.length > 0 && !address && !postcode) {
      const home = savedAddresses.find((a: any) => a.label === 'Home') || savedAddresses[0];
      setAddress((home as any).line1);
      setPostcode((home as any).postcode);
      setSelectedAddressId((home as any).id);
    }
  }, [savedAddresses]);

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
          setAddress([addr.house_number, addr.road, addr.suburb, addr.city || addr.town || addr.village].filter(Boolean).join(', '));
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
    if (!service || !user || !address || !postcode) { toast.error('Please complete all fields'); return; }
    setSubmitting(true);
    try {
      const now = new Date();
      const { data: booking, error } = await supabase.from('bookings').insert({
        customer_id: user.id, customer_name: user.name, service_id: service.id, service_name: `Express: ${service.name}`,
        date: now.toISOString().split('T')[0], time: now.toTimeString().slice(0, 5), duration: Math.ceil(service.min_duration),
        recurring: 'none', address_line1: address, address_postcode: postcode, address_city: 'London', total_cost: service.rate_per_hour * service.min_duration, property_type: 'house',
        payment_method: paymentMethod, referral_code: referralCode || null,
      }).select().single();
      if (error) throw error;
      navigate('/searching-cleaner', { state: { bookingId: booking.id, service: { name: `Express: ${service.name}` }, date: now.toISOString(), time: now.toTimeString().slice(0, 5), duration: Math.ceil(service.min_duration), address, postcode, totalCost: service.rate_per_hour * service.min_duration, otp: booking.otp, isExpress: true } });
    } catch { toast.error('Failed to create booking'); } finally { setSubmitting(false); }
  };

  const basePrice = service ? service.rate_per_hour * service.min_duration : 0;
  const totalPrice = couponDiscount > 0 ? Math.round(basePrice * (1 - couponDiscount / 100)) : basePrice;

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-14 pb-28">
          <div className="flex items-center gap-3 mb-2">
            <BackButton />
            <h1 className="text-2xl font-display font-black text-foreground">Express Clean</h1>
          </div>

          <div className="flex items-center gap-2 bg-primary rounded-full px-4 py-2.5 w-fit mb-6 ml-12">
            <Zap className="h-4 w-4 text-primary-foreground" strokeWidth={2} />
            <span className="text-xs font-bold text-primary-foreground">Priority surcharge included</span>
          </div>

          {/* Category Selection */}
          {!category && (
            <section className="space-y-3 mb-6">
              <p className="font-display font-bold text-foreground text-sm mb-2">What do you need?</p>
              {([
                { key: 'cleaning' as Category, icon: Sparkles, label: 'House Cleaning', desc: 'Kitchen, bathroom & deep clean' },
                { key: 'housekeeping' as Category, icon: Bed, label: 'Housekeeping', desc: 'Laundry, bed making & organising' },
              ]).map((cat, i) => (
                <motion.button key={cat.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.98 }} onClick={() => { setCategory(cat.key); setSelected(null); }}
                  className="w-full text-left bg-card border border-border rounded-3xl p-5 flex items-center gap-4 shadow-soft">
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
            </section>
          )}

          {/* Services from DB */}
          {category && (
            <section className="mb-6">
              <button onClick={() => { setCategory(null); setSelected(null); }} className="text-xs text-primary font-bold mb-3 flex items-center gap-1">← Categories</button>
              <div className="space-y-2.5">
                {services.map((svc, i) => {
                  const IconComp = iconMap[svc.icon] || Sparkles;
                  return (
                    <motion.button key={svc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      whileTap={{ scale: 0.98 }} onClick={() => setSelected(svc.id)}
                      className={`w-full text-left border rounded-3xl p-5 flex items-center gap-4 transition-all shadow-soft ${
                        selected === svc.id ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border bg-card'
                      }`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${selected === svc.id ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-foreground'}`}>
                        <IconComp className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-foreground text-sm">{svc.name}</h4>
                        <p className="text-[11px] text-muted-foreground">{svc.description} · ~{svc.min_duration}h</p>
                      </div>
                      <span className="text-xl font-display font-black text-foreground">£{Math.round(svc.rate_per_hour * svc.min_duration)}</span>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Address with saved addresses */}
          {selected && (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mb-6">
              <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-2"><MapPin className="h-4 w-4" strokeWidth={1.5} /> Address</h3>

              {savedAddresses.length > 0 && (
                <div className="space-y-2">
                  {savedAddresses.map((addr: any) => (
                    <button key={addr.id} onClick={() => { setAddress(addr.line1); setPostcode(addr.postcode); setSelectedAddressId(addr.id); }}
                      className={`w-full text-left border rounded-2xl p-3 flex items-center gap-3 transition-all ${
                        selectedAddressId === addr.id ? 'border-primary bg-primary/10' : 'border-border bg-card'
                      }`}>
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
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
                className={`w-full text-left border rounded-2xl p-3 text-xs font-bold text-foreground flex items-center gap-2 ${!selectedAddressId ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} /> Different address
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
            </motion.section>
          )}

          {/* Payment & Offers */}
          {selected && service && (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mb-6">
              <h3 className="font-display font-bold text-foreground text-sm">Payment Method</h3>
              <div className="flex gap-2">
                {['card', 'online', 'cash'].map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    className={`flex-1 py-2.5 rounded-2xl text-xs font-bold border transition-all ${paymentMethod === m ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card text-muted-foreground'}`}>
                    {m === 'card' ? '💳 Card' : m === 'online' ? '📱 Online' : '💵 Cash'}
                  </button>
                ))}
              </div>

              {/* Active Offers */}
              <ActiveOffers onApplyOffer={(discount) => setCouponDiscount(discount)} />

              {/* Coupon / Referral combined */}
              <div className="bg-card rounded-3xl p-4 border border-border space-y-2">
                <h4 className="font-display font-bold text-foreground text-xs flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5" strokeWidth={1.5} /> Promo / Referral Code
                </h4>
                <CouponCodeInput onApply={(discount) => setCouponDiscount(discount)} />
                <Input placeholder="Referral code (optional)" value={referralCode} onChange={e => setReferralCode(e.target.value.toUpperCase())}
                  className="h-11 rounded-2xl border-border bg-background text-sm font-mono uppercase" />
              </div>
            </motion.section>
          )}

          {/* Summary */}
          {selected && service && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-foreground rounded-3xl p-5 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-background/50">{service.name}</span>
                  <span className="text-background">~{service.min_duration}h</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-background/50">Payment</span>
                  <span className="text-background capitalize">{paymentMethod}</span>
                </div>
                <div className="flex justify-between font-display font-black text-2xl">
                  <span className="text-background">Total</span>
                  <span className="text-primary">£{totalPrice}</span>
                </div>
              </div>

              {!showConfirm ? (
                <Button onClick={() => setShowConfirm(true)} disabled={!address || !postcode}
                  className="w-full h-14 text-base font-bold rounded-full disabled:opacity-40 bg-primary text-primary-foreground">
                  Book Instant Clean ⚡
                </Button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border-2 border-primary rounded-3xl p-5 text-center space-y-4 bg-card">
                  <p className="font-display font-bold text-foreground text-lg">Confirm?</p>
                  <p className="text-sm text-muted-foreground">£{totalPrice} for {service.name}</p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowConfirm(false)} className="flex-1 h-12 rounded-full">Cancel</Button>
                    <Button onClick={handleBook} disabled={submitting} className="flex-1 h-12 rounded-full bg-primary text-primary-foreground font-bold">
                      {submitting ? 'Booking...' : 'Confirm ⚡'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
