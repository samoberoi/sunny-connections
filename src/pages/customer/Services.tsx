import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CustomerLayout from '@/components/layout/CustomerLayout';
import ServiceCard from '@/components/ServiceCard';
import { useServices, ServiceRow } from '@/hooks/useServices';
import { Skeleton } from '@/components/ui/skeleton';

export default function Services() {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';
  const [category, setCategory] = useState<string>(initialCat);
  const navigate = useNavigate();
  const { data: services, isLoading } = useServices();

  const filtered = !services ? [] : category === 'all' ? services : services.filter(s => s.category === category);

  const handleBook = (service: ServiceRow) => {
    navigate(`/booking?service=${service.id}`);
  };

  // Adapt ServiceRow to the shape ServiceCard expects
  const toServiceCardProps = (s: ServiceRow) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    category: s.category,
    ratePerHour: s.rate_per_hour,
    minDuration: s.min_duration,
    maxDuration: s.max_duration,
    icon: s.icon,
  });

  return (
    <CustomerLayout>
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="text-xl font-bold text-foreground">Our Services</h1>
        </div>

        <div className="flex gap-2 p-1 bg-muted rounded-2xl mb-6">
          {['all', 'cleaning', 'housekeeping'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                category === cat
                  ? 'bg-card shadow-apple text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>

        <div className="space-y-3 pb-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))
          ) : (
            filtered.map(service => (
              <ServiceCard key={service.id} service={toServiceCardProps(service)} onBook={() => handleBook(service)} />
            ))
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
