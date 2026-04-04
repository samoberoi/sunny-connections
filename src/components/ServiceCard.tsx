import { Sparkles, Home, UtensilsCrossed, LayoutGrid, Shirt, Bed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const iconMap: Record<string, any> = {
  Sparkles, Home, ChefHat: UtensilsCrossed, LayoutGrid, Shirt, Bed,
};

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
  index?: number;
}

export default function ServiceCard({ service, onBook, index = 0 }: ServiceCardProps) {
  const Icon = iconMap[service.icon] || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileTap={{ scale: 0.98 }}
      className="border border-border rounded-2xl p-5 flex items-start gap-4 hover:bg-muted/30 transition-colors"
    >
      <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground text-sm">{service.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-display font-black text-foreground">£{service.ratePerHour}</span>
            <span className="text-xs text-muted-foreground">/hr</span>
          </div>
          <Button size="sm" onClick={onBook} className="rounded-xl font-semibold text-xs h-8 px-4">
            Book
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
