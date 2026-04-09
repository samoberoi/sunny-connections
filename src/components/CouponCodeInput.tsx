import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CouponCodeInputProps {
  onApply: (discountPercent: number) => void;
}

export default function CouponCodeInput({ onApply }: CouponCodeInputProps) {
  const [code, setCode] = useState(() => localStorage.getItem('claimed_coupon_code') || '');
  const [validating, setValidating] = useState(false);
  const [applied, setApplied] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const validate = async () => {
    if (!code.trim()) return;
    setValidating(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('active', true)
        .gte('expires_at', today)
        .maybeSingle();

      if (error || !data) {
        toast.error('Invalid or expired coupon');
        onApply(0);
        setApplied(false);
        return;
      }
      if (data.used_count >= data.max_uses) {
        toast.error('Coupon has reached max uses');
        onApply(0);
        setApplied(false);
        return;
      }
      setApplied(true);
      setAppliedDiscount(data.discount_percent);
      onApply(data.discount_percent);
      toast.success(`${data.discount_percent}% discount applied!`);
    } catch {
      toast.error('Failed to validate coupon');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Enter coupon code"
        value={code}
        onChange={e => { setCode(e.target.value.toUpperCase()); if (applied) { setApplied(false); onApply(0); } }}
        className="h-11 rounded-2xl border-border bg-background text-sm font-mono uppercase flex-1"
        disabled={applied}
      />
      {applied ? (
        <div className="flex items-center gap-1 text-primary text-xs font-bold px-3">
          <CheckCircle2 className="h-4 w-4" /> {appliedDiscount}% off
        </div>
      ) : (
        <Button variant="outline" onClick={validate} disabled={validating || !code.trim()} className="rounded-2xl h-11 text-xs font-bold px-4">
          {validating ? '...' : 'Apply'}
        </Button>
      )}
    </div>
  );
}
