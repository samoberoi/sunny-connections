import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Share2, CircleCheck, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ReferralCard() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.id
    ? `CLEAN${user.id.slice(0, 6).toUpperCase()}`
    : 'CLEANFIT20';

  const referralLink = `${window.location.origin}/login?ref=${referralCode}`;
  const shareText = `Use my referral code ${referralCode} to get 20% off your first clean with Clean Fit! 🧹✨ ${referralLink}`;

  // Fetch referral stats: count bookings that used this user's referral code
  const { data: referralStats } = useQuery({
    queryKey: ['referral-stats', referralCode],
    queryFn: async () => {
      if (!user?.id) return { count: 0, credit: 0 };
      const { data, count } = await supabase.from('bookings')
        .select('id, total_cost', { count: 'exact' })
        .eq('referral_code', referralCode)
        .eq('status', 'completed');
      const completedCount = count || 0;
      // £10 credit per completed referral
      return { count: completedCount, credit: completedCount * 10 };
    },
    enabled: !!user?.id,
  });

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Clean Fit — Premium Cleaning',
          text: `Use my referral code ${referralCode} to get 20% off your first clean! 🧹✨`,
          url: referralLink,
        });
      } catch {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="border border-primary/20 bg-accent rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Gift className="h-5 w-5 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-sm">Refer a Mate</h3>
            <p className="text-xs text-muted-foreground">They get 20% off, you get £10 credit</p>
          </div>
        </div>

        {/* Code display */}
        <div className="bg-background border border-border rounded-xl p-3 flex items-center justify-between mb-3">
          <span className="font-mono font-bold text-foreground text-sm tracking-wider">{referralCode}</span>
          <button onClick={copyLink} className="flex items-center gap-1 text-primary text-xs font-medium hover:text-primary/80 transition-colors">
            {copied ? <CircleCheck className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        <div className="flex gap-2">
          <Button onClick={shareWhatsApp} className="flex-1 h-10 rounded-xl font-semibold text-xs bg-[#25D366] text-white hover:bg-[#25D366]/90">
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> WhatsApp
          </Button>
          <Button onClick={shareNative} variant="outline" className="flex-1 h-10 rounded-xl font-semibold text-xs">
            <Share2 className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Share
          </Button>
        </div>
      </div>

      <div className="bg-primary/5 border-t border-primary/10 px-5 py-3">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Referrals completed</span>
          <span className="font-semibold text-foreground">{referralStats?.count || 0}</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-muted-foreground">Credit earned</span>
          <span className="font-semibold text-primary">£{(referralStats?.credit || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
