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
    <div className="min-h-screen bg-secondary flex flex-col">
      <div className="flex-1 pb-24">{children}</div>
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-secondary/90 backdrop-blur-xl border-t border-secondary-foreground/5">
          <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-2">
            {navItems.map(({ to, icon: Icon, label }) => {
              const active = pathname === to || pathname.startsWith(to + '/');
              return (
                <Link
                  key={to}
                  to={to}
                  className="flex flex-col items-center gap-1 py-2 px-4 transition-all"
                >
                  <div className={`p-2 rounded-xl transition-all ${active ? 'gradient-lime shadow-lime/30' : ''}`}>
                    <Icon className={`h-5 w-5 ${active ? 'text-primary-foreground' : 'text-secondary-foreground/40'}`} strokeWidth={active ? 2.5 : 1.8} />
                  </div>
                  <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-secondary-foreground/40'}`}>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
