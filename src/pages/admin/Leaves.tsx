import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarOff, Check, X, AlertTriangle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AdminLeaves() {
  const queryClient = useQueryClient();

  const { data: leaves = [] } = useQuery({
    queryKey: ['admin-leaves'],
    queryFn: async () => {
      const { data } = await supabase.from('cleaner_leaves').select('*, cleaners(name, user_id)').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-leave-bookings'],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('*').in('status', ['assigned', 'en-route']).order('date');
      return data || [];
    },
  });

  const updateLeave = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('cleaner_leaves').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-leaves'] });
      toast.success(`Leave ${status}!`);
    },
  });

  const pendingLeaves = leaves.filter((l: any) => l.status === 'pending');
  const otherLeaves = leaves.filter((l: any) => l.status !== 'pending');

  const getConflicts = (leave: any) => {
    return bookings.filter(b =>
      b.cleaner_id === leave.cleaner_id &&
      b.date >= leave.start_date &&
      b.date <= leave.end_date
    );
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600',
    approved: 'bg-primary/10 text-primary-ink',
    rejected: 'bg-destructive/10 text-destructive',
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-black text-foreground">Leave Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage cleaner time off</p>
      </div>

      {/* Pending requests */}
      {pendingLeaves.length > 0 && (
        <section className="mb-8">
          <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Pending ({pendingLeaves.length})
          </h3>
          <div className="space-y-3">
            {pendingLeaves.map((leave: any) => {
              const conflicts = getConflicts(leave);
              return (
                <motion.div key={leave.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-3xl p-5 shadow-soft border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center text-background font-bold">
                        {(leave.cleaners?.name || 'C')[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{leave.cleaners?.name || 'Unknown'}</h4>
                        <p className="text-[11px] text-muted-foreground">{leave.start_date} → {leave.end_date}</p>
                      </div>
                    </div>
                  </div>
                  {leave.reason && <p className="text-xs text-muted-foreground mb-3">{leave.reason}</p>}
                  
                  {conflicts.length > 0 && (
                    <div className="bg-amber-500/5 rounded-2xl p-3 mb-3">
                      <p className="text-xs font-bold text-amber-600 mb-1">⚠️ {conflicts.length} booking conflict{conflicts.length > 1 ? 's' : ''}</p>
                      {conflicts.map(c => (
                        <p key={c.id} className="text-[11px] text-muted-foreground">{c.service_name} - {c.date} ({c.customer_name})</p>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button onClick={() => updateLeave.mutate({ id: leave.id, status: 'approved' })} size="sm"
                      className="flex-1 rounded-xl text-xs font-bold h-10 bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5 mr-1" /> Approve
                    </Button>
                    <Button onClick={() => updateLeave.mutate({ id: leave.id, status: 'rejected' })} size="sm" variant="outline"
                      className="flex-1 rounded-xl text-xs font-bold h-10 text-destructive border-destructive/20">
                      <X className="h-3.5 w-3.5 mr-1" /> Reject
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* All leaves */}
      {leaves.length === 0 ? (
        <EmptyState icon={CalendarOff} title="No leave requests" description="Cleaners haven't requested any time off yet" />
      ) : (
        <div className="glass-card-elevated rounded-2xl overflow-hidden shadow-apple">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cleaner</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otherLeaves.map((leave: any) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">{leave.cleaners?.name || 'Unknown'}</TableCell>
                  <TableCell className="text-sm">{leave.start_date} → {leave.end_date}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{leave.reason || '—'}</TableCell>
                  <TableCell>
                    <Badge className={`text-[9px] rounded-lg font-medium border-0 capitalize ${statusColors[leave.status] || 'bg-muted text-muted-foreground'}`}>
                      {leave.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
}
