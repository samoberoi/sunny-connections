import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { LayoutDashboard, Briefcase, PoundSterling, User } from 'lucide-react';
import { motion } from 'framer-motion';
import LocationTracker from '@/components/LocationTracker';
import NewJobPopup from '@/components/NewJobPopup';

const navItems = [
  { to: '/cleaner', icon: LayoutDashboard, label: 'Home' },
  { to: '/cleaner/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/cleaner/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/cleaner/earnings', icon: PoundSterling, label: 'Earnings' },
  { to: '/cleaner/profile', icon: User, label: 'Profile' },
];

export default function CleanerLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LocationTracker />
      <NewJobPopup />
      <div className="flex-1 pb-24">{children}</div>
      <nav className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-foreground rounded-[2rem] shadow-elevated">
          <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-3">
            {navItems.map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} className="relative flex flex-col items-center gap-0.5 py-2 px-4">
                  {active ? (
                    <motion.div
                      layoutId="cleaner-nav-pill"
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
