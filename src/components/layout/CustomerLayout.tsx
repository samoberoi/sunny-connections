import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ActiveBookingFloater from '@/components/ActiveBookingFloater';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/services', icon: Sparkles, label: 'Services' },
  { to: '/my-bookings', icon: CalendarDays, label: 'Bookings' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const hideFloater = ['/active-booking', '/searching-cleaner', '/rate-service'].some(p => pathname.startsWith(p));

  const { data: hasActiveBooking } = useQuery({
    queryKey: ['has-active-booking', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from('bookings')
        .select('id')
        .eq('customer_id', user.id)
        .not('status', 'in', '("completed","cancelled")')
        .limit(1)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id,
    refetchInterval: 5000,
  });

  const showFloater = !hideFloater && hasActiveBooking;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className={`flex-1 ${showFloater ? 'pb-44' : 'pb-24'}`}>{children}</div>
      {!hideFloater && <ActiveBookingFloater />}
      <nav className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-foreground rounded-[2rem] shadow-elevated">
          <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-3">
            {navItems.map(({ to, icon: Icon, label }) => {
              const active = pathname === to || pathname.startsWith(to + '/');
              return (
                <Link key={to} to={to} className="relative flex flex-col items-center gap-0.5 py-2 px-4">
                  {active ? (
                    <motion.div
                      layoutId="customer-nav-pill"
                      className="absolute inset-0 bg-primary rounded-2xl"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  ) : null}
                  <Icon
                    className={`h-5 w-5 relative z-10 transition-colors duration-200 ${active ? 'text-primary-foreground' : 'text-background/50'}`}
                    strokeWidth={active ? 2 : 1.5}
                  />
                  <span className={`text-[9px] relative z-10 transition-colors duration-200 ${active ? 'font-bold text-primary-foreground' : 'font-medium text-background/40'}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}