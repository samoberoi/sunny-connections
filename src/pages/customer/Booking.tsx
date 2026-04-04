import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, CalendarDays, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import { useService } from '@/hooks/useServices';
import { Skeleton } from '@/components/ui/skeleton';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('service') || '';
  const { data: service, isLoading } = useService(serviceId);
  const navigate = useNavigate();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(2);
  const [recurring, setRecurring] = useState<'none' | 'weekly' | 'fortnightly' | 'monthly'>('none');
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');

  const minDur = service?.min_duration || 2;
  const maxDur = service?.max_duration || 8;
  const ratePerHour = service?.rate_per_hour || 0;
  const totalCost = ratePerHour * duration;

  const handleConfirm = () => {
    if (!service) return;
    navigate('/booking-confirmation', {
      state: {
        service: { id: service.id, name: service.name, ratePerHour: service.rate_per_hour },
        date: date?.toISOString(),
        time, duration, recurring, address, postcode, totalCost,
      }
    });
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="px-5 pt-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
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
            <h1 className="text-xl font-bold text-foreground">Book {service?.name}</h1>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-primary" strokeWidth={1.5} /> Select Date
              </h3>
              <div className="glass-card rounded-2xl p-3 shadow-apple">
                <Calendar mode="single" selected={date} onSelect={setDate} className="mx-auto" />
              </div>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" strokeWidth={1.5} /> Select Time
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={`py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      time === t ? 'gradient-blue text-primary-foreground shadow-blue/30' : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" strokeWidth={1.5} /> Duration
              </h3>
              <div className="flex gap-2">
                {Array.from({ length: Math.min(maxDur - minDur + 1, 6) }, (_, i) => minDur + i).map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      duration === d ? 'gradient-blue text-primary-foreground shadow-blue/30' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {d}h
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                <Repeat className="h-4 w-4 text-primary" strokeWidth={1.5} /> Frequency
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {([['none', 'One-time'], ['weekly', 'Weekly'], ['fortnightly', 'Fortnightly'], ['monthly', 'Monthly']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setRecurring(val)}
                    className={`py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      recurring === val ? 'gradient-blue text-primary-foreground shadow-blue/30' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" strokeWidth={1.5} /> Address
              </h3>
              <div className="space-y-2">
                <Input placeholder="Postcode (e.g. SW1A 1AA)" value={postcode} onChange={e => setPostcode(e.target.value)} className="h-12 rounded-xl bg-muted/50 border-0" />
                <Input placeholder="Address line" value={address} onChange={e => setAddress(e.target.value)} className="h-12 rounded-xl bg-muted/50 border-0" />
              </div>
            </section>

            <div className="glass-card rounded-2xl p-5 shadow-apple">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">{service?.name}</span>
                <span className="text-foreground">£{ratePerHour}/hr × {duration}h</span>
              </div>
              <div className="flex justify-between font-extrabold text-xl">
                <span>Total</span>
                <span className="text-gradient">£{totalCost}</span>
              </div>
            </div>

            <Button onClick={handleConfirm} className="w-full h-14 text-base font-semibold gradient-blue text-primary-foreground rounded-2xl shadow-blue transition-opacity hover:opacity-95">
              Confirm Booking
            </Button>
          </div>
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
