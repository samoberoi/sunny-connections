import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import {
  buildUserFromAuth,
  buildUserFromProfile,
  DEFAULT_PASSWORD,
  normalizeRole,
  phoneToEmail,
  roleNames,
} from './auth-helpers';

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
  verifyOtp: (otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  verifyOtp: async () => false,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

type ProfilePayload = {
  email?: string;
  name: string;
  phone: string;
  role: UserRole;
};

const syncProfileRecord = async (userId: string, profile: ProfilePayload) => {
  const payload = {
    email: profile.email ?? null,
    name: profile.name,
    phone: profile.phone,
    role: profile.role,
    user_id: userId,
  };

  const { data: updatedProfiles, error: updateError } = await supabase
    .from('profiles')
    .update(payload)
    .eq('user_id', userId)
    .select('id');

  if (updateError) {
    console.error('Profile update failed:', updateError);
    return;
  }

  if ((updatedProfiles?.length ?? 0) > 0) {
    return;
  }

  const { error: insertError } = await supabase
    .from('profiles')
    .insert(payload);

  if (insertError) {
    console.error('Profile insert failed:', insertError);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');
  const [pendingRole, setPendingRole] = useState<UserRole>('customer');

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
    });

    void supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!isMounted) return;
      setSession(existingSession);
      setIsAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    let cancelled = false;

    if (!session?.user) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    void supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data: profile, error }) => {
        if (cancelled) return;

        if (error) {
          console.error('Failed to load profile:', error);
          setUser(buildUserFromAuth(session.user));
          setIsLoading(false);
          return;
        }

        if (profile) {
          setUser(buildUserFromProfile(session.user, profile));
        } else {
          setUser(buildUserFromAuth(session.user));
        }

        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthReady, session]);

  const login = async (phone: string, role: UserRole) => {
    setPendingPhone(phone);
    setPendingRole(normalizeRole(role));
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    if (otp !== '1111' || !pendingPhone) return false;

    const email = phoneToEmail(pendingPhone);
    const role = normalizeRole(pendingRole) as UserRole;
    const name = roleNames[role];

    try {
      let authUser: Session['user'] | null = null;
      let nextSession: Session | null = null;

      const signInResult = await supabase.auth.signInWithPassword({
        email,
        password: DEFAULT_PASSWORD,
      });

      if (signInResult.error) {
        const signUpResult = await supabase.auth.signUp({
          email,
          password: DEFAULT_PASSWORD,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name, phone: pendingPhone, role },
          },
        });

        if (signUpResult.error) {
          console.error('Auth error:', signUpResult.error);
          return false;
        }

        authUser = signUpResult.data.user;
        nextSession = signUpResult.data.session;

        if (authUser && !nextSession) {
          const retryResult = await supabase.auth.signInWithPassword({
            email,
            password: DEFAULT_PASSWORD,
          });

          if (retryResult.error) {
            console.error('Sign-in after signup failed:', retryResult.error);
            return false;
          }

          authUser = retryResult.data.user;
          nextSession = retryResult.data.session;
        }
      } else {
        authUser = signInResult.data.user;
        nextSession = signInResult.data.session;
      }

      if (authUser) {
        const nextUser: AppUser = {
          id: authUser.id,
          phone: pendingPhone,
          name,
          email,
          role,
          createdAt: authUser.created_at ?? new Date().toISOString(),
        };

        setUser(nextUser);

        if (nextSession) {
          setSession(nextSession);
        }

        void syncProfileRecord(authUser.id, {
          email,
          name,
          phone: pendingPhone,
          role,
        });

        return true;
      }

      return false;
    } catch (err) {
      console.error('verifyOtp unexpected error:', err);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
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
    }}>
      {children}
    </AuthContext.Provider>
  );
};
