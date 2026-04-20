import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, Lock, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PaymentDetailsFormProps {
  method: string;
  amount: number;
  onPaymentComplete: () => void;
  disabled?: boolean;
}

export default function PaymentDetailsForm({ method, amount, onPaymentComplete, disabled }: PaymentDetailsFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const isCardValid = cardNumber.replace(/\s/g, '').length === 16 && expiry.length === 5 && cvv.length >= 3 && cardName.trim().length > 0;
  const isOnlineValid = upiId.includes('@') || upiId.length >= 5;

  const handlePay = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 1800));
    setProcessing(false);
    setPaid(true);
    toast.success('Payment successful! ✅');
    onPaymentComplete();
  };

  if (method === 'cash') return null;

  if (paid) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" strokeWidth={1.5} />
        <div>
          <p className="text-sm font-bold text-foreground">Payment of £{amount} confirmed</p>
          <p className="text-[10px] text-muted-foreground">via {method === 'card' ? 'Card' : 'Online Banking'}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {method === 'card' && (
        <motion.div key="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          className="bg-card rounded-2xl p-4 border border-border space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <h4 className="text-xs font-bold text-foreground">Card Details</h4>
            <Lock className="h-3 w-3 text-muted-foreground ml-auto" strokeWidth={1.5} />
            <span className="text-[9px] text-muted-foreground">Secure</span>
          </div>
          <Input
            placeholder="Cardholder Name"
            value={cardName}
            onChange={e => setCardName(e.target.value)}
            className="h-10 rounded-xl text-sm"
          />
          <Input
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={e => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            className="h-10 rounded-xl text-sm font-mono tracking-wider"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="MM/YY"
              value={expiry}
              onChange={e => setExpiry(formatExpiry(e.target.value))}
              maxLength={5}
              className="h-10 rounded-xl text-sm font-mono"
            />
            <Input
              placeholder="CVV"
              value={cvv}
              onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              type="password"
              className="h-10 rounded-xl text-sm font-mono"
            />
          </div>
          <Button onClick={handlePay} disabled={!isCardValid || processing || disabled}
            className="w-full h-11 rounded-xl font-semibold text-sm">
            {processing ? (
              <span className="flex items-center gap-2">
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full inline-block" />
                Processing...
              </span>
            ) : `Pay £${amount}`}
          </Button>
        </motion.div>
      )}

      {method === 'online' && (
        <motion.div key="online" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          className="bg-card rounded-2xl p-4 border border-border space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <h4 className="text-xs font-bold text-foreground">Online Payment</h4>
            <Lock className="h-3 w-3 text-muted-foreground ml-auto" strokeWidth={1.5} />
            <span className="text-[9px] text-muted-foreground">Secure</span>
          </div>
          <Input
            placeholder="Email or mobile for payment receipt"
            value={upiId}
            onChange={e => setUpiId(e.target.value)}
            className="h-10 rounded-xl text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            {['Apple Pay', 'Google Pay', 'Klarna', 'Bank Transfer'].map(app => (
              <button key={app} onClick={() => setUpiId(`pay@${app.toLowerCase().replace(/\s/g, '')}.uk`)}
                className="py-2 rounded-xl border border-border text-[10px] font-semibold text-muted-foreground hover:bg-muted/50 transition-colors">
                {app}
              </button>
            ))}
          </div>
          <Button onClick={handlePay} disabled={!isOnlineValid || processing || disabled}
            className="w-full h-11 rounded-xl font-semibold text-sm">
            {processing ? (
              <span className="flex items-center gap-2">
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full inline-block" />
                Processing...
              </span>
            ) : `Pay £${amount}`}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
