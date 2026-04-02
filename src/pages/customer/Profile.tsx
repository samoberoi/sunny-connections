import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <CustomerLayout>
      <div className="px-6 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-muted"><ArrowLeft className="h-4 w-4" /></button>
          <h1 className="font-display text-xl font-semibold text-foreground">Profile</h1>
        </div>

        <div className="glass-card rounded-xl p-6 text-center mb-6">
          <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-3 flex items-center justify-center text-primary-foreground font-bold text-2xl">
            {user?.name?.[0] || 'A'}
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground">{user?.name || 'Guest'}</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1">
            <Phone className="h-3 w-3" /> {user?.phone || '+44 7700 900000'}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">Saved Addresses</h3>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-foreground">42 Baker Street</p>
                <p className="text-xs text-muted-foreground">London, NW1 6XE</p>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleLogout} variant="outline" className="w-full text-destructive border-destructive/30">
          <LogOut className="h-4 w-4 mr-2" /> Log Out
        </Button>
      </div>
    </CustomerLayout>
  );
}
