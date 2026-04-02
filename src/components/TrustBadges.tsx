import { Shield, Clock, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const badges = [
  { icon: Clock, value: '25+', label: 'Years Experience' },
  { icon: Users, value: '2,000+', label: 'Happy Customers' },
  { icon: Shield, value: '80+', label: 'Verified Professionals' },
  { icon: Award, value: '#1', label: 'Most Trusted UK App' },
];

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge, i) => (
        <motion.div
          key={badge.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card rounded-xl p-4 text-center"
        >
          <badge.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
          <div className="font-display text-2xl font-bold text-foreground">{badge.value}</div>
          <div className="text-xs text-muted-foreground mt-1">{badge.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
