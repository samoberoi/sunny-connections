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
    { id: 'living', icon: Home, name: 'Living Room Tidy', desc: 'Vacuum, dust & surfaces', price: 35, duration: 1 },
    { id: 'full', icon: Zap, name: 'Full Express Clean', desc: 'Kitchen + bathroom + living', price: 85, duration: 2.5 },
    { id: 'deep', icon: Sparkles, name: 'Deep Clean', desc: 'Intensive scrub & appliances', price: 95, duration: 3 },
  ],
  housekeeping: [
    { id: 'laundry', icon: WashingMachine, name: 'Laundry & Iron', desc: 'Wash, dry, fold & iron', price: 50, duration: 2 },
    { id: 'bedmaking', icon: Bed, name: 'Bed Making', desc: 'Fresh sheets & pillows', price: 30, duration: 0.5 },
    { id: 'organise', icon: Brush, name: 'Organise', desc: 'Wardrobe, shelves & drawers', price: 55, duration: 2 },
    { id: 'airing', icon: Wind, name: 'Air & Freshen', desc: 'Ventilate & deodorise', price: 25, duration: 0.5 },
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
    if (!service || !user || !address || !postcode) { toast.error('Please complete all fields'); return; }
    setSubmitting(true);
    try {
      const now = new Date();
      const { data: svcs } = await supabase.from('services').select('id').limit(1);
      const serviceId = svcs?.[0]?.id;
      if (!serviceId) { toast.error('No services available'); setSubmitting(false); return; }
      const { data: booking, error } = await supabase.from('bookings').insert({
        customer_id: user.id, customer_name: user.name, service_id: serviceId, service_name: `Express: ${service.name}`,
        date: now.toISOString().split('T')[0], time: now.toTimeString().slice(0, 5), duration: Math.ceil(service.duration),
        recurring: 'none', address_line1: address, address_postcode: postcode, address_city: 'London', total_cost: service.price, property_type: 'house',
      }).select().single();
      if (error) throw error;
      navigate('/searching-cleaner', { state: { bookingId: booking.id, service: { name: `Express: ${service.name}` }, date: now.toISOString(), time: now.toTimeString().slice(0, 5), duration: Math.ceil(service.duration), address, postcode, totalCost: service.price, otp: booking.otp, isExpress: true } });
    } catch { toast.error('Failed to create booking'); } finally { setSubmitting(false); }
  };

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-14 pb-28">
          <div className="flex items-center gap-3 mb-2">
            <BackButton />
            <h1 className="text-2xl font-display font-black text-foreground">Express Clean</h1>
          </div>

          {/* Express pill */}
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

          {/* Services */}
          {category && (
            <section className="mb-6">
              <button onClick={() => { setCategory(null); setSelected(null); }} className="text-xs text-primary font-bold mb-3 flex items-center gap-1">← Categories</button>
              <div className="space-y-2.5">
                {services.map((svc, i) => (
                  <motion.button key={svc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    whileTap={{ scale: 0.98 }} onClick={() => setSelected(svc.id)}
                    className={`w-full text-left border rounded-3xl p-5 flex items-center gap-4 transition-all shadow-soft ${
                      selected === svc.id ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border bg-card'
                    }`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${selected === svc.id ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-foreground'}`}>
                      <svc.icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground text-sm">{svc.name}</h4>
                      <p className="text-[11px] text-muted-foreground">{svc.desc} · ~{svc.duration}h</p>
                    </div>
                    <span className="text-xl font-display font-black text-foreground">£{svc.price}</span>
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {/* Address */}
          {selected && (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mb-6">
              <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-2"><MapPin className="h-4 w-4" strokeWidth={1.5} /> Address</h3>
              <Input placeholder="Postcode" value={postcode} onChange={e => setPostcode(e.target.value)} className="h-13 rounded-2xl border-2 border-border bg-card text-base" />
              <Input placeholder="Address line" value={address} onChange={e => setAddress(e.target.value)} className="h-13 rounded-2xl border-2 border-border bg-card text-base" />
            </motion.section>
          )}

          {/* Summary */}
          {selected && service && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-foreground rounded-3xl p-5 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-background/50">{service.name}</span>
                  <span className="text-background">~{service.duration}h</span>
                </div>
                <div className="flex justify-between font-display font-black text-2xl">
                  <span className="text-background">Total</span>
                  <span className="text-primary">£{service.price}</span>
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
                  <p className="text-sm text-muted-foreground">£{service.price} for {service.name}</p>
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
