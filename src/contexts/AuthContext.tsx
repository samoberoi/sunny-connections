import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  switchRole: () => {},
});

export const useAuth = () => useContext(AuthContext);

const mockUsers: Record<UserRole, User> = {
  customer: { id: 'u1', phone: '+447700900000', name: 'Alex Morgan', role: 'customer', createdAt: '2026-01-01' },
  cleaner: { id: 'c1', phone: '+447700900001', name: 'Emma Thompson', role: 'cleaner', createdAt: '2025-06-01' },
  admin: { id: 'a1', phone: '+447700900099', name: 'Admin User', role: 'admin', createdAt: '2024-01-01' },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (phone: string, role: UserRole) => {
    setUser({ ...mockUsers[role], phone });
  };

  const logout = () => setUser(null);

  const switchRole = (role: UserRole) => {
    if (user) setUser({ ...mockUsers[role] });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};
