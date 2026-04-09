import { Coins, ArrowUpCircle, ArrowDownCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function Wallet() {
  const { user } = useAuth();

  const { data: coins } = useQuery({
    queryKey: ['my-coins', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('customer_coins').select('*').eq('customer_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['my-coin-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('coin_transactions').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }).limit(50);
      return data || [];
    },
    enabled: !!user?.id,
  });

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6 space-y-5">
          <div className="flex items-center gap-3">
            <BackButton to="/profile" />
            <h1 className="text-2xl font-display font-black text-foreground">Wallet</h1>
          </div>

          {/* Balance card */}
          <div className="bg-foreground rounded-3xl p-6 text-center">
            <Coins className="h-8 w-8 mx-auto mb-2 text-primary" strokeWidth={1.5} />
            <p className="text-[10px] text-background/40 font-bold uppercase tracking-wider mb-1">Your Balance</p>
            <div className="text-5xl font-display font-black text-primary">{coins?.balance || 0}</div>
            <p className="text-xs text-background/40 mt-1">CleanFit Coins</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-3xl p-4 text-center shadow-soft border border-border">
              <ArrowUpCircle className="h-4 w-4 mx-auto mb-2 text-primary" strokeWidth={1.5} />
              <div className="text-xl font-display font-black text-foreground">{coins?.total_earned || 0}</div>
              <div className="text-[9px] text-muted-foreground font-medium">Total Earned</div>
            </div>
            <div className="bg-card rounded-3xl p-4 text-center shadow-soft border border-border">
              <ArrowDownCircle className="h-4 w-4 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
              <div className="text-xl font-display font-black text-foreground">{coins?.total_spent || 0}</div>
              <div className="text-[9px] text-muted-foreground font-medium">Total Spent</div>
            </div>
          </div>

          {/* How coins work */}
          <div className="bg-primary/10 rounded-3xl p-5 border border-primary/20">
            <h3 className="font-display font-bold text-foreground text-sm mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" /> How Coins Work
            </h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>• <strong>Earn 1 coin</strong> for every £5 spent on a completed booking</li>
              <li>• <strong>Earn 50 coins</strong> when a referred friend completes their first booking</li>
              <li>• <strong>Redeem coins</strong> at checkout for discounts (10 coins = £1 off)</li>
            </ul>
          </div>

          {/* Transaction History */}
          <div className="bg-card rounded-3xl p-5 shadow-soft border border-border">
            <h3 className="font-display font-bold text-foreground text-sm mb-3">Transaction History</h3>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-hide">
                {transactions.map((tx: any) => (
                  <motion.div key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'earn' ? 'bg-primary/15' : 'bg-muted'}`}>
                        {tx.type === 'earn' ? (
                          <ArrowUpCircle className="h-4 w-4 text-primary" strokeWidth={1.5} />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{tx.description || (tx.type === 'earn' ? 'Earned' : 'Spent')}</p>
                        <p className="text-[10px] text-muted-foreground">{format(new Date(tx.created_at), 'dd MMM yyyy, HH:mm')}</p>
                      </div>
                    </div>
                    <span className={`font-display font-black text-sm ${tx.type === 'earn' ? 'text-primary' : 'text-foreground'}`}>
                      {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
