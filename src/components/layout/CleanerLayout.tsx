import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, PoundSterling, User } from 'lucide-react';

const navItems = [
  { to: '/cleaner', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/cleaner/bookings', icon: CalendarDays, label: 'Jobs' },
  { to: '/cleaner/earnings', icon: PoundSterling, label: 'Earnings' },
  { to: '/cleaner/profile', icon: User, label: 'Profile' },
];

export default function CleanerLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 pb-20">{children}</div>
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to} className={`flex flex-col items-center gap-1 text-xs transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
