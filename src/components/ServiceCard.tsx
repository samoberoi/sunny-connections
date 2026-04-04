import { Sparkles, Home, ChefHat, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, any> = { Sparkles, Home, ChefHat, LayoutGrid, Shirt: Sparkles, Bed: Home };

interface ServiceCardService {
  id: string;
  name: string;
  description: string;
  category: string;
  ratePerHour: number;
  minDuration: number;
  maxDuration: number;
  icon: string;
}

interface ServiceCardProps {
  service: ServiceCardService;
  onBook: () => void;
}

export default function ServiceCard({ service, onBook }: ServiceCardProps) {
  const Icon = iconMap[service.icon] || Sparkles;
  return (
    <div className="glass-card rounded-2xl p-5 flex items-start gap-4 shadow-apple hover:shadow-apple-lg transition-all">
      <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shrink-0">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-foreground">{service.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-xl font-extrabold text-foreground">£{service.ratePerHour}</span>
            <span className="text-xs text-muted-foreground">/hr</span>
          </div>
          <Button size="sm" onClick={onBook} className="gradient-blue text-primary-foreground rounded-xl shadow-blue/30 font-semibold">
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
