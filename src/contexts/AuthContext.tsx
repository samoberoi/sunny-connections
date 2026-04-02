import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'cleaner' | 'admin';

export interface AppUser {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, role: UserRole) => Promise<void>;
  verifyOtp: (otp: string) => boolean;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  verifyOtp: () => false,
  logout: async () => {},
  switchRole: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Convert phone to fake email for auth (since we're simulating phone OTP)
const phoneToEmail = (phone: string) => {
  const clean = phone.replace(/[^0-9]/g, '');
  return `${clean}@cleanfit.local`;
};

const DEFAULT_PASSWORD = 'cleanfit-test-1111';

const roleNames: Record<UserRole, string> = {
  customer: 'Alex Morgan',
  cleaner: 'Emma Thompson',
  admin: 'Admin User',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingPhone, setPendingPhone] = useState('');
  const [pendingRole, setPendingRole] = useState<UserRole>('customer');

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', newSession.user.id)
          .maybeSingle();

        if (profile) {
          setUser({
            id: newSession.user.id,
            phone: profile.phone,
            name: profile.name,
            email: profile.email || undefined,
            role: profile.role as UserRole,
            avatar: profile.avatar || undefined,
            createdAt: profile.created_at,
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!existingSession) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (phone: string, role: UserRole) => {
    setPendingPhone(phone);
    setPendingRole(role);
  };

  const verifyOtp = (otp: string): boolean => {
    // Default OTP is always 1111
    if (otp !== '1111') return false;

    // Sign up or sign in with email/password behind the scenes
    const email = phoneToEmail(pendingPhone);
    const name = roleNames[pendingRole];

    (async () => {
      // Try sign in first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: DEFAULT_PASSWORD,
      });

      if (signInError) {
        // Sign up if not exists
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password: DEFAULT_PASSWORD,
          options: {
            data: {
              name,
              phone: pendingPhone,
              role: pendingRole,
            },
          },
        });

        if (signUpError) {
          console.error('Auth error:', signUpError);
          return;
        }
      }

      // Update profile role if it changed
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase
          .from('profiles')
          .update({ role: pendingRole, phone: pendingPhone, name })
          .eq('user_id', authUser.id);
      }
    })();

    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const switchRole = async (role: UserRole) => {
    if (!user || !session) return;
    await supabase
      .from('profiles')
      .update({ role })
      .eq('user_id', user.id);
    setUser({ ...user, role });
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!user,
      isLoading,
      login,
      verifyOtp,
      logout,
      switchRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
