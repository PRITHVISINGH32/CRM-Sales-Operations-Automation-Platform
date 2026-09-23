'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchApi } from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ORGANISER' | 'ADMIN';
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  loginAsRole: (role: 'CUSTOMER' | 'ORGANISER' | 'ADMIN') => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    setToken(storedToken);
    const res = await fetchApi<{ user: UserProfile }>('/auth/me');
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetchApi<{ token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', res.data.token);
      }
      setToken(res.data.token);
      setUser(res.data.user);
    } else {
      throw new Error(res.error?.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, role: string = 'CUSTOMER') => {
    const res = await fetchApi<{ token: string; user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });

    if (res.success && res.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', res.data.token);
      }
      setToken(res.data.token);
      setUser(res.data.user);
    } else {
      throw new Error(res.error?.message || 'Registration failed');
    }
  };

  const loginAsRole = async (targetRole: 'CUSTOMER' | 'ORGANISER' | 'ADMIN') => {
    let email = 'customer@example.com';
    if (targetRole === 'ORGANISER') email = 'organiser@example.com';
    if (targetRole === 'ADMIN') email = 'admin@example.com';

    await login(email, 'password123');
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginAsRole, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      loading: false,
      login: async () => {},
      register: async () => {},
      loginAsRole: async () => {},
      logout: () => {},
      refreshUser: async () => {},
    };
  }
  return context;
};
