import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, CalendarDays, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { services } from '@/data/mockData';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('service') || 's1';
  const service = services.find(s => s.id === serviceId) || services[0];
  const navigate = useNavigate();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(service.minDuration);
  const [recurring, setRecurring] = useState<'none' | 'weekly' | 'fortnightly' | 'monthly'>('none');
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');

  const totalCost = service.ratePerHour * duration;

  const handleConfirm = () => {
    navigate('/booking-confirmation', {
      state: { service, date: date?.toISOString(), time, duration, recurring, address, postcode, totalCost }
    });
  };

  return (
    <CustomerLayout>
      <div className="px-6 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-muted"><ArrowLeft className="h-4 w-4" /></button>
          <h1 className="font-display text-xl font-semibold text-foreground">Book {service.name}</h1>
        </div>

        <div className="space-y-6">
          {/* Date */}
          <section>
            <h3 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" /> Select Date
            </h3>
            <div className="glass-card rounded-xl p-3">
              <Calendar mode="single" selected={date} onSelect={setDate} className="mx-auto" />
            </div>
          </section>

          {/* Time */}
          <section>
            <h3 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Select Time
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map(t => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${time === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          {/* Duration */}
          <section>
            <h3 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Duration
            </h3>
            <div className="flex gap-2">
              {Array.from({ length: service.maxDuration - service.minDuration + 1 }, (_, i) => service.minDuration + i).slice(0, 6).map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${duration === d ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  {d}h
                </button>
              ))}
            </div>
          </section>

          {/* Recurring */}
          <section>
            <h3 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
              <Repeat className="h-4 w-4 text-primary" /> Frequency
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {([['none', 'One-time'], ['weekly', 'Weekly'], ['fortnightly', 'Fortnightly'], ['monthly', 'Monthly']] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setRecurring(val)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${recurring === val ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Address */}
          <section>
            <h3 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Address
            </h3>
            <div className="space-y-2">
              <Input placeholder="Postcode (e.g. SW1A 1AA)" value={postcode} onChange={e => setPostcode(e.target.value)} />
              <Input placeholder="Address line" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
          </section>

          {/* Summary */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">{service.name}</span>
              <span className="text-foreground">£{service.ratePerHour}/hr × {duration}h</span>
            </div>
            <div className="flex justify-between font-display font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">£{totalCost}</span>
            </div>
          </div>

          <Button onClick={handleConfirm} className="w-full gradient-primary text-primary-foreground h-12 text-base font-semibold">
            Confirm Booking
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
}
