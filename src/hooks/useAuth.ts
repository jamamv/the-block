import { useState, useCallback, useEffect } from 'react';
import { getToken, clearToken, apiMe, apiLogin, apiRegister, isGuestSession, setGuestSession, clearGuestSession, GUEST_USER } from '../lib/api.ts';
import type { AuthUser } from '../lib/api.ts';

export type { AuthUser };

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(!!getToken() || isGuestSession());

  useEffect(() => {
    if (isGuestSession()) {
      setUser(GUEST_USER);
      setLoading(false);
      return;
    }
    if (!getToken()) return;
    apiMe()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await apiLogin(email, password);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const u = await apiRegister(name, email, password);
    setUser(u);
    return u;
  }, []);

  const loginAsGuest = useCallback(() => {
    setGuestSession();
    setUser(GUEST_USER);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearGuestSession();
    setUser(null);
  }, []);

  return { user, loading, login, register, loginAsGuest, logout };
}
