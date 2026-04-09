import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function useCoinBalance() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['coin-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return { balance: 0, total_earned: 0, total_spent: 0 };
      const { data } = await supabase.from('customer_coins').select('*').eq('customer_id', user.id).maybeSingle();
      return data || { balance: 0, total_earned: 0, total_spent: 0 };
    },
    enabled: !!user?.id,
  });
}

export default function CoinBalance() {
  const { data: coins } = useCoinBalance();
  const balance = coins?.balance || 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Coins className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CleanFit Coins</p>
          <p className="text-lg font-display font-black text-foreground">{balance} <span className="text-xs font-normal text-muted-foreground">coins</span></p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] text-muted-foreground">Worth</p>
        <p className="text-sm font-bold text-amber-600">£{(balance / 10).toFixed(2)}</p>
      </div>
    </motion.div>
  );
}
