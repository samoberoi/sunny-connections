import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, CalendarDays, Repeat, Home, Building2, Landmark, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import { useService } from '@/hooks/useServices';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('service') || '';
  const { data: service, isLoading } = useService(serviceId);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(2);
  const [recurring, setRecurring] = useState<'none' | 'weekly' | 'fortnightly' | 'monthly'>('none');
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('house');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const minDur = service?.min_duration || 2;
  const maxDur = service?.max_duration || 8;
  const ratePerHour = service?.rate_per_hour || 0;
  const totalCost = ratePerHour * duration;

  const propertyTypes = [
    { value: 'flat', label: 'Flat', icon: Building2 },
    { value: 'house', label: 'House', icon: Home },
    { value: 'office', label: 'Office', icon: Landmark },
  ];

  const handleConfirm = async () => {
    if (!service || !user || !date || !address || !postcode) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const { data: booking, error } = await supabase.from('bookings').insert({
        customer_id: user.id, customer_name: user.name,
        service_id: service.id, service_name: service.name,
        date: date.toISOString().split('T')[0], time, duration, recurring,
        address_line1: address, address_postcode: postcode, address_city: 'London',
        total_cost: totalCost, property_type: propertyType, notes: notes || null,
      }).select().single();
      if (error) throw error;
      navigate('/booking-confirmation', {
        state: {
          bookingId: booking.id,
          service: { id: service.id, name: service.name, ratePerHour: service.rate_per_hour },
          date: date.toISOString(), time, duration, recurring, address, postcode, totalCost,
          otp: booking.otp,
        }
      });
    } catch (err: any) {
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="px-5 pt-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <BackButton />
            <h1 className="text-2xl font-display font-black text-foreground">Book {service?.name}</h1>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                <Home className="h-4 w-4 text-accent-foreground" strokeWidth={1.5} /> Property Type
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {propertyTypes.map(pt => (
                  <motion.button key={pt.value} whileTap={{ scale: 0.97 }} onClick={() => setPropertyType(pt.value)}
                    className={`py-4 rounded-xl text-sm font-bold transition-all duration-200 flex flex-col items-center gap-2 ${
                      propertyType === pt.value ? 'gradient-neon text-foreground shadow-neon' : 'bg-muted text-muted-foreground'
                    }`}>
                    <pt.icon className="h-5 w-5" strokeWidth={1.5} />
                    {pt.label}
                  </motion.button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-accent-foreground" strokeWidth={1.5} /> Select Date
              </h3>
              <div className="bg-card rounded-2xl p-3 shadow-apple">
                <Calendar mode="single" selected={date} onSelect={setDate} className="mx-auto" />
              </div>
            </section>

            <section>
              <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-accent-foreground" strokeWidth={1.5} /> Select Time
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map(t => (
                  <motion.button key={t} whileTap={{ scale: 0.97 }} onClick={() => setTime(t)}
                    className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      time === t ? 'gradient-neon text-foreground shadow-neon' : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}>
                    {t}
                  </motion.button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-accent-foreground" strokeWidth={1.5} /> Duration
              </h3>
              <div className="flex gap-2">
                {Array.from({ length: Math.min(maxDur - minDur + 1, 6) }, (_, i) => minDur + i).map(d => (
                  <motion.button key={d} whileTap={{ scale: 0.97 }} onClick={() => setDuration(d)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      duration === d ? 'gradient-neon text-foreground shadow-neon' : 'bg-muted text-muted-foreground'
                    }`}>
                    {d}h
                  </motion.button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                <Repeat className="h-4 w-4 text-accent-foreground" strokeWidth={1.5} /> Frequency
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {([['none', 'One-time'], ['weekly', 'Weekly'], ['fortnightly', 'Fortnightly'], ['monthly', 'Monthly']] as const).map(([val, label]) => (
                  <motion.button key={val} whileTap={{ scale: 0.97 }} onClick={() => setRecurring(val)}
                    className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      recurring === val ? 'gradient-neon text-foreground shadow-neon' : 'bg-muted text-muted-foreground'
                    }`}>
                    {label}
                  </motion.button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-accent-foreground" strokeWidth={1.5} /> Address
              </h3>
              <div className="space-y-2">
                <Input placeholder="Postcode (e.g. SW1A 1AA)" value={postcode} onChange={e => setPostcode(e.target.value)} className="h-12 rounded-xl bg-muted/50 border-0" />
                <Input placeholder="Address line" value={address} onChange={e => setAddress(e.target.value)} className="h-12 rounded-xl bg-muted/50 border-0" />
              </div>
            </section>

            <section>
              <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                <StickyNote className="h-4 w-4 text-accent-foreground" strokeWidth={1.5} /> Special Instructions
              </h3>
              <Textarea placeholder="Leave key under mat, allergies, pet-friendly products..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="rounded-xl bg-muted/50 border-0 resize-none" />
            </section>

            <div className="bg-foreground rounded-2xl p-5 text-card">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-card/60">{service?.name}</span>
                <span>£{ratePerHour}/hr × {duration}h</span>
              </div>
              <div className="flex justify-between font-display font-black text-xl">
                <span>Total</span>
                <span className="text-primary">£{totalCost}</span>
              </div>
            </div>

            <Button onClick={handleConfirm} disabled={submitting || !address || !postcode}
              className="w-full h-14 text-base font-bold gradient-neon text-foreground rounded-2xl shadow-neon transition-opacity hover:opacity-95 disabled:opacity-50">
              {submitting ? 'Creating booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
