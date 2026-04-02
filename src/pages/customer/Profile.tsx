import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <CustomerLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-muted"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </div>

        <div className="glass-card rounded-2xl p-8 text-center mb-6 shadow-apple">
          <div className="w-20 h-20 rounded-2xl gradient-blue mx-auto mb-4 flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-blue">
            {user?.name?.[0] || 'A'}
          </div>
          <h2 className="text-xl font-bold text-foreground">{user?.name || 'Guest'}</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1">
            <Phone className="h-3 w-3" /> {user?.phone || '+44 7700 900000'}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 mb-6 shadow-apple">
          <h3 className="font-semibold text-foreground mb-3">Saved Addresses</h3>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">42 Baker Street</p>
              <p className="text-xs text-muted-foreground">London, NW1 6XE</p>
            </div>
          </div>
        </div>

        <Button onClick={() => { logout(); navigate('/'); }} variant="outline" className="w-full h-12 rounded-2xl text-destructive border-destructive/20 hover:bg-destructive/5">
          <LogOut className="h-4 w-4 mr-2" /> Log Out
        </Button>
      </div>
    </CustomerLayout>
  );
}
