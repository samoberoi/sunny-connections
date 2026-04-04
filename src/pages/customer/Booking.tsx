import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, CalendarDays, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import CustomerLayout from '@/components/layout/CustomerLayout';
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
          <Skeleton className="h-8 w-48 bg-secondary-foreground/5" />
          <Skeleton className="h-64 rounded-2xl bg-secondary-foreground/5" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-secondary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-secondary-foreground">Book {service?.name}</h1>
        </div>

        <div className="space-y-6">
          {/* Date */}
          <section>
            <h3 className="font-bold text-secondary-foreground mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" /> Select Date
            </h3>
            <div className="glass rounded-2xl p-3 border border-secondary-foreground/5">
              <Calendar mode="single" selected={date} onSelect={setDate} className="mx-auto [&_.rdp-day_button]:text-secondary-foreground [&_.rdp-day_button.rdp-day_selected]:bg-primary [&_.rdp-day_button.rdp-day_selected]:text-primary-foreground" />
            </div>
          </section>

          {/* Time */}
          <section>
            <h3 className="font-bold text-secondary-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Select Time
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map(t => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${
                    time === t
                      ? 'gradient-lime text-primary-foreground shadow-lime/30'
                      : 'glass text-secondary-foreground/50 hover:text-secondary-foreground border border-secondary-foreground/5'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          {/* Duration */}
          <section>
            <h3 className="font-bold text-secondary-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Duration
            </h3>
            <div className="flex gap-2">
              {Array.from({ length: Math.min(maxDur - minDur + 1, 6) }, (_, i) => minDur + i).map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    duration === d
                      ? 'gradient-lime text-primary-foreground shadow-lime/30'
                      : 'glass text-secondary-foreground/50 border border-secondary-foreground/5'
                  }`}
                >
                  {d}h
                </button>
              ))}
            </div>
          </section>

          {/* Frequency */}
          <section>
            <h3 className="font-bold text-secondary-foreground mb-3 flex items-center gap-2">
              <Repeat className="h-4 w-4 text-primary" /> Frequency
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {([['none', 'One-time'], ['weekly', 'Weekly'], ['fortnightly', 'Fortnightly'], ['monthly', 'Monthly']] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setRecurring(val)}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${
                    recurring === val
                      ? 'gradient-lime text-primary-foreground shadow-lime/30'
                      : 'glass text-secondary-foreground/50 border border-secondary-foreground/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Address */}
          <section>
            <h3 className="font-bold text-secondary-foreground mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Address
            </h3>
            <div className="space-y-2">
              <Input placeholder="Postcode (e.g. SW1A 1AA)" value={postcode} onChange={e => setPostcode(e.target.value)} className="h-12 rounded-xl bg-secondary-foreground/5 border-secondary-foreground/10 text-secondary-foreground placeholder:text-secondary-foreground/20" />
              <Input placeholder="Address line" value={address} onChange={e => setAddress(e.target.value)} className="h-12 rounded-xl bg-secondary-foreground/5 border-secondary-foreground/10 text-secondary-foreground placeholder:text-secondary-foreground/20" />
            </div>
          </section>

          {/* Total */}
          <div className="glass rounded-2xl p-5 border border-secondary-foreground/5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-secondary-foreground/50">{service?.name}</span>
              <span className="text-secondary-foreground">£{ratePerHour}/hr × {duration}h</span>
            </div>
            <div className="flex justify-between font-extrabold text-xl">
              <span className="text-secondary-foreground">Total</span>
              <span className="text-gradient">£{totalCost}</span>
            </div>
          </div>

          <button onClick={handleConfirm} className="w-full h-14 text-base font-bold gradient-lime text-primary-foreground rounded-2xl shadow-lime">
            Confirm Booking
          </button>
        </div>
      </div>
    </CustomerLayout>
  );
}
