import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function DeleteAccountButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('delete-user', { body: {} });
      if (error) throw error;
      toast.success('Your account has been deleted');
      await logout();
      navigate('/');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Could not delete account. Please contact support.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full h-12 rounded-full text-destructive hover:bg-destructive/5 font-bold text-sm"
        >
          <Trash2 className="h-4 w-4 mr-2" strokeWidth={1.5} /> Delete account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-destructive/15 flex items-center justify-center mb-2">
            <AlertTriangle className="h-6 w-6 text-destructive" strokeWidth={1.5} />
          </div>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              This is permanent. Your profile, addresses, saved cleaners and personal details will be removed.
              Past bookings are kept anonymously for cleaner records and tax purposes.
            </span>
            <span className="block font-bold text-foreground">
              Type <span className="text-destructive">DELETE</span> to confirm.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="DELETE"
          className="h-12 rounded-2xl"
        />
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={confirm !== 'DELETE' || loading}
            onClick={(e) => { e.preventDefault(); handleDelete(); }}
            className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Deleting…' : 'Delete forever'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
