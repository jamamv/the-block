import { useState, useCallback, useEffect } from 'react';
import type { AuthUser } from '../lib/api.ts';
import { apiFetchWatchlist, apiWatchVehicle, apiUnwatchVehicle } from '../lib/api.ts';

const STORAGE_KEY = 'the-block:watchlist';

function isRealUser(user: AuthUser | null): boolean {
  return user !== null && user.id !== 'guest';
}

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function save(set: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function useWatchlist(user: AuthUser | null) {
  const [watchlist, setWatchlist] = useState<Set<string>>(load);

  // When a real user's session resolves, fetch their server watchlist and replace local state.
  // Guest users keep localStorage only.
  useEffect(() => {
    if (!isRealUser(user)) return;
    apiFetchWatchlist().then((ids) => {
      const serverSet = new Set(ids);
      setWatchlist(serverSet);
      save(serverSet);
    }).catch(() => {});
  }, [user?.id]);

  const toggleWatch = useCallback((id: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (isRealUser(user)) apiUnwatchVehicle(id).catch(() => {});
      } else {
        next.add(id);
        if (isRealUser(user)) apiWatchVehicle(id).catch(() => {});
      }
      save(next);
      return next;
    });
  }, [user]);

  return { watchlist, toggleWatch };
}
