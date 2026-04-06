import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CustomerOnboarding from './CustomerOnboarding';
import CleanerOnboarding from './CleanerOnboarding';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!user?.id) { setOnboardingChecked(true); return; }
    
    supabase.from('profiles').select('onboarding_completed').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => {
        setNeedsOnboarding(!data?.onboarding_completed);
        setOnboardingChecked(true);
      });
  }, [user?.id]);

  if (isLoading || !onboardingChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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

  return <>{children}</>;
}
