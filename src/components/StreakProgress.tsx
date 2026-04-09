import { motion } from 'framer-motion';
import { Flame, Gift } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const STREAK_TARGET = 10;

export default function StreakProgress() {
  const { user } = useAuth();
  const currentMonth = new Date().toISOString().slice(0, 7); // '2026-04'

  const { data: streak } = useQuery({
    queryKey: ['customer-streak', user?.id, currentMonth],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('customer_streaks')
        .select('*')
        .eq('customer_id', user.id)
        .eq('month', currentMonth)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const count = streak?.booking_count || 0;
  const progress = Math.min((count / STREAK_TARGET) * 100, 100);
  const freeEarned = streak?.free_clean_earned || false;

  if (count === 0 && !freeEarned) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-5 ${freeEarned ? 'bg-primary' : 'bg-card border border-border shadow-soft'}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className={`h-5 w-5 ${freeEarned ? 'text-primary-foreground' : 'text-primary-ink'}`} strokeWidth={1.5} />
          <h3 className={`font-display font-bold text-sm ${freeEarned ? 'text-primary-foreground' : 'text-foreground'}`}>
            {freeEarned ? '🎉 Free Clean Earned!' : 'Monthly Streak'}
          </h3>
        </div>
        <span className={`text-xs font-bold ${freeEarned ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
          {count}/{STREAK_TARGET}
        </span>
      </div>
      {!freeEarned && (
        <>
          <Progress value={progress} className="h-2 mb-2" />
          <p className="text-[10px] text-muted-foreground">
            {STREAK_TARGET - count} more cleans this month for a free service!
          </p>
        </>
      )}
      {freeEarned && !streak?.free_clean_redeemed && (
        <div className="flex items-center gap-2 mt-1">
          <Gift className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
          <p className="text-xs text-primary-foreground/80 font-medium">Apply your free clean on your next booking</p>
        </div>
      )}
    </motion.div>
  );
}
