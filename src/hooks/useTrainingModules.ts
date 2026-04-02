import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTrainingModules() {
  return useQuery({
    queryKey: ['training-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_modules')
        .select('*')
        .order('level')
        .order('module_number');
      if (error) throw error;
      return data;
    },
  });
}
