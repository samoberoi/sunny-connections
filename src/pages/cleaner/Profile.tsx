import { useNavigate } from 'react-router-dom';
import { Smartphone, Star, LogOut, Shield, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CleanerLayout from '@/components/layout/CleanerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function CleanerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: cleaner } = useQuery({
    queryKey: ['my-cleaner-record', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('cleaners').select('*').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <CleanerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6 space-y-5">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-lg font-display font-black text-foreground">Profile</h1>
          </div>

          {/* Avatar */}
          <div className="text-center py-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-full bg-foreground mx-auto mb-3 flex items-center justify-center text-background font-bold text-2xl"
            >
              {user?.name?.[0] || 'C'}
            </motion.div>
            <h2 className="text-xl font-display font-black text-foreground">{user?.name}</h2>
            {cleaner && (
              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                <Star className="h-3.5 w-3.5 text-primary" strokeWidth={2} fill="hsl(78, 85%, 65%)" />
                <span className="text-sm font-bold text-foreground">{cleaner.rating}</span>
                <span className="text-xs text-muted-foreground">({cleaner.review_count})</span>
              </div>
            )}
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Smartphone className="h-3 w-3" strokeWidth={1.5} /> {user?.phone}
            </div>
          </div>

          {/* Stats */}
          {cleaner && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-soft">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Verified</p>
                  <p className="text-[11px] text-muted-foreground">DBS Checked</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-soft">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Award className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{cleaner.experience} yrs</p>
                  <p className="text-[11px] text-muted-foreground">Experience</p>
                </div>
              </div>
            </div>
          )}

          {/* Specialisations */}
          {cleaner && cleaner.specialisations.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4 shadow-soft">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Specialisations</h3>
              <div className="flex flex-wrap gap-2">
                {cleaner.specialisations.map((s: string) => (
                  <Badge key={s} className="rounded-full px-3 py-1 text-xs font-bold border-0 bg-primary/15 text-foreground">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={() => { logout(); navigate('/'); }}
            variant="outline"
            className="w-full h-11 rounded-full text-destructive border-2 border-destructive/20 hover:bg-destructive/5 font-bold text-sm"
          >
            <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} /> Log Out
          </Button>
        </div>
      </PageTransition>
    </CleanerLayout>
  );
}
