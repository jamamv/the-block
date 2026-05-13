const TOKEN_KEY = 'the-block:token';
const GUEST_KEY = 'the-block:guest';

export const GUEST_USER: AuthUser = { id: 'guest', name: 'Guest', email: 'guest@theblock.ca' };

export function isGuestSession(): boolean {
  return localStorage.getItem(GUEST_KEY) === '1';
}

export function setGuestSession(): void {
  localStorage.setItem(GUEST_KEY, '1');
}

export function clearGuestSession(): void {
  localStorage.removeItem(GUEST_KEY);
}

function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const data = await res.json() as T & { error?: string };
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Request failed');
  return data;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

export async function apiRegister(name: string, email: string, password: string): Promise<AuthUser> {
  try {
    const data = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setToken(data.token);
    return data.user;
  } catch (err) {
    if (isNetworkError(err)) {
      const u = { id: 'guest', name, email };
      setGuestSession();
      return u;
    }
    throw err;
  }
}

export async function apiLogin(email: string, password: string): Promise<AuthUser> {
  try {
    const data = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data.user;
  } catch (err) {
    if (isNetworkError(err)) {
      const u = { id: 'guest', name: email.split('@')[0], email };
      setGuestSession();
      return u;
    }
    throw err;
  }
}

export async function apiMe(): Promise<AuthUser> {
  const data = await request<{ user: AuthUser }>('/auth/me');
  return data.user;
}
