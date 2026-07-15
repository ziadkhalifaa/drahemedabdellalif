'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from '@/i18n/routing';
import { api } from '@/lib/api';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);

    const handleTokenRefreshed = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setToken(customEvent.detail);
        localStorage.setItem('admin_token', customEvent.detail);
      }
    };
    window.addEventListener('token-refreshed', handleTokenRefreshed);

    return () => {
      window.removeEventListener('token-refreshed', handleTokenRefreshed);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ accessToken: string; user: AdminUser }>('/auth/login', { email, password });
    localStorage.setItem('admin_token', res.accessToken);
    localStorage.setItem('admin_user', JSON.stringify(res.user));
    setToken(res.accessToken);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Proceed with local cleanup
    }
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
    router.push('/admin/login');
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
