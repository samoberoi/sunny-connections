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
        <div className="px-5 pt-14 pb-6 space-y-5">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-2xl font-display font-black text-foreground">Profile</h1>
          </div>

          {/* Profile card */}
          <div className="bg-card rounded-3xl p-6 shadow-soft border border-border text-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-full bg-foreground mx-auto mb-3 flex items-center justify-center text-background font-bold text-2xl">
              {user?.name?.[0] || 'C'}
            </motion.div>
            <h2 className="text-2xl font-display font-black text-foreground">{user?.name}</h2>
            {cleaner && (
              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                <Star className="h-4 w-4 text-primary" strokeWidth={2} fill="hsl(78, 85%, 65%)" />
                <span className="text-base font-bold text-foreground">{cleaner.rating}</span>
                <span className="text-xs text-muted-foreground">({cleaner.review_count})</span>
              </div>
            )}
            <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mt-1">
              <Smartphone className="h-3.5 w-3.5" strokeWidth={1.5} /> {user?.phone}
            </div>
          </div>

          {/* Stats */}
          {cleaner && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary rounded-3xl p-5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary-foreground">Verified</p>
                  <p className="text-[10px] text-primary-foreground/60">DBS Checked</p>
                </div>
              </div>
              <div className="bg-foreground rounded-3xl p-5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-background/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-background">{cleaner.experience} yrs</p>
                  <p className="text-[10px] text-background/40">Experience</p>
                </div>
              </div>
            </div>
          )}

          {/* Specialisations */}
          {cleaner && cleaner.specialisations.length > 0 && (
            <div className="bg-card rounded-3xl p-5 shadow-soft border border-border">
              <h3 className="font-display font-bold text-foreground text-sm mb-3">Specialisations</h3>
              <div className="flex flex-wrap gap-2">
                {cleaner.specialisations.map((s: string) => (
                  <Badge key={s} className="rounded-full px-4 py-1.5 text-xs font-bold border-0 bg-primary/15 text-foreground">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          <Button onClick={() => { logout(); navigate('/'); }} variant="outline"
            className="w-full h-12 rounded-full text-destructive border-2 border-destructive/20 hover:bg-destructive/5 font-bold">
            <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} /> Log Out
          </Button>
        </div>
      </PageTransition>
    </CleanerLayout>
  );
}
