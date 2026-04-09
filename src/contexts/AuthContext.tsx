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
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  verifyOtp: async () => false,
  logout: async () => {},
  refreshProfile: async () => {},
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

  if ((updatedProfiles?.length ?? 0) > 0) return;

  const { error: insertError } = await supabase.from('profiles').insert(payload);
  if (insertError) console.error('Profile insert failed:', insertError);
};

const fetchAndBuildUser = async (authUserId: string, authUser: any): Promise<AppUser> => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', authUserId)
    .maybeSingle();
  if (profile) return buildUserFromProfile(authUser, profile);
  return buildUserFromAuth(authUser);
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
    return () => { isMounted = false; subscription.unsubscribe(); };
  }, []);

  // Load user from profile when session changes
  useEffect(() => {
    if (!isAuthReady) return;
    let cancelled = false;
    if (!session?.user) { setUser(null); setIsLoading(false); return; }
    setIsLoading(true);
    fetchAndBuildUser(session.user.id, session.user).then(u => {
      if (!cancelled) { setUser(u); setIsLoading(false); }
    });
    return () => { cancelled = true; };
  }, [isAuthReady, session]);

  // Realtime listener on profiles for current user - auto-refresh name/avatar changes
  useEffect(() => {
    if (!session?.user?.id) return;
    const channel = supabase
      .channel('my-profile-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${session.user.id}`,
      }, (payload) => {
        const p = payload.new as any;
        setUser(prev => prev ? {
          ...prev,
          name: p.name || prev.name,
          phone: p.phone || prev.phone,
          email: p.email || prev.email,
          avatar: p.avatar || prev.avatar,
          role: normalizeRole(p.role),
        } : prev);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session?.user?.id]);

  const refreshProfile = async () => {
    if (!session?.user) return;
    const u = await fetchAndBuildUser(session.user.id, session.user);
    setUser(u);
  };

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

      const signInResult = await supabase.auth.signInWithPassword({ email, password: DEFAULT_PASSWORD });

      if (signInResult.error) {
        const signUpResult = await supabase.auth.signUp({
          email,
          password: DEFAULT_PASSWORD,
          options: { emailRedirectTo: window.location.origin, data: { name, phone: pendingPhone, role } },
        });
        if (signUpResult.error) { console.error('Auth error:', signUpResult.error); return false; }
        authUser = signUpResult.data.user;
        nextSession = signUpResult.data.session;
        if (authUser && !nextSession) {
          const retryResult = await supabase.auth.signInWithPassword({ email, password: DEFAULT_PASSWORD });
          if (retryResult.error) { console.error('Sign-in after signup failed:', retryResult.error); return false; }
          authUser = retryResult.data.user;
          nextSession = retryResult.data.session;
        }
      } else {
        authUser = signInResult.data.user;
        nextSession = signInResult.data.session;
      }

      if (authUser) {
        if (nextSession) setSession(nextSession);

        // Only sync profile with default name for NEW signups; for existing users, fetch their real name
        const { data: existingProfile } = await supabase.from('profiles').select('name').eq('user_id', authUser.id).maybeSingle();
        const profileName = existingProfile?.name && existingProfile.name !== 'New User' ? existingProfile.name : name;
        await syncProfileRecord(authUser.id, { email, name: profileName, phone: pendingPhone, role });
        const freshUser = await fetchAndBuildUser(authUser.id, authUser);
        setUser(freshUser);

        // Auto-create cleaner record for cleaner role
        if (role === 'cleaner') {
          const { data: existing } = await supabase.from('cleaners').select('id').eq('user_id', authUser.id).maybeSingle();
          if (!existing) {
            await supabase.from('cleaners').insert({
              user_id: authUser.id, name, available: true, verified: false,
              rating: 0, review_count: 0, experience: 0, specialisations: [],
            });
          }
        }

        return true;
      }
      return false;
    } catch (err) {
      console.error('verifyOtp unexpected error:', err);
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    setSession(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user, session, isAuthenticated: !!user, isLoading,
      login, verifyOtp, logout, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
