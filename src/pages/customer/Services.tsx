import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, ChevronRight, Sparkles, Home, ShowerHead, Truck, Brush, UtensilsCrossed, Wind, WashingMachine, Bed, Sofa, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import { useServices } from '@/hooks/useServices';

const iconMap: Record<string, any> = {
  Sparkles, Home, ShowerHead, Truck, Brush, UtensilsCrossed, Wind, WashingMachine, Bed, Sofa, Trash2, ChefHat: UtensilsCrossed, LayoutGrid: Brush,
};

const categories = [
  { key: 'all', label: 'All' },
  { key: 'cleaning', label: 'House Cleaning' },
  { key: 'housekeeping', label: 'Housekeeping' },
];

export default function Services() {
  const navigate = useNavigate();
  const { data: services = [], isLoading } = useServices();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    return services.filter(s => {
      const matchCat = category === 'all' || s.category === category;
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [services, search, category]);

  const book = (serviceId: string, serviceName: string) => {
    navigate('/schedule-booking', { state: { preSelectedService: serviceId, preSelectedServiceName: serviceName } });
  };

  const modeLabel = (mode: string) => mode === 'express' ? '⚡ Express' : mode === 'scheduled' ? '📅 Scheduled' : '🔄 Both';

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-14 pb-6 space-y-5">
          <div className="flex items-center gap-3">
            <BackButton to="/home" />
            <h1 className="text-2xl font-display font-black text-foreground">Services</h1>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} className="pl-11 h-12 rounded-2xl bg-card border-border" />
          </div>

          <div className="flex gap-2">
            {categories.map(c => (
              <button key={c.key} onClick={() => setCategory(c.key)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                  category === c.key ? 'bg-foreground text-background' : 'bg-card border border-border text-muted-foreground'
                }`}>
                {c.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 bg-card rounded-3xl animate-pulse border border-border" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No services found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((service, i) => {
                const IconComp = iconMap[service.icon] || Sparkles;
                return (
                  <motion.button key={service.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.98 }} onClick={() => book(service.id, service.name)}
                    className="w-full bg-card rounded-3xl p-5 shadow-soft border border-border text-left flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                      <IconComp className="h-6 w-6 text-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-foreground text-sm">{service.name}</h3>
                        <Badge variant="secondary" className="text-[8px] rounded-md shrink-0">{modeLabel((service as any).service_mode || 'both')}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{service.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-black text-foreground">From £{service.rate_per_hour}/hr</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" strokeWidth={1.5} />
                          {service.min_duration}–{service.max_duration}h
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
