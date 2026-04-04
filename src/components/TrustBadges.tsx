import { Shield, Clock, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const badges = [
  { icon: Clock, value: '25+', label: 'Years Experience' },
  { icon: Users, value: '2,000+', label: 'Happy Customers' },
  { icon: Shield, value: '80+', label: 'Verified Pros' },
  { icon: Award, value: '#1', label: 'Trusted UK App' },
];

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {badges.map((badge, i) => (
        <motion.div
          key={badge.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          className="glass-card rounded-2xl p-4 text-center shadow-apple"
        >
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-2">
            <badge.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div className="text-xl font-bold text-foreground">{badge.value}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">{badge.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
