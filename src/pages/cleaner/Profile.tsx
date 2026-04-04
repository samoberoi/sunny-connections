import { useNavigate } from 'react-router-dom';
import { Smartphone, Star, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CleanerLayout from '@/components/layout/CleanerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { useCleaners } from '@/hooks/useCleaners';

export default function CleanerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: cleaners } = useCleaners();
  const cleaner = cleaners?.[0];

  return (
    <CleanerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <BackButton />
            <h1 className="text-2xl font-display font-black text-foreground">My Profile</h1>
          </div>

          <div className="gradient-cyan rounded-3xl p-8 text-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-foreground mx-auto mb-4 flex items-center justify-center text-card font-bold text-2xl">
              {user?.name?.[0] || 'E'}
            </div>
            <h2 className="text-xl font-display font-black text-foreground">{user?.name}</h2>
            {cleaner && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <Star className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                <span className="font-bold text-foreground">{cleaner.rating}</span>
                <span className="text-sm text-foreground/60">({cleaner.review_count} reviews)</span>
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-sm text-foreground/60 mt-1">
              <Smartphone className="h-3 w-3" strokeWidth={1.5} /> {user?.phone}
            </div>
          </div>

          {cleaner && (
            <>
              <div className="bg-card rounded-2xl p-5 mb-4 shadow-apple">
                <h3 className="font-display font-bold text-foreground mb-3 text-sm">Specialisations</h3>
                <div className="flex flex-wrap gap-2">
                  {cleaner.specialisations.map((s: string) => (
                    <Badge key={s} className="bg-primary/20 text-foreground rounded-xl px-3 py-1 text-xs font-bold">{s}</Badge>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl p-5 mb-6 shadow-apple">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-accent-foreground" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-display font-bold text-foreground text-sm">Verified & DBS Checked</h3>
                    <p className="text-xs text-muted-foreground">{cleaner.experience} years experience</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <Button onClick={() => { logout(); navigate('/'); }} variant="outline" className="w-full h-12 rounded-2xl text-destructive border-destructive/20 hover:bg-destructive/5 font-bold">
            <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} /> Log Out
          </Button>
        </div>
      </PageTransition>
    </CleanerLayout>
  );
}
