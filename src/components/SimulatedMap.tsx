import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, User, Sparkles } from 'lucide-react';

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

// Cheltenham, UK - OpenStreetMap static tiles composited
const MAP_BG_URL = 'https://tile.openstreetmap.org/14/8108/5426.png';

export default function SimulatedMap({ markers, height = 200, className = '', children }: SimulatedMapProps) {
  const [animatedMarkers, setAnimatedMarkers] = useState(markers);

  useEffect(() => {
    setAnimatedMarkers(markers);
    const interval = setInterval(() => {
      setAnimatedMarkers(prev =>
        prev.map(m => m.type === 'self' ? m : ({
          ...m,
          x: Math.max(5, Math.min(95, m.x + (Math.random() - 0.5) * 2.5)),
          y: Math.max(5, Math.min(95, m.y + (Math.random() - 0.5) * 2.5)),
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [markers]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      {/* Real map tiles background - Cheltenham area */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
        {[
          { z: 14, x: 8107, y: 5425 },
          { z: 14, x: 8108, y: 5425 },
          { z: 14, x: 8109, y: 5425 },
          { z: 14, x: 8107, y: 5426 },
          { z: 14, x: 8108, y: 5426 },
          { z: 14, x: 8109, y: 5426 },
          { z: 14, x: 8107, y: 5427 },
          { z: 14, x: 8108, y: 5427 },
          { z: 14, x: 8109, y: 5427 },
        ].map((tile, i) => (
          <img
            key={i}
            src={`https://tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
            draggable={false}
          />
        ))}
      </div>

      {/* Slight tint overlay to match app theme */}
      <div className="absolute inset-0 bg-background/10" />

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
                className="absolute -inset-3 rounded-full bg-primary/30"
                animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <div className={`relative flex items-center justify-center rounded-full shadow-lg border-2 border-white
              ${marker.type === 'cleaner' ? 'w-9 h-9 bg-primary' : ''}
              ${marker.type === 'client' ? 'w-8 h-8 bg-foreground' : ''}
              ${marker.type === 'self' ? 'w-10 h-10 bg-primary border-primary-foreground' : ''}
            `}>
              {marker.type === 'cleaner' && <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2} />}
              {marker.type === 'client' && <User className="h-3.5 w-3.5 text-background" strokeWidth={2} />}
              {marker.type === 'self' && <Navigation className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2} />}
            </div>
            {marker.label && (
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-md
                  ${marker.type === 'cleaner' ? 'bg-primary text-primary-foreground' : ''}
                  ${marker.type === 'client' ? 'bg-foreground text-background' : ''}
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
