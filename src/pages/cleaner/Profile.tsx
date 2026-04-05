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
                <Star className="h-3.5 w-3.5 text-primary" strokeWidth={2} fill="hsl(var(--primary))" />
                <span className="text-sm font-semibold text-foreground">{cleaner.rating}</span>
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
              <div className="bg-muted/30 rounded-2xl p-4 flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-semibold text-foreground">Verified</p>
                  <p className="text-[11px] text-muted-foreground">DBS Checked</p>
                </div>
              </div>
              <div className="bg-muted/30 rounded-2xl p-4 flex items-center gap-3">
                <Award className="h-5 w-5 text-primary shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{cleaner.experience} yrs</p>
                  <p className="text-[11px] text-muted-foreground">Experience</p>
                </div>
              </div>
            </div>
          )}

          {/* Specialisations */}
          {cleaner && cleaner.specialisations.length > 0 && (
            <div className="bg-muted/30 rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Specialisations</h3>
              <div className="flex flex-wrap gap-2">
                {cleaner.specialisations.map((s: string) => (
                  <Badge key={s} variant="secondary" className="rounded-lg px-3 py-1 text-xs font-medium border-0">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={() => { logout(); navigate('/'); }}
            variant="outline"
            className="w-full h-11 rounded-2xl text-destructive border-destructive/20 hover:bg-destructive/5 font-medium text-sm"
          >
            <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} /> Log Out
          </Button>
        </div>
      </PageTransition>
    </CleanerLayout>
  );
}
