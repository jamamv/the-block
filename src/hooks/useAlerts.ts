import { useState, useCallback } from 'react';

const STORAGE_KEY = 'the-block:alerts';

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

export function useAlerts() {
  const [alerts, setAlerts] = useState<Set<string>>(load);

  const toggleAlert = useCallback((id: string) => {
    setAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      save(next);
      return next;
    });
  }, []);

  return { alerts, toggleAlert };
}
