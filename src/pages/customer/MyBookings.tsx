import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CustomerLayout from '@/components/layout/CustomerLayout';
import StarRating from '@/components/StarRating';
import { bookings } from '@/data/mockData';

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  assigned: 'bg-accent text-accent-foreground',
  'en-route': 'bg-secondary/20 text-secondary-foreground',
  'otp-verified': 'bg-primary/20 text-primary',
  'in-progress': 'bg-secondary text-secondary-foreground',
  completed: 'bg-primary text-primary-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

export default function MyBookings() {
  const navigate = useNavigate();
  const upcoming = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const past = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  return (
    <CustomerLayout>
      <div className="px-6 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-muted"><ArrowLeft className="h-4 w-4" /></button>
          <h1 className="font-display text-xl font-semibold text-foreground">My Bookings</h1>
        </div>

        {upcoming.length > 0 && (
          <section className="mb-6">
            <h3 className="font-display font-semibold text-foreground mb-3">Upcoming</h3>
            <div className="space-y-3">
              {upcoming.map(b => (
                <div key={b.id} className="glass-card rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-foreground">{b.serviceName}</h4>
                    <Badge className={statusColors[b.status]}>{b.status.replace('-', ' ')}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Clock className="h-3 w-3" /> {b.date} at {b.time} · {b.duration}h
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {b.address.line1}, {b.address.postcode}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Cleaner: {b.cleanerName}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h3 className="font-display font-semibold text-foreground mb-3">Past</h3>
            <div className="space-y-3">
              {past.map(b => (
                <div key={b.id} className="glass-card rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-foreground">{b.serviceName}</h4>
                    <Badge className={statusColors[b.status]}>{b.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{b.date} · {b.cleanerName}</p>
                  {b.rating && <div className="mt-2"><StarRating rating={b.rating} readonly size="sm" /></div>}
                  {b.review && <p className="text-xs text-muted-foreground mt-1">"{b.review}"</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </CustomerLayout>
  );
}
