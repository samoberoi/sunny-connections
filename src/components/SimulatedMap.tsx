import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, User, Sparkles } from 'lucide-react';

interface MapMarker {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'cleaner' | 'client' | 'self';
  pulse?: boolean;
}

interface SimulatedMapProps {
  markers: MapMarker[];
  height?: number;
  className?: string;
  showGrid?: boolean;
  children?: React.ReactNode;
}

const STREET_PATHS = [
  'M 0 40 L 100 40',
  'M 0 65 L 100 65',
  'M 25 0 L 25 100',
  'M 55 0 L 55 100',
  'M 80 0 L 80 100',
  'M 0 20 L 40 20',
  'M 60 85 L 100 85',
];

export default function SimulatedMap({ markers, height = 200, className = '', showGrid = true, children }: SimulatedMapProps) {
  const [animatedMarkers, setAnimatedMarkers] = useState(markers);

  useEffect(() => {
    setAnimatedMarkers(markers);
    const interval = setInterval(() => {
      setAnimatedMarkers(prev =>
        prev.map(m => m.type === 'self' ? m : ({
          ...m,
          x: Math.max(5, Math.min(95, m.x + (Math.random() - 0.5) * 3)),
          y: Math.max(5, Math.min(95, m.y + (Math.random() - 0.5) * 3)),
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [markers]);

  return (
    <div className={`relative overflow-hidden bg-muted/30 ${className}`} style={{ height }}>
      {/* Map background grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 100 100" preserveAspectRatio="none">
        {showGrid && STREET_PATHS.map((d, i) => (
          <path key={i} d={d} stroke="currentColor" strokeWidth="0.5" fill="none" className="text-foreground" />
        ))}
        {/* Area blocks */}
        <rect x="5" y="5" width="15" height="12" rx="2" className="fill-foreground/30" />
        <rect x="30" y="45" width="20" height="15" rx="2" className="fill-foreground/20" />
        <rect x="60" y="10" width="15" height="8" rx="2" className="fill-foreground/20" />
        <rect x="5" y="70" width="18" height="10" rx="2" className="fill-foreground/30" />
        <rect x="82" y="42" width="14" height="20" rx="2" className="fill-foreground/20" />
        <rect x="35" y="22" width="12" height="10" rx="2" className="fill-foreground/10" />
        <rect x="65" y="70" width="10" height="12" rx="2" className="fill-foreground/10" />
      </svg>

      {/* Street labels */}
      <div className="absolute top-[38%] left-3 text-[7px] text-muted-foreground/40 font-medium tracking-wider">KINGS RD</div>
      <div className="absolute top-[62%] right-3 text-[7px] text-muted-foreground/40 font-medium tracking-wider">HIGH ST</div>
      <div className="absolute bottom-3 left-[23%] text-[7px] text-muted-foreground/40 font-medium tracking-wider rotate-90 origin-bottom-left">PARK LN</div>

      {/* Markers */}
      <AnimatePresence>
        {animatedMarkers.map(marker => (
          <motion.div
            key={marker.id}
            className="absolute z-10"
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            animate={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          >
            {marker.pulse && (
              <motion.div
                className="absolute -inset-3 rounded-full bg-primary/20"
                animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <div className={`relative flex items-center justify-center rounded-full shadow-lg
              ${marker.type === 'cleaner' ? 'w-8 h-8 bg-primary' : ''}
              ${marker.type === 'client' ? 'w-7 h-7 bg-foreground' : ''}
              ${marker.type === 'self' ? 'w-9 h-9 bg-primary border-2 border-primary-foreground' : ''}
            `}>
              {marker.type === 'cleaner' && <Sparkles className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2} />}
              {marker.type === 'client' && <User className="h-3 w-3 text-background" strokeWidth={2} />}
              {marker.type === 'self' && <Navigation className="h-4 w-4 text-primary-foreground" strokeWidth={2} />}
            </div>
            {marker.label && (
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full
                  ${marker.type === 'cleaner' ? 'bg-primary/90 text-primary-foreground' : ''}
                  ${marker.type === 'client' ? 'bg-foreground/90 text-background' : ''}
                  ${marker.type === 'self' ? 'bg-primary text-primary-foreground' : ''}
                `}>{marker.label}</span>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {children}
    </div>
  );
}

export function generateCleanerMarkers(count: number): MapMarker[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `cleaner-${i}`,
    x: 15 + Math.random() * 70,
    y: 15 + Math.random() * 65,
    label: `Pro ${i + 1}`,
    type: 'cleaner' as const,
    pulse: i === 0,
  }));
}

export function generateClientMarkers(count: number): MapMarker[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `client-${i}`,
    x: 10 + Math.random() * 75,
    y: 10 + Math.random() * 70,
    label: `Client ${i + 1}`,
    type: 'client' as const,
    pulse: i < 2,
  }));
}
