import type { User } from '@supabase/supabase-js';

export type AuthProfileRecord = {
  avatar: string | null;
  created_at: string;
  email: string | null;
  name: string;
  phone: string;
  role: string | null;
};

export const phoneToEmail = (phone: string) => {
  const clean = phone.replace(/[^0-9]/g, '');
  return `${clean}@cleanfit.local`;
};

export const DEFAULT_PASSWORD = 'cleanfit-test-1111';

export const roleNames = {
  customer: 'Alex Morgan',
  cleaner: 'Emma Thompson',
  admin: 'Admin User',
} as const;

export const normalizeRole = (role?: string | null) => {
  if (role === 'customer' || role === 'cleaner' || role === 'admin') {
    return role;
  }

  return 'customer';
};

export const buildUserFromAuth = (authUser: User) => ({
  id: authUser.id,
  phone: typeof authUser.user_metadata?.phone === 'string' ? authUser.user_metadata.phone : '',
  name: typeof authUser.user_metadata?.name === 'string' ? authUser.user_metadata.name : 'Clean Fit User',
  email: authUser.email ?? undefined,
  role: normalizeRole(typeof authUser.user_metadata?.role === 'string' ? authUser.user_metadata.role : null),
  avatar: typeof authUser.user_metadata?.avatar === 'string' ? authUser.user_metadata.avatar : undefined,
  createdAt: authUser.created_at ?? new Date().toISOString(),
});

export const buildUserFromProfile = (authUser: User, profile: AuthProfileRecord) => ({
  id: authUser.id,
  phone: profile.phone,
  name: profile.name,
  email: profile.email || authUser.email || undefined,
  role: normalizeRole(profile.role),
  avatar: profile.avatar || undefined,
  createdAt: profile.created_at,
});