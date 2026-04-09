import { useLocation, useNavigate } from 'react-router-dom';
import { Star, Shield, Briefcase, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function CleanerDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const cleanerId = state?.cleanerId;

  const { data: cleaner } = useQuery({
    queryKey: ['cleaner-detail', cleanerId],
    queryFn: async () => {
      if (!cleanerId) return null;
      const { data } = await supabase.from('cleaners').select('*').eq('id', cleanerId).single();
      return data;
    },
    enabled: !!cleanerId,
  });

  const { data: recentReviews = [] } = useQuery({
    queryKey: ['cleaner-reviews', cleanerId],
    queryFn: async () => {
      if (!cleanerId) return [];
      const { data } = await supabase.from('bookings').select('rating, review, customer_name, date, service_name')
        .eq('cleaner_id', cleanerId).not('rating', 'is', null).order('date', { ascending: false }).limit(10);
      return data || [];
    },
    enabled: !!cleanerId,
  });

  if (!cleaner) {
    return (
      <CustomerLayout>
        <PageTransition>
          <div className="px-5 pt-14 pb-6">
            <BackButton to="/home" />
            <p className="text-center text-muted-foreground mt-12">Cleaner not found</p>
          </div>
        </PageTransition>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-14 pb-6 space-y-5">
          <BackButton to="/home" />

          {/* Profile header */}
          <div className="bg-card rounded-3xl p-6 shadow-soft border border-border text-center">
            <div className="w-20 h-20 rounded-full bg-foreground mx-auto mb-4 flex items-center justify-center text-background font-bold text-2xl">
              {cleaner.name[0]}
            </div>
            <h2 className="text-xl font-display font-black text-foreground">{cleaner.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              {cleaner.verified && (
                <Badge className="bg-primary/15 text-primary border-0 text-[10px] rounded-full font-bold">
                  <Shield className="h-3 w-3 mr-1" /> Verified
                </Badge>
              )}
              <Badge className="bg-muted text-muted-foreground border-0 text-[10px] rounded-full font-bold">
                {cleaner.available ? '🟢 Available' : '🔴 Busy'}
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card rounded-3xl p-4 text-center shadow-soft border border-border">
              <Star className="h-4 w-4 mx-auto mb-2 text-primary" strokeWidth={1.5} />
              <div className="text-xl font-display font-black text-foreground">{cleaner.rating || '—'}</div>
              <div className="text-[9px] text-muted-foreground font-medium">Rating</div>
            </div>
            <div className="bg-card rounded-3xl p-4 text-center shadow-soft border border-border">
              <Briefcase className="h-4 w-4 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
              <div className="text-xl font-display font-black text-foreground">{cleaner.review_count}</div>
              <div className="text-[9px] text-muted-foreground font-medium">Reviews</div>
            </div>
            <div className="bg-card rounded-3xl p-4 text-center shadow-soft border border-border">
              <Clock className="h-4 w-4 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
              <div className="text-xl font-display font-black text-foreground">{cleaner.experience}y</div>
              <div className="text-[9px] text-muted-foreground font-medium">Experience</div>
            </div>
          </div>

          {/* Specialisations */}
          {cleaner.specialisations?.length > 0 && (
            <div className="bg-card rounded-3xl p-5 shadow-soft border border-border">
              <h3 className="font-display font-bold text-foreground text-sm mb-3">Specialisations</h3>
              <div className="flex flex-wrap gap-2">
                {cleaner.specialisations.map((s: string) => (
                  <Badge key={s} className="bg-primary/10 text-foreground border-0 rounded-full text-xs font-bold px-3 py-1.5">
                    <CheckCircle className="h-3 w-3 mr-1 text-primary" /> {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-card rounded-3xl p-5 shadow-soft border border-border">
            <h3 className="font-display font-bold text-foreground text-sm mb-3">Reviews ({recentReviews.length})</h3>
            {recentReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No reviews yet</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
                {recentReviews.map((r: any, i: number) => (
                  <div key={i} className="border-b border-border last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-foreground">{r.customer_name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-primary" fill="currentColor" />
                        <span className="text-xs font-bold">{r.rating}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{r.service_name} · {r.date}</p>
                    {r.review && <p className="text-xs text-muted-foreground mt-1 italic">"{r.review}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Book CTA */}
          <Button
            onClick={() => navigate('/schedule-booking')}
            className="w-full h-14 rounded-full font-bold text-base"
          >
            Book {cleaner.name.split(' ')[0]}
          </Button>
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
