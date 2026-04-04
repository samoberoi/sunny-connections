import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CustomerLayout from '@/components/layout/CustomerLayout';
import ServiceCard from '@/components/ServiceCard';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import EmptyState from '@/components/EmptyState';
import { useServices, ServiceRow } from '@/hooks/useServices';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchX } from 'lucide-react';

export default function Services() {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';
  const [category, setCategory] = useState<string>(initialCat);
  const navigate = useNavigate();
  const { data: services, isLoading } = useServices();

  const filtered = !services ? [] : category === 'all' ? services : services.filter(s => s.category === category);

  const handleBook = (service: ServiceRow) => navigate(`/booking?service=${service.id}`);

  const toServiceCardProps = (s: ServiceRow) => ({
    id: s.id, name: s.name, description: s.description, category: s.category,
    ratePerHour: s.rate_per_hour, minDuration: s.min_duration, maxDuration: s.max_duration, icon: s.icon,
  });

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <BackButton />
            <h1 className="text-xl font-display font-black text-foreground">Our Services</h1>
          </div>

          <div className="flex gap-2 p-1 border border-border rounded-2xl mb-6">
            {['all', 'cleaning', 'housekeeping'].map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all duration-200 ${
                  category === cat ? 'bg-foreground text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}>
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>

          <div className="space-y-3 pb-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-28 rounded-2xl" />))
            ) : filtered.length === 0 ? (
              <EmptyState icon={SearchX} title="No services found" description="Try a different category" />
            ) : (
              filtered.map((service, i) => (
                <ServiceCard key={service.id} service={toServiceCardProps(service)} onBook={() => handleBook(service)} index={i} />
              ))
            )}
          </div>
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
