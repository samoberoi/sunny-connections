import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CustomerLayout from '@/components/layout/CustomerLayout';
import StarRating from '@/components/StarRating';
import { bookings } from '@/data/mockData';

const statusColors: Record<string, string> = {
  pending: 'bg-secondary-foreground/10 text-secondary-foreground/60',
  assigned: 'bg-primary/15 text-primary',
  'en-route': 'bg-primary/20 text-primary',
  'otp-verified': 'bg-primary/25 text-primary',
  'in-progress': 'bg-primary/30 text-primary',
  completed: 'bg-primary text-primary-foreground',
  cancelled: 'bg-destructive/15 text-destructive',
};

export default function MyBookings() {
  const navigate = useNavigate();
  const upcoming = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const past = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  return (
    <CustomerLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-secondary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-secondary-foreground">My Bookings</h1>
        </div>

        {upcoming.length > 0 && (
          <section className="mb-6">
            <h3 className="font-bold text-secondary-foreground mb-3">Upcoming</h3>
            <div className="space-y-3">
              {upcoming.map(b => (
                <div key={b.id} className="glass rounded-2xl p-4 border border-secondary-foreground/5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-secondary-foreground">{b.serviceName}</h4>
                    <Badge className={`${statusColors[b.status]} text-xs rounded-lg border-0`}>{b.status.replace('-', ' ')}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-secondary-foreground/40 mb-1">
                    <Clock className="h-3 w-3" /> {b.date} at {b.time} · {b.duration}h
                  </div>
                  <div className="flex items-center gap-2 text-xs text-secondary-foreground/40">
                    <MapPin className="h-3 w-3" /> {b.address.line1}, {b.address.postcode}
                  </div>
                  <p className="text-xs text-secondary-foreground/30 mt-2">Cleaner: {b.cleanerName}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h3 className="font-bold text-secondary-foreground mb-3">Past</h3>
            <div className="space-y-3">
              {past.map(b => (
                <div key={b.id} className="glass rounded-2xl p-4 border border-secondary-foreground/5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-secondary-foreground">{b.serviceName}</h4>
                    <Badge className={`${statusColors[b.status]} text-xs rounded-lg border-0`}>{b.status}</Badge>
                  </div>
                  <p className="text-xs text-secondary-foreground/40">{b.date} · {b.cleanerName}</p>
                  {b.rating && <div className="mt-2"><StarRating rating={b.rating} readonly size="sm" /></div>}
                  {b.review && <p className="text-xs text-secondary-foreground/30 mt-1 italic">"{b.review}"</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </CustomerLayout>
  );
}
