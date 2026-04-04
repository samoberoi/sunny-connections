import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Share2, CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ReferralCard() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Generate a deterministic referral code from user id
  const referralCode = user?.id
    ? `CLEAN${user.id.slice(0, 6).toUpperCase()}`
    : 'CLEANFIT20';

  const referralLink = `https://cleanfit.co.uk/r/${referralCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Clean Fit — Premium Cleaning',
          text: `Use my referral code ${referralCode} to get 20% off your first clean! 🧹✨`,
          url: referralLink,
        });
      } catch {
        copyCode();
      }
    } else {
      copyCode();
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
          <button onClick={copyCode} className="flex items-center gap-1 text-primary text-xs font-medium hover:text-primary/80 transition-colors">
            {copied ? <CircleCheck className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <Button onClick={share} className="w-full h-10 rounded-xl font-semibold text-xs bg-primary text-primary-foreground hover:bg-primary/90">
          <Share2 className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Share with Friends
        </Button>
      </div>

      <div className="bg-primary/5 border-t border-primary/10 px-5 py-3">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Referrals made</span>
          <span className="font-semibold text-foreground">0</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-muted-foreground">Credit earned</span>
          <span className="font-semibold text-primary">£0.00</span>
        </div>
      </div>
    </div>
  );
}
