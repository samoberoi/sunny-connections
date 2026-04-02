import { Service } from '@/types';
import { Sparkles, Home, ChefHat, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, any> = { Sparkles, Home, ChefHat, LayoutGrid, Shirt: Sparkles, Bed: Home };

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
}

export default function ServiceCard({ service, onBook }: ServiceCardProps) {
  const Icon = iconMap[service.icon] || Sparkles;
  return (
    <div className="glass-card rounded-xl p-4 flex items-start gap-4 transition-all hover:shadow-md">
      <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-foreground">{service.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-foreground">£{service.ratePerHour}</span>
            <span className="text-xs text-muted-foreground">/hr</span>
          </div>
          <Button size="sm" onClick={() => onBook(service)} className="gradient-primary text-primary-foreground">
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
