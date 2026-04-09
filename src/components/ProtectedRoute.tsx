import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CustomerOnboarding from './CustomerOnboarding';
import CleanerOnboarding from './CleanerOnboarding';
import CleanerTrainingGate from './CleanerTrainingGate';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [needsTraining, setNeedsTraining] = useState(false);

  useEffect(() => {
    if (!user?.id) { setOnboardingChecked(true); return; }
    
    const check = async () => {
      // Check onboarding
      const { data: profile } = await supabase.from('profiles').select('onboarding_completed').eq('user_id', user.id).maybeSingle();
      const onboardingDone = !!profile?.onboarding_completed;
      setNeedsOnboarding(!onboardingDone);

      // For cleaners, also check training completion
      if (user.role === 'cleaner' && onboardingDone) {
        const { count: totalModules } = await supabase.from('training_modules').select('*', { count: 'exact', head: true });
        const { count: completedModules } = await supabase.from('training_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', true);
        setNeedsTraining((totalModules || 0) > 0 && (completedModules || 0) < (totalModules || 0));
      } else {
        setNeedsTraining(false);
      }

      setOnboardingChecked(true);
    };
    check();
  }, [user?.id, user?.role]);

  if (isLoading || !onboardingChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'customer') return <Navigate to="/home" replace />;
    if (user.role === 'cleaner') return <Navigate to="/cleaner" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
  }

  // Show onboarding wizard for new users (skip for admin)
  if (needsOnboarding && user?.role !== 'admin') {
    const handleComplete = () => setNeedsOnboarding(false);
    if (user?.role === 'customer') return <CustomerOnboarding onComplete={handleComplete} />;
    if (user?.role === 'cleaner') return <CleanerOnboarding onComplete={handleComplete} />;
  }

  // Mandatory training gate for cleaners
  if (needsTraining && user?.role === 'cleaner') {
    return <CleanerTrainingGate onComplete={() => setNeedsTraining(false)} />;
  }

  return <>{children}</>;
}
