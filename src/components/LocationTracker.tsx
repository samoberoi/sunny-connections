import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

// Broadcasts cleaner's location every 10s when online
export default function LocationTracker() {
  const { user } = useAuth();
  const watchRef = useRef<number | null>(null);

  const { data: cleanerRecord } = useQuery({
    queryKey: ['my-cleaner-record-loc', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('cleaners').select('id, available').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!cleanerRecord?.id || !cleanerRecord.available) {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
      return;
    }

    const updateLocation = (pos: GeolocationPosition) => {
      supabase.from('cleaner_locations').upsert({
        cleaner_id: cleanerRecord.id,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'cleaner_id' });
    };

    // Use watchPosition for continuous updates
    if ('geolocation' in navigator) {
      watchRef.current = navigator.geolocation.watchPosition(
        updateLocation,
        () => {}, // silently fail
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    }

    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
    };
  }, [cleanerRecord?.id, cleanerRecord?.available]);

  return null; // Headless component
}
