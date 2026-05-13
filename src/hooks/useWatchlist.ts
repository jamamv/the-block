import { useState, useCallback } from 'react';

const STORAGE_KEY = 'the-block:watchlist';

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

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<Set<string>>(load);

  const toggleWatch = useCallback((id: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      save(next);
      return next;
    });
  }, []);

  return { watchlist, toggleWatch };
}
