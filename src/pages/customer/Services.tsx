import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/components/layout/CustomerLayout';
import ServiceCard from '@/components/ServiceCard';
import { services } from '@/data/mockData';
import { Service } from '@/types';

export default function Services() {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';
  const [category, setCategory] = useState<string>(initialCat);
  const navigate = useNavigate();

  const filtered = category === 'all' ? services : services.filter(s => s.category === category);

  const handleBook = (service: Service) => {
    navigate(`/booking?service=${service.id}`);
  };

  return (
    <CustomerLayout>
      <div className="px-6 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-muted"><ArrowLeft className="h-4 w-4" /></button>
          <h1 className="font-display text-xl font-semibold text-foreground">Our Services</h1>
        </div>

        <div className="flex gap-2 mb-6">
          {['all', 'cleaning', 'housekeeping'].map(cat => (
            <Button
              key={cat}
              size="sm"
              variant={category === cat ? 'default' : 'outline'}
              onClick={() => setCategory(cat)}
              className={category === cat ? 'gradient-primary text-primary-foreground' : ''}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>

        <div className="space-y-3 pb-6">
          {filtered.map(service => (
            <ServiceCard key={service.id} service={service} onBook={handleBook} />
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
}
