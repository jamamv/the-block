import { useState, useCallback } from 'react';

const MAX = 2;

export function useComparison() {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX) return prev;
      return [...prev, id];
    });
  }, []);

  const removeCompare = useCallback((id: string) => {
    setCompareIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);

  const canAdd = (id: string) => !compareIds.includes(id) && compareIds.length < MAX;

  return { compareIds, toggleCompare, removeCompare, clearCompare, canAdd };
}
