import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Sparkles, Home, Shirt, UtensilsCrossed, MapPin, ChevronRight, Brush, WashingMachine, Bed, Wind, ShowerHead } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Category = 'cleaning' | 'housekeeping';

const expressServices: Record<Category, { id: string; icon: any; name: string; desc: string; price: number; duration: number }[]> = {
  cleaning: [
    { id: 'kitchen', icon: UtensilsCrossed, name: 'Kitchen Blitz', desc: 'Counters, hob, sink & floor', price: 45, duration: 1.5 },
    { id: 'bathroom', icon: ShowerHead, name: 'Bathroom Refresh', desc: 'Toilet, shower, tiles & mirrors', price: 40, duration: 1 },
    { id: 'living', icon: Home, name: 'Living Room Tidy', desc: 'Vacuum, dust, surfaces & cushions', price: 35, duration: 1 },
    { id: 'full', icon: Zap, name: 'Full Express Clean', desc: 'Kitchen + bathroom + living room', price: 85, duration: 2.5 },
    { id: 'deep', icon: Sparkles, name: 'Deep Clean', desc: 'Intensive scrub, appliances & corners', price: 95, duration: 3 },
  ],
  housekeeping: [
    { id: 'laundry', icon: WashingMachine, name: 'Laundry & Iron', desc: 'Wash, dry, fold & iron', price: 50, duration: 2 },
    { id: 'bedmaking', icon: Bed, name: 'Bed Making & Linen', desc: 'Fresh sheets, pillows & duvet', price: 30, duration: 0.5 },
    { id: 'organise', icon: Brush, name: 'Organise & Declutter', desc: 'Wardrobe, shelves & drawers', price: 55, duration: 2 },
    { id: 'airing', icon: Wind, name: 'Air & Freshen', desc: 'Ventilate, deodorise & fragrance', price: 25, duration: 0.5 },
  ],
};

export default function ExpressBooking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const services = category ? expressServices[category] : [];
  const service = services.find(s => s.id === selected);

  const handleBook = async () => {
    if (!service || !user || !address || !postcode) {
      toast.error('Please select a service and enter your address');
      return;
    }
    setSubmitting(true);
    try {
      const now = new Date();
      // Get a real service ID to satisfy FK
      const { data: services } = await supabase.from('services').select('id').limit(1);
      const serviceId = services?.[0]?.id;
      if (!serviceId) { toast.error('No services available'); setSubmitting(false); return; }

      const { data: booking, error } = await supabase.from('bookings').insert({
        customer_id: user.id,
        customer_name: user.name,
        service_id: serviceId,
        service_name: `Express: ${service.name}`,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
        duration: Math.ceil(service.duration),
        recurring: 'none',
        address_line1: address,
        address_postcode: postcode,
        address_city: 'London',
        total_cost: service.price,
        property_type: 'house',
      }).select().single();

      if (error) throw error;

      navigate('/searching-cleaner', {
        state: {
          bookingId: booking.id,
          service: { name: `Express: ${service.name}` },
          date: now.toISOString(),
          time: now.toTimeString().slice(0, 5),
          duration: Math.ceil(service.duration),
          address,
          postcode,
          totalCost: service.price,
          otp: booking.otp,
          isExpress: true,
        },
      });
    } catch {
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-28">
          <div className="flex items-center gap-3 mb-2">
            <BackButton />
            <h1 className="text-xl font-display font-black text-foreground">Express Clean</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6 ml-12">Instant booking — a cleaner heads to you now</p>

          {/* Express badge */}
          <div className="flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 w-fit mb-6">
            <Zap className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <span className="text-xs font-semibold text-primary">Express prices include priority surcharge</span>
          </div>

          {/* Category Selection */}
          {!category && (
            <section className="space-y-3 mb-6">
              <p className="text-sm font-semibold text-foreground mb-2">What do you need?</p>
              {([
                { key: 'cleaning' as Category, icon: Sparkles, label: 'House Cleaning', desc: 'Kitchen, bathroom, living room & deep clean' },
                { key: 'housekeeping' as Category, icon: Bed, label: 'Housekeeping', desc: 'Laundry, bed making, organising & freshening' },
              ]).map((cat, i) => (
                <motion.button
                  key={cat.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setCategory(cat.key); setSelected(null); }}
                  className="w-full text-left border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/20 transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <cat.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
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

          {/* Service selection within category */}
          {category && (
            <section className="mb-6">
              <button onClick={() => { setCategory(null); setSelected(null); }} className="text-xs text-primary font-semibold mb-3 flex items-center gap-1 hover:underline">
                ← Back to categories
              </button>
              <p className="text-sm font-semibold text-foreground mb-3 capitalize">{category === 'cleaning' ? '🧹 House Cleaning' : '🏠 Housekeeping'}</p>
              <div className="space-y-3">
                {services.map((svc, i) => (
                  <motion.button
                    key={svc.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelected(svc.id)}
                    className={`w-full text-left border rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 ${
                      selected === svc.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      selected === svc.id ? 'bg-primary text-primary-foreground' : 'bg-accent text-primary'
                    }`}>
                      <svc.icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm">{svc.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{svc.desc}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">~{svc.duration}h</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-display font-black text-primary">£{svc.price}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {/* Address */}
          {selected && (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mb-6">
              <h3 className="font-display font-semibold flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} /> Your Address
              </h3>
              <div className="space-y-2">
                <Input placeholder="Postcode (e.g. SW1A 1AA)" value={postcode} onChange={e => setPostcode(e.target.value)} className="h-12 rounded-xl border-border focus-visible:ring-primary/30" />
                <Input placeholder="Address line" value={address} onChange={e => setAddress(e.target.value)} className="h-12 rounded-xl border-border focus-visible:ring-primary/30" />
              </div>
            </motion.section>
          )}

          {/* Summary + CTA */}
          {selected && service && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-primary rounded-2xl p-5 text-primary-foreground mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-primary-foreground/60">{service.name}</span>
                  <span>~{service.duration}h</span>
                </div>
                <div className="flex justify-between font-display font-black text-xl">
                  <span>Total</span>
                  <span>£{service.price}</span>
                </div>
              </div>

              {!showConfirm ? (
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={!address || !postcode}
                  className="w-full h-14 text-base font-semibold rounded-2xl disabled:opacity-40 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Book Instant Clean ⚡
                </Button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border-2 border-primary rounded-2xl p-5 text-center space-y-4">
                  <p className="font-display font-bold text-foreground">Confirm Express Booking?</p>
                  <p className="text-sm text-muted-foreground">£{service.price} will be charged for {service.name}</p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowConfirm(false)} className="flex-1 h-12 rounded-xl border-border">Cancel</Button>
                    <Button onClick={handleBook} disabled={submitting} className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
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
