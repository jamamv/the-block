import { useSyncExternalStore } from 'react';

let _now = Date.now();
const _listeners = new Set<() => void>();

setInterval(() => {
  _now = Date.now();
  _listeners.forEach((fn) => fn());
}, 30_000);

function subscribe(cb: () => void) {
  _listeners.add(cb);
  return () => { _listeners.delete(cb); };
}

const getSnapshot = () => _now;

export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
