import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, PoundSterling, User } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/cleaner', icon: LayoutDashboard, label: 'Home' },
  { to: '/cleaner/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/cleaner/earnings', icon: PoundSterling, label: 'Earnings' },
  { to: '/cleaner/profile', icon: User, label: 'Profile' },
];

export default function CleanerLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 pb-24">{children}</div>
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-card/90 backdrop-blur-2xl border-t border-border/50">
          <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4 pb-safe">
            {navItems.map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} className="relative flex flex-col items-center gap-0.5 py-2 px-3">
                  {active && (
                    <motion.div
                      layoutId="cleaner-nav-pill"
                      className="absolute -top-0.5 w-6 h-1 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`h-5 w-5 transition-colors duration-200 ${active ? 'text-foreground' : 'text-muted-foreground'}`}
                    strokeWidth={active ? 2 : 1.5}
                  />
                  <span className={`text-[10px] transition-colors duration-200 ${active ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
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
