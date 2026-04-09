import { motion } from 'framer-motion';

interface LineItem {
  label: string;
  amount: number;
  highlight?: boolean;
  discount?: boolean;
}

interface PaymentSummaryProps {
  items: LineItem[];
  total: number;
  isExpress?: boolean;
}

export default function PaymentSummary({ items, total, isExpress }: PaymentSummaryProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-foreground rounded-3xl p-5">
      <h3 className="font-display font-bold text-background/40 mb-3 text-xs uppercase tracking-wider">
        {isExpress ? '⚡ Express' : 'Payment'} Summary
      </h3>
      <div className="space-y-2 mb-3">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className={item.discount ? 'text-primary' : 'text-background/50'}>{item.label}</span>
            <span className={item.discount ? 'text-primary font-bold' : 'text-background'}>
              {item.discount ? '-' : ''}£{Math.abs(item.amount).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-background/10 pt-3 flex justify-between items-center">
        <span className="text-background/50 text-sm font-medium">Total</span>
        <span className="text-2xl font-display font-black text-primary">£{total.toFixed(2)}</span>
      </div>
    </motion.div>
  );
}
