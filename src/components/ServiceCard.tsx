import { Sparkles, Home, UtensilsCrossed, LayoutGrid, Shirt, Bed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const iconMap: Record<string, any> = {
  Sparkles, Home, ChefHat: UtensilsCrossed, LayoutGrid, Shirt, Bed,
};

const cardColors = [
  'gradient-neon',
  'gradient-pink',
  'gradient-cyan',
  'gradient-neon',
  'gradient-pink',
  'gradient-cyan',
];

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
  const color = cardColors[index % cardColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileTap={{ scale: 0.98 }}
      className={`${color} rounded-2xl p-5 flex items-start gap-4`}
    >
      <div className="w-12 h-12 rounded-2xl bg-foreground/10 flex items-center justify-center shrink-0">
        <Icon className="h-6 w-6 text-foreground" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-foreground text-sm">{service.name}</h3>
        <p className="text-xs text-foreground/60 mt-1 line-clamp-2">{service.description}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-display font-black text-foreground">£{service.ratePerHour}</span>
            <span className="text-xs text-foreground/50">/hr</span>
          </div>
          <Button size="sm" onClick={onBook} className="bg-foreground text-card rounded-xl font-bold text-xs h-8 px-4 hover:bg-foreground/90">
            Book
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
