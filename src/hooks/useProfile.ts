import { useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  created_at: string;
}

export interface ProfileState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export function useProfile(): ProfileState {
  const [user, setUser]   = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nexus_token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('nexus_token'));
  const [error, setError]   = useState<string | null>(null);

  // Validate token on mount
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) setUser(data.user);
        else { localStorage.removeItem('nexus_token'); setToken(null); }
      })
      .catch(() => { localStorage.removeItem('nexus_token'); setToken(null); })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Login failed');
    localStorage.setItem('nexus_token', data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (username: string, password: string, displayName?: string) => {
    setError(null);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, display_name: displayName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Registration failed');
    localStorage.setItem('nexus_token', data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nexus_token');
    setToken(null);
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { user, token, loading, error, login, register, logout, clearError };
}
