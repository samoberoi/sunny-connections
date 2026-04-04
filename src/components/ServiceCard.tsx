import { Sparkles, Home, ChefHat, LayoutGrid } from 'lucide-react';

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
    <div className="glass rounded-2xl p-5 flex items-start gap-4 border border-secondary-foreground/5 hover:border-primary/20 transition-all">
      <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-secondary-foreground">{service.name}</h3>
        <p className="text-xs text-secondary-foreground/40 mt-1 line-clamp-2">{service.description}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-xl font-extrabold text-secondary-foreground">£{service.ratePerHour}</span>
            <span className="text-xs text-secondary-foreground/40">/hr</span>
          </div>
          <button onClick={onBook} className="gradient-lime text-primary-foreground rounded-xl px-4 py-2 text-xs font-bold shadow-lime/30">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
