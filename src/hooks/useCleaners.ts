import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CleanerRow {
  id: string;
  name: string;
  avatar: string | null;
  rating: number;
  review_count: number;
  experience: number;
  specialisations: string[];
  verified: boolean;
  available: boolean;
}

export function useCleaners() {
  return useQuery({
    queryKey: ['cleaners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cleaners')
        .select('*')
        .order('rating', { ascending: false });
      if (error) throw error;
      return data as CleanerRow[];
    },
  });
}
