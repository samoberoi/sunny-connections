import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CalendarDays, Users, UserCheck, GraduationCap, Settings, Tag, BarChart3, CalendarOff, LogOut, Menu, X, Gift, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Home' },
  { to: '/admin/bookings', icon: CalendarDays, label: 'Bookings' },
  { to: '/admin/cleaners', icon: UserCheck, label: 'Team' },
  { to: '/admin/services', icon: Settings, label: 'Settings' },
];

const moreItems = [
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/leaves', icon: CalendarOff, label: 'Leaves' },
  { to: '/admin/enrolments', icon: GraduationCap, label: 'Enrolments' },
  { to: '/admin/training', icon: GraduationCap, label: 'Training' },
  { to: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { to: '/admin/offers', icon: Gift, label: 'Offers' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/admins', icon: UserCheck, label: 'Admins' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 pb-24">{children}</div>

      {/* Bottom navbar - matching customer/cleaner style */}
      <nav className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-foreground rounded-[2rem] shadow-elevated">
          <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-3">
            {navItems.map(({ to, icon: Icon, label }) => {
              const active = pathname === to || (to !== '/admin' && pathname.startsWith(to));
              return (
                <Link key={to} to={to} className="relative flex flex-col items-center gap-0.5 py-2 px-4">
                  {active && (
                    <motion.div
                      layoutId="admin-nav-pill"
                      className="absolute inset-0 bg-primary rounded-2xl"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
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
            {/* More menu trigger */}
            <button onClick={() => setMenuOpen(true)} className="relative flex flex-col items-center gap-0.5 py-2 px-4">
              <Menu className="h-5 w-5 text-background/50" strokeWidth={1.5} />
              <span className="text-[9px] font-medium text-background/40">More</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Slide-up more menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[60]"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-background rounded-t-[2rem] px-6 pt-6 pb-10 shadow-elevated max-h-[70vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  <h3 className="font-display font-bold text-foreground text-lg">More</h3>
                </div>
                <button onClick={() => setMenuOpen(false)} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center">
                  <X className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                </button>
              </div>
              <div className="space-y-1">
                {moreItems.map(({ to, icon: Icon, label }) => {
                  const active = pathname === to;
                  return (
                    <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${active ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground hover:bg-card'}`}>
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                      <span className="text-sm font-medium">{label}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-destructive hover:bg-destructive/10 w-full transition-all">
                  <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Log out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
