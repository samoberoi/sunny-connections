import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CustomerOnboarding from './CustomerOnboarding';
import CleanerOnboarding from './CleanerOnboarding';
import CleanerTrainingGate from './CleanerTrainingGate';
import RoleOnboarding from './RoleOnboarding';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [needsTraining, setNeedsTraining] = useState(false);
  const [showRoleIntro, setShowRoleIntro] = useState(false);
  const [recheckCounter, setRecheckCounter] = useState(0);

  useEffect(() => {
    if (!user?.id) { setOnboardingChecked(true); return; }
    
    const check = async () => {
      // Check onboarding
      const { data: profile } = await supabase.from('profiles').select('onboarding_completed').eq('user_id', user.id).maybeSingle();
      const onboardingDone = !!profile?.onboarding_completed;
      setNeedsOnboarding(!onboardingDone);

      // Check if role intro slides were shown (localStorage persists across tabs/redirects)
      const introSeen = localStorage.getItem(`role_intro_${user.id}`);
      if (!onboardingDone && !introSeen) {
        setShowRoleIntro(true);
      } else {
        setShowRoleIntro(false);
      }

      // For cleaners, also check training completion
      if (user.role === 'cleaner' && onboardingDone) {
        const { count: totalModules } = await supabase.from('training_modules').select('*', { count: 'exact', head: true });
        const { count: completedModules } = await supabase.from('training_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', true);
        const trainingNeeded = (totalModules || 0) > 0 && (completedModules || 0) < (totalModules || 0);
        setNeedsTraining(trainingNeeded);
        
        // Check if cleaner is verified - if yes, skip training regardless
        const { data: cleaner } = await supabase.from('cleaners').select('verified').eq('user_id', user.id).maybeSingle();
        if (cleaner?.verified) {
          setNeedsTraining(false);
        }
      } else {
        setNeedsTraining(false);
      }

      setOnboardingChecked(true);
    };
    check();
  }, [user?.id, user?.role, recheckCounter]);

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

  // Show role introduction slides for new users (one-time)
  if (showRoleIntro && user?.role !== 'admin') {
    return (
      <RoleOnboarding
        role={user!.role}
        userName={user!.name}
        onComplete={() => {
          localStorage.setItem(`role_intro_${user!.id}`, '1');
          setShowRoleIntro(false);
        }}
      />
    );
  }

  // Show onboarding wizard for new users (skip for admin)
  if (needsOnboarding && user?.role !== 'admin') {
    const handleComplete = () => {
      setNeedsOnboarding(false);
      // Re-run the check so training gate activates for cleaners
      setRecheckCounter(c => c + 1);
    };
    if (user?.role === 'customer') return <CustomerOnboarding onComplete={handleComplete} />;
    if (user?.role === 'cleaner') return <CleanerOnboarding onComplete={handleComplete} />;
  }

  // Mandatory training gate for cleaners - this fires AFTER onboarding is done
  if (needsTraining && user?.role === 'cleaner') {
    return <CleanerTrainingGate onComplete={() => setNeedsTraining(false)} />;
  }

  return <>{children}</>;
}
