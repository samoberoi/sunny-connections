import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Star, LogOut, Shield, Award, BadgeCheck, ShieldCheck, Copy, Clock, Calendar, Pencil, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import CleanerLayout from '@/components/layout/CleanerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatDateUK } from '@/lib/date';

function CleanerJobHistory({ cleanerId }: { cleanerId: string }) {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['cleaner-job-history', cleanerId],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('*').eq('cleaner_id', cleanerId).order('date', { ascending: false }).limit(20);
      return data || [];
    },
    enabled: !!cleanerId,
  });

  if (isLoading) return null;
  if (history.length === 0) return (
    <div className="bg-card rounded-3xl p-5 shadow-soft border border-border">
      <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2"><Clock className="h-4 w-4" /> Job History</h3>
      <p className="text-sm text-muted-foreground">No jobs completed yet</p>
    </div>
  );

  return (
    <div className="bg-card rounded-3xl p-5 shadow-soft border border-border">
      <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2"><Clock className="h-4 w-4" /> Job History</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {history.map((b: any) => (
          <div key={b.id} className="flex items-start gap-3 p-3 rounded-2xl bg-muted/50">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4 text-foreground" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{b.service_name}</p>
              <p className="text-[10px] text-muted-foreground">{formatDateUK(b.date)} · {b.duration}h</p>
              <p className="text-[10px] text-muted-foreground">Customer: {b.customer_name}</p>
            </div>
            <div className="text-right shrink-0">
              <Badge className={`rounded-full text-[9px] px-2 py-0.5 border-0 ${b.status === 'completed' ? 'bg-primary/15 text-primary' : b.status === 'cancelled' ? 'bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                {b.status}
              </Badge>
              {b.rating && (
                <div className="flex items-center gap-0.5 mt-1 justify-end">
                  <Star className="h-3 w-3 text-primary" fill="currentColor" />
                  <span className="text-[10px] font-bold">{b.rating}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CleanerProfile() {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: cleaner } = useQuery({
    queryKey: ['my-cleaner-record', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('cleaners').select('*').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const cleanerCode = cleaner?.id ? `CF-${cleaner.id.substring(0, 8).toUpperCase()}` : null;

  const copyCode = () => {
    if (cleanerCode) {
      navigator.clipboard.writeText(cleanerCode);
      toast.success('Cleaner ID copied!');
    }
  };

  const startEdit = () => {
    setEditFirstName(cleaner?.first_name || user?.name?.split(' ')[0] || '');
    setEditLastName(cleaner?.last_name || user?.name?.split(' ').slice(1).join(' ') || '');
    setEditName(user?.name || '');
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const fullName = `${editFirstName.trim()} ${editLastName.trim()}`.trim();
      await supabase.from('profiles').update({ name: fullName }).eq('user_id', user.id);
      await supabase.from('cleaners').update({
        name: fullName,
        first_name: editFirstName.trim(),
        last_name: editLastName.trim(),
      }).eq('user_id', user.id);
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['my-cleaner-record'] });
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <CleanerLayout>
      <PageTransition>
        <div className="px-5 pt-14 pb-6 space-y-5">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-2xl font-display font-black text-foreground">Profile</h1>
          </div>

          {/* Profile card */}
          <div className="bg-card rounded-3xl p-6 shadow-soft border border-border text-center relative">
            {!editing && (
              <button onClick={startEdit} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                <Pencil className="h-4 w-4 text-foreground" strokeWidth={1.5} />
              </button>
            )}
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-full bg-foreground mx-auto mb-3 flex items-center justify-center text-background font-bold text-2xl relative">
              {user?.name?.[0] || 'C'}
              {cleaner?.verified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                  <BadgeCheck className="h-4 w-4 text-primary-foreground" strokeWidth={2} />
                </div>
              )}
            </motion.div>

            {editing ? (
              <div className="space-y-3 mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="First name" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} className="h-11 rounded-xl text-sm" />
                  <Input placeholder="Last name" value={editLastName} onChange={e => setEditLastName(e.target.value)} className="h-11 rounded-xl text-sm" />
                </div>
                <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                  <Smartphone className="h-3.5 w-3.5" strokeWidth={1.5} /> {user?.phone}
                  <span className="text-[9px] text-muted-foreground/50 ml-1">(cannot change)</span>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setEditing(false)} variant="outline" size="sm" className="flex-1 rounded-full">
                    <X className="h-3.5 w-3.5 mr-1" /> Cancel
                  </Button>
                  <Button onClick={saveEdit} disabled={saving || !editFirstName.trim()} size="sm" className="flex-1 rounded-full">
                    <Save className="h-3.5 w-3.5 mr-1" /> {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Certification Card */}
          {cleaner?.verified && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl p-5 border-2 border-primary/30 shadow-soft relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-[0.06]">
                <ShieldCheck className="h-24 w-24 text-primary" strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={2} />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">CleanFit Certified</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Cleaner ID</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-sm font-mono font-bold text-foreground">{cleanerCode}</p>
                      <button onClick={copyCode} className="text-muted-foreground hover:text-foreground transition-colors">
                        <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Status</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <BadgeCheck className="h-4 w-4 text-primary" strokeWidth={2} />
                      <span className="text-sm font-bold text-primary">Verified</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 bg-primary/10 rounded-xl py-2 flex items-center justify-center gap-1.5">
                  <BadgeCheck className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                  <span className="text-[10px] font-bold text-primary">Verified by CleanFit ✓</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          {cleaner && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary rounded-3xl p-5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary-foreground">{cleaner.verified ? 'Verified' : 'Pending'}</p>
                  <p className="text-[10px] text-primary-foreground/60">{cleaner.verified ? 'DBS Checked' : 'Complete training'}</p>
                </div>
              </div>
              <div className="bg-foreground rounded-3xl p-5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-background/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-background">{cleaner.experience} yrs</p>
                  <p className="text-[10px] text-background/60">Experience</p>
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

          {/* Job History */}
          {cleaner && <CleanerJobHistory cleanerId={cleaner.id} />}

          <Button onClick={async () => { await logout(); navigate('/'); }} variant="outline"
            className="w-full h-12 rounded-full text-destructive border-2 border-destructive/20 hover:bg-destructive/5 font-bold">
            <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} /> Log Out
          </Button>
          <DeleteAccountButton />
        </div>
      </PageTransition>
    </CleanerLayout>
  );
}
