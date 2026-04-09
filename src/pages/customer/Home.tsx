import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, User, CalendarDays, Zap, Star, ChevronRight, MapPin, Gift, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import SimulatedMap, { generateCleanerMarkers } from '@/components/SimulatedMap';
import StreakProgress from '@/components/StreakProgress';
import { useAuth } from '@/contexts/AuthContext';
import { useCleaners } from '@/hooks/useCleaners';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import cleanBathroom from '@/assets/clean-bathroom.jpg';
import CoinBalance from '@/components/CoinBalance';
import { toast } from 'sonner';

function ActiveOffersBanner() {
  const navigate = useNavigate();
  const { data: offers = [] } = useQuery({
    queryKey: ['active-offers'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase.from('offers').select('*').eq('active', true).lte('valid_from', today).gte('valid_until', today).limit(3);
      return data || [];
    },
  });

  if (offers.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-1.5">
        <Gift className="h-4 w-4 text-primary-ink" strokeWidth={1.5} /> Special Offers
      </h3>
      {offers.map((offer: any) => (
        <div key={offer.id} className="bg-primary/10 rounded-2xl p-4 flex items-center justify-between border border-primary/20">
          <div>
            <p className="text-sm font-bold text-foreground">{offer.title}</p>
            <p className="text-[10px] text-muted-foreground">{offer.description} · {offer.discount_percent}% off</p>
          </div>
          {offer.code && <span className="font-mono font-bold text-xs bg-primary text-primary-foreground px-2.5 py-1 rounded-lg">{offer.code}</span>}
        </div>
      ))}
    </motion.div>
  );
}

