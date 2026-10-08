import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'customer' | 'salesperson';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  register: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('masal_auth_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
    return null;
  });

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('masal_auth_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('masal_auth_user');
  };

  const register = (newUser: User) => {
    // For now, register also logs them in
    setUser(newUser);
    localStorage.setItem('masal_auth_user', JSON.stringify(newUser));
    // Save to a mock users list just in case
    const existingUsers = JSON.parse(localStorage.getItem('masal_users') || '[]');
    localStorage.setItem('masal_users', JSON.stringify([...existingUsers, newUser]));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
