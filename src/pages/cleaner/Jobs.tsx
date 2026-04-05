import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, User, CircleCheck, Briefcase, Home, Building2, Landmark, PoundSterling, Navigation, Phone, MessageCircle, ChevronRight, MapPinCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CleanerLayout from '@/components/layout/CleanerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import EmptyState from '@/components/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const propertyIcons: Record<string, any> = { flat: Building2, house: Home, office: Landmark };

export default function CleanerJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [notes, setNotes] = useState('');
  const [hasArrived, setHasArrived] = useState(false);

  const { data: cleanerRecord } = useQuery({
    queryKey: ['my-cleaner-record', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('cleaners').select('*').eq('user_id', user.id).maybeSingle();
      if (data) return data;
      // Auto-create cleaner record if missing
      const { data: created, error } = await supabase.from('cleaners').insert({
        user_id: user.id,
        name: user.name || 'Cleaner',
      }).select().single();
      if (error) { console.error('Failed to create cleaner record', error); return null; }
      return created;
    },
    enabled: !!user?.id,
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ['cleaner-all-bookings', cleanerRecord?.id],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!cleanerRecord,
  });

  // Realtime subscription for new bookings
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
  const myJobs = allBookings.filter(b => b.cleaner_id === cleanerRecord?.id && !['completed', 'cancelled'].includes(b.status));
  const completed = allBookings.filter(b => b.cleaner_id === cleanerRecord?.id && b.status === 'completed');

  const acceptJob = useMutation({
    mutationFn: async (bookingId: string) => {
      if (!cleanerRecord || !user) return;
      const { error } = await supabase.from('bookings').update({
        cleaner_id: cleanerRecord.id, cleaner_name: user.name, status: 'assigned' as any,
      }).eq('id', bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaner-all-bookings'] });
      toast.success('Job accepted! 🎉');
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('bookings').update({ status: status as any }).eq('id', id);
      if (error) throw error;
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
    return (
      <CleanerLayout>
        <PageTransition>
          <div className="px-5 pt-6 pb-6">
            <div className="flex items-center gap-3 mb-6">
              <BackButton onClick={() => { setSelectedBooking(null); setOtp(''); }} />
              <h1 className="text-xl font-display font-black text-foreground">Job Details</h1>
            </div>

            {/* Customer & Service Info */}
            <div className="border border-border rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {selectedJob.customer_name[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-foreground">{selectedJob.customer_name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedJob.service_name}</p>
                </div>
                <Badge className="bg-primary/10 text-primary text-[10px] rounded-lg font-semibold border-0 capitalize">
                  {selectedJob.status.replace('-', ' ')}
                </Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                    <PropIcon className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  </div>
                  <span className="capitalize">{selectedJob.property_type}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  </div>
                  <span>{selectedJob.address_line1}, {selectedJob.address_postcode}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  </div>
                  <span>{selectedJob.date} at {selectedJob.time} · {selectedJob.duration}h</span>
                </div>
              </div>

              {selectedJob.notes && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-foreground">{selectedJob.notes}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border flex justify-between font-display font-black text-xl">
                <span>Your Earnings</span>
                <span className="text-primary">£{selectedJob.total_cost}</span>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={() => {
                // Get customer phone from profiles
                window.open(`tel:+1111111111`, '_self');
              }} className="flex-1 rounded-xl font-medium text-xs h-10 border-primary/20 text-primary hover:bg-accent">
                <Phone className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Call Customer
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/chat', { state: { bookingId: selectedJob.id, otherName: selectedJob.customer_name } })} className="flex-1 rounded-xl font-medium text-xs h-10 border-primary/20 text-primary hover:bg-accent">
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Chat
              </Button>
            </div>

            {/* Status-specific actions */}
            <AnimatePresence mode="wait">
              {selectedJob.status === 'assigned' && (
                <motion.div key="assigned" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border border-border rounded-2xl p-6 text-center">
                  <Navigation className="h-8 w-8 text-primary mx-auto mb-3" strokeWidth={1.5} />
                  <p className="font-semibold text-foreground mb-1">Ready to go?</p>
                  <p className="text-xs text-muted-foreground mb-5">Tap below when you're heading to the customer</p>
                  <Button onClick={goEnRoute} className="w-full h-12 rounded-2xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                    I'm On My Way 🚗
                  </Button>
                </motion.div>
              )}

              {selectedJob.status === 'en-route' && !hasArrived && (
                <motion.div key="en-route-travel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border border-border rounded-2xl p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Navigation className="h-7 w-7 text-primary animate-pulse" strokeWidth={1.5} />
                  </div>
                  <p className="font-semibold text-foreground mb-1">You're on your way</p>
                  <p className="text-xs text-muted-foreground mb-5">Tap below when you arrive at the customer's location</p>
                  <Button onClick={() => setHasArrived(true)} className="w-full h-12 rounded-2xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                    <MapPinCheck className="h-4 w-4 mr-2" strokeWidth={1.5} /> I've Arrived 📍
                  </Button>
                </motion.div>
              )}

              {selectedJob.status === 'en-route' && hasArrived && (
                <motion.div key="en-route-otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border border-border rounded-2xl p-6 text-center">
                  <h3 className="font-semibold text-foreground mb-2 text-sm">Enter Customer OTP</h3>
                  <p className="text-xs text-muted-foreground mb-5">Ask the customer for their 4-digit verification code</p>
                  <div className="flex justify-center mb-5">
                    <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                      <InputOTPGroup className="gap-3">
                        {[0,1,2,3].map(i => (
                          <InputOTPSlot key={i} index={i} className="w-14 h-14 rounded-2xl border-2 border-border text-xl font-bold focus:border-primary" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button onClick={verifyOtp} disabled={otp.length < 4} className="w-full h-12 rounded-2xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40">
                    Verify OTP
                  </Button>
                </motion.div>
              )}

              {selectedJob.status === 'otp-verified' && (
                <motion.div key="verified" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border border-border rounded-2xl p-6 text-center">
                  <CircleCheck className="h-8 w-8 text-primary mx-auto mb-3" strokeWidth={1.5} />
                  <p className="font-semibold text-foreground mb-1">OTP Verified!</p>
                  <p className="text-xs text-muted-foreground mb-5">You're good to start cleaning</p>
                  <Button onClick={startJob} className="w-full h-12 rounded-2xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                    Start Cleaning 🧹
                  </Button>
                </motion.div>
              )}

              {selectedJob.status === 'in-progress' && (
                <motion.div key="in-progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="font-semibold text-foreground text-sm">Cleaning in Progress</span>
                  </div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Completion Notes</label>
                  <Textarea placeholder="Any notes about the job..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="rounded-xl border-border mb-4 resize-none focus-visible:ring-primary/30" />
                  <Button onClick={completeJob} className="w-full h-12 rounded-2xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                    Mark as Complete ✅
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
  return (
    <CleanerLayout>
      <PageTransition>
        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <BackButton />
            <h1 className="text-xl font-display font-black text-foreground">Jobs</h1>
          </div>

          <Tabs defaultValue="available">
            <TabsList className="w-full bg-muted rounded-2xl p-1 mb-5">
              <TabsTrigger value="available" className="flex-1 rounded-xl text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Available ({available.length})
              </TabsTrigger>
              <TabsTrigger value="my-jobs" className="flex-1 rounded-xl text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                My Jobs ({myJobs.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1 rounded-xl text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Done ({completed.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="available">
              {available.length === 0 ? (
                <EmptyState icon={Briefcase} title="No available jobs" description="No jobs right now. Cuppa time! ☕" />
              ) : (
                <div className="space-y-3">
                  {available.map(b => {
                    const PIcon = propertyIcons[b.property_type] || Home;
                    return (
                      <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.98 }} className="border border-border rounded-2xl p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                              <PIcon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground text-sm">{b.service_name}</h4>
                              <p className="text-xs text-muted-foreground capitalize">{b.property_type}</p>
                            </div>
                          </div>
                          <span className="text-lg font-display font-black text-primary">£{b.total_cost}</span>
                        </div>
                        <div className="space-y-1.5 mb-4">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3 w-3 text-primary" strokeWidth={1.5} /> {b.customer_name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 text-primary" strokeWidth={1.5} /> {b.address_line1}, {b.address_postcode}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 text-primary" strokeWidth={1.5} /> {b.date} at {b.time} · {b.duration}h
                          </div>
                        </div>
                        <Button size="sm" onClick={() => acceptJob.mutate(b.id)} disabled={acceptJob.isPending}
                          className="w-full rounded-xl text-xs font-semibold h-10 bg-primary text-primary-foreground hover:bg-primary/90">
                          Accept Job
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-jobs">
              {myJobs.length === 0 ? (
                <EmptyState icon={Briefcase} title="No active jobs" description="Accept a job to get started" />
              ) : (
                <div className="space-y-3">
                  {myJobs.map(b => (
                    <motion.div key={b.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedBooking(b.id)} className="border border-border rounded-2xl p-4 cursor-pointer hover:border-primary/20 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-foreground text-sm">{b.service_name}</h4>
                        <Badge className="bg-primary/10 text-primary text-[10px] rounded-lg font-medium border-0 capitalize">{b.status.replace('-', ' ')}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{b.customer_name} · £{b.total_cost}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 text-primary" strokeWidth={1.5} /> {b.address_postcode}
                        <span className="ml-auto flex items-center gap-1 text-primary font-medium">
                          View <ChevronRight className="h-3 w-3" strokeWidth={2} />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completed.length === 0 ? (
                <EmptyState icon={CircleCheck} title="No completed jobs" description="Your completed jobs will show here" />
              ) : (
                <div className="space-y-3">
                  {completed.map(b => (
                    <div key={b.id} className="border border-border rounded-2xl p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-foreground text-sm">{b.service_name}</h4>
                        <span className="text-sm font-display font-black text-primary">£{b.total_cost}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{b.customer_name} · {b.date}</p>
                      {b.rating && <p className="text-xs text-primary mt-1">★ {b.rating}/5</p>}
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
