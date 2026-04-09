import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceRow {
  id: string;
  name: string;
  description: string;
  category: 'cleaning' | 'housekeeping';
  rate_per_hour: number;
  min_duration: number;
  max_duration: number;
  icon: string;
  active: boolean;
  service_mode: 'express' | 'scheduled' | 'both';
}

export function useServicesByMode(mode: 'express' | 'scheduled') {
  return useQuery({
    queryKey: ['services', mode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .in('service_mode', [mode, 'both'])
        .order('name');
      if (error) throw error;
      return data as ServiceRow[];
    },
  });
}

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('name');
      if (error) throw error;
      return data as ServiceRow[];
    },
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ServiceRow;
    },
    enabled: !!id,
  });
}
