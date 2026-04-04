import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, LogOut } from 'lucide-react';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <CustomerLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-secondary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-secondary-foreground">Profile</h1>
        </div>

        <div className="glass rounded-2xl p-8 text-center mb-6 border border-secondary-foreground/5">
          <div className="w-20 h-20 rounded-2xl gradient-lime mx-auto mb-4 flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lime">
            {user?.name?.[0] || 'A'}
          </div>
          <h2 className="text-xl font-bold text-secondary-foreground">{user?.name || 'Guest'}</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-secondary-foreground/40 mt-1">
            <Phone className="h-3 w-3" /> {user?.phone || '+44 7700 900000'}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 mb-6 border border-secondary-foreground/5">
          <h3 className="font-semibold text-secondary-foreground mb-3">Saved Addresses</h3>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-foreground">42 Baker Street</p>
              <p className="text-xs text-secondary-foreground/40">London, NW1 6XE</p>
            </div>
          </div>
        </div>

        <button onClick={() => { logout(); navigate('/'); }} className="w-full h-12 rounded-2xl glass text-destructive font-medium border border-destructive/20 flex items-center justify-center gap-2">
          <LogOut className="h-4 w-4" /> Log Out
        </button>
      </div>
    </CustomerLayout>
  );
}
