import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Star, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CleanerLayout from '@/components/layout/CleanerLayout';
import { useAuth } from '@/contexts/AuthContext';
import { cleaners } from '@/data/mockData';

export default function CleanerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const cleaner = cleaners[0];

  return (
    <CleanerLayout>
      <div className="px-6 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-muted"><ArrowLeft className="h-4 w-4" /></button>
          <h1 className="font-display text-xl font-semibold text-foreground">My Profile</h1>
        </div>

        <div className="glass-card rounded-xl p-6 text-center mb-6">
          <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-3 flex items-center justify-center text-primary-foreground font-bold text-2xl">
            {user?.name?.[0] || 'E'}
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground">{user?.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Star className="h-4 w-4 fill-secondary text-secondary" />
            <span className="font-medium text-foreground">{cleaner.rating}</span>
            <span className="text-sm text-muted-foreground">({cleaner.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1">
            <Phone className="h-3 w-3" /> {user?.phone}
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-foreground mb-2">Specialisations</h3>
          <div className="flex flex-wrap gap-2">
            {cleaner.specialisations.map(s => (
              <Badge key={s} className="bg-accent text-accent-foreground">{s}</Badge>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-2">Details</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{cleaner.experience} years experience</p>
            <p>DBS checked & verified</p>
          </div>
        </div>

        <Button onClick={() => { logout(); navigate('/'); }} variant="outline" className="w-full text-destructive border-destructive/30">
          <LogOut className="h-4 w-4 mr-2" /> Log Out
        </Button>
      </div>
    </CleanerLayout>
  );
}
