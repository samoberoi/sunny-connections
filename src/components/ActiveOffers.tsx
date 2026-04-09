import { motion } from 'framer-motion';
import { Gift, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useState } from 'react';

interface ActiveOffersProps {
  onApplyOffer: (discount: number) => void;
}

export default function ActiveOffers({ onApplyOffer }: ActiveOffersProps) {
  const { user } = useAuth();
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const { data: offers = [] } = useQuery({
    queryKey: ['active-offers'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('offers')
        .select('*')
        .eq('active', true)
        .lte('valid_from', today)
        .gte('valid_until', today)
        .order('discount_percent', { ascending: false });
      return data || [];
    },
  });

  const { data: claimedOfferIds = [] } = useQuery({
    queryKey: ['my-offer-claims', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('offer_claims').select('offer_id').eq('customer_id', user.id);
      return data?.map(c => c.offer_id) || [];
    },
    enabled: !!user?.id,
  });

  const availableOffers = offers.filter(o => 
    !claimedOfferIds.includes(o.id) && 
    (o.max_claims === null || (o.claimed_count || 0) < (o.max_claims || 100))
  );

  if (availableOffers.length === 0) return null;

  const applyOffer = async (offer: any) => {
    if (appliedId === offer.id) {
      setAppliedId(null);
      onApplyOffer(0);
      return;
    }
    setAppliedId(offer.id);
    onApplyOffer(offer.discount_percent);

    // Claim the offer
    if (user?.id) {
      await supabase.from('offer_claims').insert({
        customer_id: user.id,
        offer_id: offer.id,
      });
      await supabase.from('offers').update({
        claimed_count: (offer.claimed_count || 0) + 1,
      }).eq('id', offer.id);
    }
    toast.success(`🎉 ${offer.discount_percent}% off applied!`);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
        <Gift className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} /> Available Offers
      </p>
      {availableOffers.slice(0, 3).map((offer, i) => (
        <motion.button
          key={offer.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => applyOffer(offer)}
          className={`w-full text-left rounded-2xl p-3 flex items-center gap-3 border transition-all ${
            appliedId === offer.id
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card hover:bg-muted/50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            appliedId === offer.id ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
          }`}>
            <span className="text-sm font-black">{offer.discount_percent}%</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground truncate">{offer.title}</p>
            <p className="text-[10px] text-muted-foreground truncate">{offer.description}</p>
          </div>
          {appliedId === offer.id && (
            <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={2} />
          )}
        </motion.button>
      ))}
    </div>
  );
}