function NotificationBadge() {
  const { user } = useAuth();
  const { data: count = 0 } = useQuery({
    queryKey: ['unread-notification-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false);
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });
  if (!count) return null;
  return <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">{count > 9 ? '9+' : count}</span>;
}

export default function CustomerHome() {
  const [showCoupon, setShowCoupon] = useState(false);
  const [offerModal, setOfferModal] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: cleaners } = useCleaners();

  useEffect(() => {
    const seen = sessionStorage.getItem('coupon_shown');
    if (!seen) { setShowCoupon(true); sessionStorage.setItem('coupon_shown', '1'); }
  }, []);

  // Check for unclaimed offers
  const { data: unclaimedOffers = [] } = useQuery({
    queryKey: ['unclaimed-offers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const today = new Date().toISOString().split('T')[0];
      const { data: offers } = await supabase.from('offers').select('*').eq('active', true).lte('valid_from', today).gte('valid_until', today);
      if (!offers?.length) return [];
      const { data: claims } = await supabase.from('offer_claims').select('offer_id').eq('customer_id', user.id);
      const claimedIds = new Set((claims || []).map(c => c.offer_id));
      return offers.filter(o => !claimedIds.has(o.id));
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (unclaimedOffers.length > 0 && !offerModal) {
      const shownKey = `offer_popup_${unclaimedOffers[0].id}`;
      if (!sessionStorage.getItem(shownKey)) {
        setOfferModal(unclaimedOffers[0]);
        sessionStorage.setItem(shownKey, '1');
      }
    }
  }, [unclaimedOffers]);

  const claimOffer = async (offer: any) => {
    if (!user?.id) return;
    await supabase.from('offer_claims').insert({ customer_id: user.id, offer_id: offer.id });
    toast.success(`Offer claimed! Use code: ${offer.code || 'AUTO'}`);
    setOfferModal(null);
  };

  const topCleaners = cleaners?.filter(c => c.available).slice(0, 4) || [];
  const firstName = user?.name?.split(' ')[0] || 'there';

  const mapMarkers = useMemo(() => {
    const availableCount = cleaners?.filter(c => c.available).length || 3;
    return generateCleanerMarkers(Math.min(availableCount, 6));
  }, [cleaners]);

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };

  return (
    <CustomerLayout>
      
      {/* Offer claim pop-up */}
      <Dialog open={!!offerModal} onOpenChange={open => !open && setOfferModal(null)}>
        <DialogContent className="rounded-3xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-lg flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" /> Special Offer!
            </DialogTitle>
          </DialogHeader>
          {offerModal && (
            <div className="space-y-4">
              <div className="bg-primary/10 rounded-2xl p-5 text-center">
                <p className="text-2xl font-display font-black text-foreground">{offerModal.discount_percent}% OFF</p>
                <p className="text-sm text-muted-foreground mt-1">{offerModal.title}</p>
              </div>
              <p className="text-sm text-muted-foreground text-center">{offerModal.description}</p>
              {offerModal.code && (
                <div className="bg-foreground rounded-xl p-3 text-center">
                  <p className="text-xs text-background/60">Use code</p>
                  <p className="text-lg font-mono font-black text-primary tracking-wider">{offerModal.code}</p>
                </div>
              )}
              <Button onClick={() => claimOffer(offerModal)} className="w-full h-12 rounded-full font-bold text-base">
                Claim Offer 🎉
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <PageTransition>
        <div className="relative min-h-screen">
          {/* Fixed map background - top half */}
          <div className="sticky top-0 z-0">
            <SimulatedMap markers={mapMarkers} height={420} className="">
              {/* Gradient fade at bottom for smooth content transition */}
              <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background pointer-events-none" />
            </SimulatedMap>

            {/* Header overlay on map */}
            <div className="absolute top-0 left-0 right-0 px-6 pt-14 z-20">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-display font-black text-foreground leading-none">
                    Hello,<br />{firstName}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate('/notifications')} className="w-11 h-11 rounded-full bg-white/80 backdrop-blur-md border border-border flex items-center justify-center shadow-sm relative">
                    <Bell className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                    <NotificationBadge />
                  </button>
                  <button onClick={() => navigate('/profile')} className="w-11 h-11 rounded-full bg-foreground flex items-center justify-center shadow-sm">
                    <User className="h-5 w-5 text-background" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>

            {/* Nearby count badge on map */}
            <div className="absolute bottom-6 left-6 z-20">
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 shadow-sm border border-border">
                <MapPin className="h-3.5 w-3.5 text-primary-ink" strokeWidth={2} />
                <span className="text-[11px] font-bold text-foreground/70">{topCleaners.length} cleaners nearby</span>
              </div>
            </div>
          </div>

          {/* Scrollable content over map */}
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="relative z-10 bg-background rounded-t-[2rem] -mt-8 px-5 pt-6 pb-4 space-y-5 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">

            {/* Two booking paths */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/schedule-booking')}
                className="bg-card rounded-3xl p-5 text-left shadow-soft border border-border relative overflow-hidden">
                <img src={cleanBathroom} alt="" className="absolute top-0 right-0 w-20 h-20 object-cover rounded-bl-3xl opacity-30" loading="lazy" width={800} height={512} />
                <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center mb-3">
                  <CalendarDays className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <h4 className="font-display font-black text-foreground text-base leading-tight">Schedule<br/>Cleaning</h4>
                <p className="text-[10px] text-muted-foreground mt-1">From £12/hr</p>
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/express-booking')}
                className="bg-foreground rounded-3xl p-5 text-left shadow-soft relative overflow-hidden">
                <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center mb-3">
                  <Zap className="h-5 w-5 text-primary-foreground" strokeWidth={1.5} />
                </div>
                <h4 className="font-display font-black text-background text-base leading-tight">Express<br/>Clean</h4>
                <p className="text-[10px] text-background/40 mt-1">Instant</p>
              </motion.button>
            </motion.div>

            {/* CleanFit Coins */}
            <CoinBalance />

            {/* Streak Progress */}
            <StreakProgress />

            {/* CleanFit Guarantee */}
            <motion.div variants={fadeUp} className="bg-primary/10 rounded-3xl p-5 border border-primary/20 flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-display font-bold text-foreground text-sm">CleanFit Guarantee</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">100% satisfaction guaranteed. Not happy? We'll re-clean for free or give a full refund.</p>
              </div>
            </motion.div>

            {/* Active Offers */}
            <ActiveOffersBanner />

            {/* Stats row */}
            <motion.div variants={fadeUp} className="bg-foreground rounded-3xl p-5 flex justify-between items-center">
              {[
                { value: '25+', label: 'Years' },
                { value: '2K+', label: 'Clients' },
                { value: '80+', label: 'Pros' },
                { value: '#1', label: 'UK App' },
              ].map((stat, i) => (
                <div key={stat.label} className="text-center">
                  <div className={`text-xl font-display font-black ${i === 0 ? 'text-primary' : 'text-background'}`}>{stat.value}</div>
                  <div className="text-[9px] text-background/40 font-medium mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Refer card */}
            <motion.div variants={fadeUp} className="bg-primary rounded-3xl p-6 flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/60 text-[10px] font-bold uppercase tracking-[0.15em]">Refer a Mate</p>
                <p className="text-primary-foreground text-2xl font-display font-black">First 3 for £50</p>
              </div>
              <Button size="sm" onClick={() => {
                const code = user?.id ? `CLEAN${user.id.slice(0, 6).toUpperCase()}` : 'CLEANFIT20';
                const link = `${window.location.origin}/login?ref=${code}`;
                const text = `Use my referral code ${code} to get 20% off your first clean with Clean Fit! 🧹✨ ${link}`;
                if (navigator.share) {
                  navigator.share({ title: 'Clean Fit', text, url: link }).catch(() => {
                    navigator.clipboard.writeText(link);
                    toast.success('Link copied!');
                  });
                } else {
                  navigator.clipboard.writeText(link);
                  toast.success('Referral link copied!');
                }
              }} className="rounded-full font-bold bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-10 px-5">
                Share <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </motion.div>

            {/* Top Cleaners */}
            <motion.section variants={fadeUp} className="pb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-foreground text-sm">Top Rated</h3>
                <button onClick={() => navigate('/schedule-booking')} className="text-[11px] text-muted-foreground font-medium hover:text-foreground transition-colors">View all →</button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {topCleaners.map((cleaner, i) => (
                  <motion.div
                    key={cleaner.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.35 }}
                    onClick={() => navigate('/cleaner-detail', { state: { cleanerId: cleaner.id } })}
                    className="bg-card rounded-3xl p-4 min-w-[120px] text-center shrink-0 shadow-soft border border-border cursor-pointer active:scale-95 transition-transform"
                  >
                    <div className="w-14 h-14 rounded-full bg-foreground mx-auto mb-2 flex items-center justify-center text-background font-bold text-lg">
                      {cleaner.name[0]}
                    </div>
                    <p className="text-sm font-bold text-foreground">{cleaner.name.split(' ')[0]}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-primary" strokeWidth={2} fill="hsl(78, 85%, 65%)" />
                      <span className="text-xs text-muted-foreground font-bold">{cleaner.rating}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </motion.div>
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
