import { useState, useCallback, useEffect } from 'react';
import { getToken, clearToken, apiMe, apiLogin, apiRegister } from '../lib/api.ts';
import type { AuthUser } from '../lib/api.ts';

export type { AuthUser };

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(!!getToken());

  // On mount, verify the stored token and hydrate user state
  useEffect(() => {
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

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return { user, loading, login, register, logout };
}
