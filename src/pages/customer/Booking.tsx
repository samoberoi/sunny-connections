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
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-muted"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="text-xl font-bold text-foreground">Book {service.name}</h1>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" /> Select Date
            </h3>
            <div className="glass-card rounded-2xl p-3 shadow-apple">
              <Calendar mode="single" selected={date} onSelect={setDate} className="mx-auto" />
            </div>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Select Time
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map(t => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${time === t ? 'gradient-blue text-primary-foreground shadow-blue/30' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Duration
            </h3>
            <div className="flex gap-2">
              {Array.from({ length: Math.min(service.maxDuration - service.minDuration + 1, 6) }, (_, i) => service.minDuration + i).map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${duration === d ? 'gradient-blue text-primary-foreground shadow-blue/30' : 'bg-muted text-muted-foreground'}`}
                >
                  {d}h
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Repeat className="h-4 w-4 text-primary" /> Frequency
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {([['none', 'One-time'], ['weekly', 'Weekly'], ['fortnightly', 'Fortnightly'], ['monthly', 'Monthly']] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setRecurring(val)}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${recurring === val ? 'gradient-blue text-primary-foreground shadow-blue/30' : 'bg-muted text-muted-foreground'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Address
            </h3>
            <div className="space-y-2">
              <Input placeholder="Postcode (e.g. SW1A 1AA)" value={postcode} onChange={e => setPostcode(e.target.value)} className="h-12 rounded-xl bg-muted/50 border-0" />
              <Input placeholder="Address line" value={address} onChange={e => setAddress(e.target.value)} className="h-12 rounded-xl bg-muted/50 border-0" />
            </div>
          </section>

          <div className="glass-card rounded-2xl p-5 shadow-apple">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">{service.name}</span>
              <span className="text-foreground">£{service.ratePerHour}/hr × {duration}h</span>
            </div>
            <div className="flex justify-between font-extrabold text-xl">
              <span>Total</span>
              <span className="text-gradient">£{totalCost}</span>
            </div>
          </div>

          <Button onClick={handleConfirm} className="w-full h-14 text-base font-semibold gradient-blue text-primary-foreground rounded-2xl shadow-blue">
            Confirm Booking
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
}
