'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, storeUser, clearAuth } from '@/lib/auth';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  });
  const loading = false;

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    storeUser(data);
    setUser(data);
    setToken(data.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    storeUser(data);
    setUser(data);
    setToken(data.token);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser: User) => {
    storeUser(updatedUser);
    setUser(updatedUser);
    if (updatedUser.token) setToken(updatedUser.token);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
