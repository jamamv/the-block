import { useState, useCallback } from 'react';

const STORAGE_KEY = 'the-block:followed-dealers';

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function save(dealers: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...dealers]));
}

export function useFollowedDealers() {
  const [followedDealers, setFollowed] = useState<Set<string>>(load);

  const toggleFollow = useCallback((name: string) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      save(next);
      return next;
    });
  }, []);

  return { followedDealers, toggleFollow };
}
