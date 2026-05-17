'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useRouter } from '@/i18n/routing';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    
    // Auto-refresh token on mount using the httpOnly cookie
    const refreshSession = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        const res = await api.post<{ accessToken: string }>('/auth/refresh', {});
        if (mounted && res.accessToken) {
          setToken(res.accessToken);
        }
      } catch (err: any) {
        // Only clear the session if the backend explicitly rejected the credentials (401 or 403)
        // If it's a 5xx server error, 502/504 Gateway Timeout, or network failure, we preserve
        // the local session to avoid logging the user out due to server instabilities.
        const isAuthError = err && (err.status === 401 || err.status === 403);
        
        if (mounted && isAuthError) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('user');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    refreshSession();

    // Listen for custom token refresh events from the API client
    const handleTokenRefreshed = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (mounted && customEvent.detail) {
        setToken(customEvent.detail);
      }
    };
    window.addEventListener('token-refreshed', handleTokenRefreshed);

    return () => { 
      mounted = false; 
      window.removeEventListener('token-refreshed', handleTokenRefreshed);
    };
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('user');
    // Call server to clear cookie (optional but good practice)
    // api.post('/auth/logout', {})
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
