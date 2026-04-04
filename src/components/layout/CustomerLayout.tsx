import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, User, Bell } from 'lucide-react';

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/my-bookings', icon: CalendarDays, label: 'Bookings' },
  { to: '/notifications', icon: Bell, label: 'Alerts' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 pb-24">{children}</div>
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="glass-card-elevated border-t-0 rounded-t-2xl">
          <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-2 pb-safe">
            {navItems.map(({ to, icon: Icon, label }) => {
              const active = pathname === to || pathname.startsWith(to + '/');
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-200 ${
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-all duration-200 ${active ? 'bg-accent' : ''}`}>
                    <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
                  </div>
                  <span className={`text-[10px] ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
