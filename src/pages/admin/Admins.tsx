import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const phoneToEmail = (phone: string) => `${phone.replace(/[^0-9]/g, '')}@cleanfit.phone`;

export default function AdminAdmins() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newPhone, setNewPhone] = useState('');

  const { data: adminRoles = [] } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const { data } = await supabase.from('user_roles').select('*').eq('role', 'admin');
      return data || [];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'admin');
      return data || [];
    },
  });

  const admins = adminRoles.map(r => {
    const profile = profiles.find((p: any) => p.user_id === r.user_id);
    return { ...r, name: profile?.name || 'Unknown', phone: profile?.phone || '' };
  });

  const addAdmin = useMutation({
    mutationFn: async (phone: string) => {
      const email = phoneToEmail(phone);
      // Find user by email in profiles
      const { data: profile } = await supabase.from('profiles').select('user_id').eq('phone', phone).maybeSingle();
      if (!profile?.user_id) {
        throw new Error('No user found with this phone number. They must sign up first.');
      }
      // Check if already admin
      const existing = adminRoles.find(r => r.user_id === profile.user_id);
      if (existing) throw new Error('This user is already an admin');
      
      const { error } = await supabase.from('user_roles').insert({ user_id: profile.user_id, role: 'admin' as any });
      if (error) throw error;
      // Update profile role
      await supabase.from('profiles').update({ role: 'admin' }).eq('user_id', profile.user_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      setNewPhone('');
      toast.success('Admin added!');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const removeAdmin = useMutation({
    mutationFn: async (roleId: string) => {
      const role = adminRoles.find(r => r.id === roleId);
      if (role?.user_id === user?.id) throw new Error("You can't remove yourself");
      const { error } = await supabase.from('user_roles').delete().eq('id', roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Admin removed');
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <AdminLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="mb-5">
          <h1 className="text-2xl font-display font-black text-foreground">Admin Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage who has super admin access</p>
        </div>

        {/* Add new admin */}
        <div className="bg-card rounded-2xl p-4 border border-border mb-5">
          <p className="text-sm font-bold text-foreground mb-3">Add New Admin</p>
          <div className="flex gap-2">
            <Input
              value={newPhone}
              onChange={e => setNewPhone(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Phone number"
              inputMode="numeric"
              className="flex-1 rounded-xl h-10"
            />
            <Button
              onClick={() => addAdmin.mutate(newPhone)}
              disabled={newPhone.length < 5 || addAdmin.isPending}
              className="rounded-xl h-10 px-4"
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">User must have signed up already</p>
        </div>

        {/* Admin list */}
        {admins.length === 0 ? (
          <EmptyState icon={Users} title="No admins" description="Add your first admin above" />
        ) : (
          <div className="space-y-2">
            {admins.map((admin, i) => (
              <motion.div key={admin.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-sm shrink-0">
                  <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{admin.name}</p>
                  <p className="text-[11px] text-muted-foreground">{admin.phone}</p>
                </div>
                {admin.user_id === user?.id ? (
                  <Badge className="text-[9px] rounded-lg bg-primary/10 text-primary-ink border-0">You</Badge>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display font-bold">Remove admin?</AlertDialogTitle>
                        <AlertDialogDescription>This will revoke admin access for {admin.name}.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                        <AlertDialogAction className="rounded-full bg-destructive text-destructive-foreground" onClick={() => removeAdmin.mutate(admin.id)}>Remove</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
