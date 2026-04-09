import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, User, CircleCheck, Briefcase, Home, Building2, Landmark, PoundSterling, Navigation, Phone, MessageCircle, ChevronRight, MapPinCheck, Zap, CalendarDays, XCircle, Camera } from 'lucide-react';
import PhotoCapture from '@/components/PhotoCapture';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import CleanerLayout from '@/components/layout/CleanerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import EmptyState from '@/components/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const propertyIcons: Record<string, any> = { flat: Building2, house: Home, office: Landmark };

const isExpressBooking = (b: any) => {
  const name = (b.service_name || '').toLowerCase();
  return name.includes('express') || name.includes('blitz');
};

export default function CleanerJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [notes, setNotes] = useState('');
  const [hasArrived, setHasArrived] = useState(() => {
    const stored = sessionStorage.getItem('cleaner_arrived');
    return stored ? JSON.parse(stored) : false;
  });
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [beforePhotoUrl, setBeforePhotoUrl] = useState<string | null>(null);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string | null>(null);


  const { data: cleanerRecord } = useQuery({
    queryKey: ['my-cleaner-record', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('cleaners').select('*').eq('user_id', user.id).maybeSingle();
      if (data) return data;
      const { data: created, error } = await supabase.from('cleaners').insert({
        user_id: user.id, name: user.name || 'Cleaner',
      }).select().single();
      if (error) { console.error('Failed to create cleaner record', error); return null; }
      return created;
    },
    enabled: !!user?.id,
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ['cleaner-all-bookings', cleanerRecord?.id],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(200);
      return data || [];
    },
    enabled: !!cleanerRecord,
  });

  useEffect(() => {
    const channel = supabase
      .channel('cleaner-bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        queryClient.invalidateQueries({ queryKey: ['cleaner-all-bookings'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const available = allBookings.filter(b => !b.cleaner_id && b.status === 'pending');
  const filteredAvailable = available.filter(b => {
    if (jobFilter === 'express') return isExpressBooking(b);
    if (jobFilter === 'schedule') return !isExpressBooking(b);
    return true;
  });
  const expressCount = available.filter(b => isExpressBooking(b)).length;
  const scheduleCount = available.filter(b => !isExpressBooking(b)).length;

  const upcomingJobs = allBookings.filter(b => b.cleaner_id === cleanerRecord?.id && ['assigned', 'en-route'].includes(b.status));
  const activeJobs = allBookings.filter(b => b.cleaner_id === cleanerRecord?.id && ['otp-verified', 'in-progress'].includes(b.status));
  const myJobs = [...upcomingJobs, ...activeJobs];
  const completed = allBookings.filter(b => b.cleaner_id === cleanerRecord?.id && b.status === 'completed');

  const acceptJob = useMutation({
    mutationFn: async (bookingId: string) => {
      if (!cleanerRecord || !user) return;
      const { data: booking } = await supabase.from('bookings').select('customer_id').eq('id', bookingId).single();
      const { error } = await supabase.from('bookings').update({
        cleaner_id: cleanerRecord.id, cleaner_name: user.name, status: 'assigned' as any,
      }).eq('id', bookingId);
      if (error) throw error;
      // Notify customer
      if (booking?.customer_id) {
        await supabase.from('notifications').insert({
          user_id: booking.customer_id, title: 'Cleaner Assigned!',
          message: `${user.name} has been assigned to your booking.`, type: 'booking',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaner-all-bookings'] });
      toast.success('Job accepted! 🎉');
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data: booking } = await supabase.from('bookings').select('customer_id, customer_name').eq('id', id).single();
      const { error } = await supabase.from('bookings').update({ status: status as any }).eq('id', id);
      if (error) throw error;
      // Notify customer based on status
      if (booking?.customer_id) {
        const msgs: Record<string, { title: string; message: string }> = {
          'en-route': { title: 'Cleaner On The Way!', message: `${user?.name || 'Your cleaner'} is heading to your location.` },
          'in-progress': { title: 'Cleaning Started', message: 'Your cleaning is now in progress.' },
          'completed': { title: 'Cleaning Complete! ✨', message: 'Your cleaning is done. Rate your experience!' },
        };
        const msg = msgs[status];
        if (msg) {
          await supabase.from('notifications').insert({ user_id: booking.customer_id, ...msg, type: 'booking' });
        }
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cleaner-all-bookings'] }),
  });

  const selectedJob = allBookings.find(b => b.id === selectedBooking);

  const verifyOtp = () => {
    if (selectedJob && otp === selectedJob.otp) {
      updateStatus.mutate({ id: selectedJob.id, status: 'otp-verified' });
      toast.success('OTP verified! ✅');
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const startJob = () => {
    if (selectedJob) {
      updateStatus.mutate({ id: selectedJob.id, status: 'in-progress' });
      toast.success('Cleaning started! 🧹');
    }
  };

  const completeJob = () => {
    if (selectedJob) {
      updateStatus.mutate({ id: selectedJob.id, status: 'completed' });
      toast.success('Job completed! 💪');
      setSelectedBooking(null);
      setOtp('');
      setNotes('');
    }
  };

  const goEnRoute = () => {
    if (selectedJob) {
      updateStatus.mutate({ id: selectedJob.id, status: 'en-route' });
      toast.success("On your way! 🚗");
    }
  };

  const PropIcon = selectedJob ? (propertyIcons[selectedJob.property_type] || Home) : Home;

  // ─── Job Detail View ───
  if (selectedJob) {
    const isExpress = isExpressBooking(selectedJob);
    return (
      <CleanerLayout>
        <PageTransition>
          <div className="px-5 pt-6 pb-6 space-y-4">
            <div className="flex items-center gap-3">
              <BackButton onClick={() => { setSelectedBooking(null); setOtp(''); setHasArrived(false); }} />
              <h1 className="text-lg font-display font-black text-foreground">Job Details</h1>
              {isExpress && (
                <Badge className="bg-amber-500/10 text-amber-600 text-[9px] rounded-lg font-semibold border-0 ml-auto">
                  <Zap className="h-2.5 w-2.5 mr-0.5" /> Express
                </Badge>
              )}
              {(selectedJob as any).tier === 'premium' && (
                <Badge className="bg-amber-100 text-amber-700 text-[9px] rounded-lg font-semibold border-0">
                  👑 Premium
                </Badge>
              )}
            </div>

            {/* Customer Card */}
            <div className="bg-muted/30 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-lg">
                  {selectedJob.customer_name[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-foreground text-sm">{selectedJob.customer_name}</h3>
                  <p className="text-[11px] text-muted-foreground">{selectedJob.service_name}</p>
                </div>
                <Badge className={`text-[9px] rounded-lg font-medium border-0 capitalize ${
                  selectedJob.status === 'in-progress' ? 'bg-primary/10 text-primary-ink' : 'bg-muted text-muted-foreground'
                }`}>
                  {selectedJob.status.replace('-', ' ')}
                </Badge>
              </div>

              <div className="space-y-2.5">
                {[
                  { icon: PropIcon, text: selectedJob.property_type },
                  { icon: MapPin, text: `${selectedJob.address_line1}, ${selectedJob.address_postcode}` },
                  { icon: Clock, text: `${selectedJob.date} at ${selectedJob.time} · ${selectedJob.duration}h` },
                ].map(({ icon: Ic, text }, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Ic className="h-3.5 w-3.5 text-primary-ink shrink-0" strokeWidth={1.5} />
                    <span className="capitalize">{text}</span>
                  </div>
                ))}
              </div>

              {selectedJob.notes && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-xs text-foreground">{selectedJob.notes}</p>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Earnings</span>
                <span className="text-xl font-display font-black text-primary-ink">£{selectedJob.total_cost}</span>
              </div>
            </div>

            {/* Contact */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.open(`tel:+1111111111`, '_self')} className="flex-1 rounded-xl text-xs h-10 border-border/50 text-foreground">
                <Phone className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Call
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/chat', { state: { bookingId: selectedJob.id, otherName: selectedJob.customer_name } })} className="flex-1 rounded-xl text-xs h-10 border-border/50 text-foreground">
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Chat
              </Button>
            </div>

            {/* Status Actions */}
            <AnimatePresence mode="wait">
              {selectedJob.status === 'assigned' && (
                <motion.div key="assigned" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-muted/30 rounded-2xl p-6 text-center">
                  <Navigation className="h-6 w-6 text-primary-ink mx-auto mb-2" strokeWidth={1.5} />
                  <p className="font-semibold text-foreground text-sm mb-1">Ready to go?</p>
                  <p className="text-[11px] text-muted-foreground mb-4">Tap below when you're heading out</p>
                  <Button onClick={goEnRoute} className="w-full h-11 rounded-2xl font-semibold text-sm mb-2">
                    I'm On My Way 🚗
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full text-xs text-destructive font-bold h-9">
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Can't Take This Job
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display font-bold">Decline this job?</AlertDialogTitle>
                        <AlertDialogDescription>The job will be returned to the available pool for other cleaners.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-full">Keep</AlertDialogCancel>
                        <AlertDialogAction className="rounded-full bg-destructive text-destructive-foreground" onClick={async () => {
                          await supabase.from('bookings').update({
                            status: 'pending' as any,
                            cleaner_id: null,
                            cleaner_name: null,
                            cleaner_avatar: null,
                          }).eq('id', selectedJob.id);
                          // Notify customer
                          await supabase.from('notifications').insert({
                            user_id: selectedJob.customer_id,
                            title: 'Cleaner Unavailable',
                            message: `Your cleaner couldn't make it. We're finding a replacement.`,
                            type: 'booking',
                          });
                          queryClient.invalidateQueries({ queryKey: ['cleaner-all-bookings'] });
                          setSelectedBooking(null);
                          toast.success('Job returned to pool');
                        }}>Decline</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
              )}

              {selectedJob.status === 'en-route' && !hasArrived && (
                <motion.div key="en-route-travel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-muted/30 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Navigation className="h-5 w-5 text-primary-ink animate-pulse" strokeWidth={1.5} />
                  </div>
                  <p className="font-semibold text-foreground text-sm mb-1">On your way</p>
                  <p className="text-[11px] text-muted-foreground mb-4">Tap when you arrive</p>
                  <Button onClick={() => setHasArrived(true)} className="w-full h-11 rounded-2xl font-semibold text-sm">
                    <MapPinCheck className="h-4 w-4 mr-1.5" /> I've Arrived 📍
                  </Button>
                </motion.div>
              )}

              {selectedJob.status === 'en-route' && hasArrived && (
                <motion.div key="en-route-otp" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-muted/30 rounded-2xl p-6 text-center">
                  <h3 className="font-semibold text-foreground text-sm mb-1">Enter Customer OTP</h3>
                  <p className="text-[11px] text-muted-foreground mb-4">Ask the customer for their 4-digit code</p>
                  <div className="flex justify-center mb-4">
                    <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                      <InputOTPGroup className="gap-2">
                        {[0, 1, 2, 3].map(i => (
                          <InputOTPSlot key={i} index={i} className="w-12 h-12 rounded-xl border border-border text-lg font-bold focus:border-primary" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button onClick={verifyOtp} disabled={otp.length < 4} className="w-full h-11 rounded-2xl font-semibold text-sm disabled:opacity-40">
                    Verify OTP
                  </Button>
                </motion.div>
              )}

              {selectedJob.status === 'otp-verified' && (
                <motion.div key="verified" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                  <div className="bg-muted/30 rounded-2xl p-6 text-center">
                    <CircleCheck className="h-6 w-6 text-primary-ink mx-auto mb-2" strokeWidth={1.5} />
                    <p className="font-semibold text-foreground text-sm mb-1">OTP Verified!</p>
                    <p className="text-[11px] text-muted-foreground mb-3">Take a "before" photo to start</p>
                  </div>
                  <PhotoCapture
                    bookingId={selectedJob.id}
                    photoType="before"
                    userId={user!.id}
                    onPhotoUploaded={(url) => setBeforePhotoUrl(url)}
                    existingUrl={beforePhotoUrl || undefined}
                  />
                  <Button onClick={startJob} disabled={!beforePhotoUrl}
                    className="w-full h-11 rounded-2xl font-semibold text-sm disabled:opacity-40">
                    Start Cleaning 🧹
                  </Button>
                </motion.div>
              )}

              {selectedJob.status === 'in-progress' && (
                <motion.div key="in-progress" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                  <div className="bg-muted/30 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="font-semibold text-foreground text-sm">In Progress</span>
                    </div>
                    <Textarea placeholder="Completion notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="rounded-xl border-border/50 mb-3 resize-none text-sm" />
                  </div>
                  <PhotoCapture
                    bookingId={selectedJob.id}
                    photoType="after"
                    userId={user!.id}
                    onPhotoUploaded={(url) => setAfterPhotoUrl(url)}
                    existingUrl={afterPhotoUrl || undefined}
                  />
                  <Button onClick={completeJob} disabled={!afterPhotoUrl}
                    className="w-full h-11 rounded-2xl font-semibold text-sm disabled:opacity-40">
                    Mark Complete ✅
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </PageTransition>
      </CleanerLayout>
    );
  }

  // ─── Job List View ───
  const JobCard = ({ b, showAccept = false }: { b: any; showAccept?: boolean }) => {
    const PIcon = propertyIcons[b.property_type] || Home;
    const isExpress = isExpressBooking(b);
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => !showAccept && setSelectedBooking(b.id)}
        className={`rounded-2xl p-4 transition-colors ${
          showAccept ? 'border border-primary/10 bg-primary/[0.02]' : 'bg-muted/30 cursor-pointer hover:bg-muted/50'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isExpress ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
              {isExpress ? <Zap className="h-4 w-4 text-amber-600" strokeWidth={1.5} /> : <PIcon className="h-4 w-4 text-primary" strokeWidth={1.5} />}
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">{b.service_name}</h4>
              <p className="text-[11px] text-muted-foreground capitalize">{b.property_type}</p>
            </div>
          </div>
          <span className="text-base font-display font-black text-primary">£{b.total_cost}</span>
        </div>
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <User className="h-3 w-3 text-muted-foreground/70" strokeWidth={1.5} /> {b.customer_name}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 text-muted-foreground/70" strokeWidth={1.5} /> {b.address_line1}, {b.address_postcode}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3 text-muted-foreground/70" strokeWidth={1.5} /> {b.date} at {b.time} · {b.duration}h
          </div>
        </div>
        {showAccept ? (
          <Button size="sm" onClick={(e) => { e.stopPropagation(); acceptJob.mutate(b.id); }} disabled={acceptJob.isPending}
            className="w-full rounded-xl text-xs font-semibold h-9">
            Accept Job
          </Button>
        ) : (
          <div className="flex items-center justify-between">
            <Badge className={`text-[9px] rounded-lg font-medium border-0 capitalize ${
              b.status === 'in-progress' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {b.status.replace('-', ' ')}
            </Badge>
            <span className="flex items-center gap-0.5 text-[11px] text-primary font-medium">
              View <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <CleanerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6 space-y-5">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-lg font-display font-black text-foreground">Jobs</h1>
          </div>

          <Tabs defaultValue="available">
            <TabsList className="w-full bg-muted/50 rounded-2xl p-1 mb-4">
              <TabsTrigger value="available" className="flex-1 rounded-xl text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Available ({available.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex-1 rounded-xl text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Upcoming ({upcomingJobs.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex-1 rounded-xl text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Active ({activeJobs.length})
              </TabsTrigger>
              <TabsTrigger value="done" className="flex-1 rounded-xl text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Done ({completed.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="available">
              {/* Express / Schedule toggle */}
              <div className="mb-4">
                <ToggleGroup type="single" value={jobFilter} onValueChange={v => setJobFilter(v || 'all')} className="bg-muted/30 rounded-xl p-1 w-full">
                  <ToggleGroupItem value="all" className="flex-1 rounded-lg text-[11px] font-medium h-8 data-[state=on]:bg-background data-[state=on]:shadow-sm">
                    All ({available.length})
                  </ToggleGroupItem>
                  <ToggleGroupItem value="express" className="flex-1 rounded-lg text-[11px] font-medium h-8 data-[state=on]:bg-background data-[state=on]:shadow-sm">
                    <Zap className="h-3 w-3 mr-1 text-amber-600" /> Express ({expressCount})
                  </ToggleGroupItem>
                  <ToggleGroupItem value="schedule" className="flex-1 rounded-lg text-[11px] font-medium h-8 data-[state=on]:bg-background data-[state=on]:shadow-sm">
                    <CalendarDays className="h-3 w-3 mr-1" /> Schedule ({scheduleCount})
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              {filteredAvailable.length === 0 ? (
                <EmptyState icon={Briefcase} title="No available jobs" description="No jobs right now ☕" />
              ) : (
                <div className="space-y-2">
                  {filteredAvailable.map(b => <JobCard key={b.id} b={b} showAccept />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upcoming">
              {upcomingJobs.length === 0 ? (
                <EmptyState icon={CalendarDays} title="No upcoming jobs" description="Accept a job to see it here" />
              ) : (
                <div className="space-y-2">
                  {upcomingJobs.map(b => <JobCard key={b.id} b={b} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="active">
              {activeJobs.length === 0 ? (
                <EmptyState icon={Briefcase} title="No active jobs" description="Your in-progress jobs will show here" />
              ) : (
                <div className="space-y-2">
                  {activeJobs.map(b => <JobCard key={b.id} b={b} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="done">
              {completed.length === 0 ? (
                <EmptyState icon={CircleCheck} title="No completed jobs" description="Your completed jobs will show here" />
              ) : (
                <div className="space-y-2">
                  {completed.map(b => (
                    <div key={b.id} className="bg-muted/30 rounded-2xl p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-foreground text-sm">{b.service_name}</h4>
                        <span className="text-sm font-display font-black text-primary">£{b.total_cost}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{b.customer_name} · {b.date}</p>
                      {b.rating && <p className="text-[11px] text-primary mt-1">★ {b.rating}/5</p>}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </CleanerLayout>
  );
}
