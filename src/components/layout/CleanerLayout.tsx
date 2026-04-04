import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, PoundSterling, User } from 'lucide-react';

const navItems = [
  { to: '/cleaner', icon: LayoutDashboard, label: 'Dashboard' },
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
        <div className="bg-foreground rounded-t-3xl">
          <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-2 pb-safe">
            {navItems.map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-200 ${
                    active ? 'text-cyan' : 'text-card/50 hover:text-card/80'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-all duration-200 ${active ? 'bg-cyan/20' : ''}`}>
                    <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
                  </div>
                  <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
