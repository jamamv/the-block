import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
import { formatCurrency } from '../utils/format.ts';
import { getT, type Locale } from '../utils/i18n.ts';

type Currency = 'CAD' | 'USD';

interface StoredSettings {
  darkMode: boolean;
  currency: Currency;
  locale: Locale;
}

interface SettingsCtx extends StoredSettings {
  toggleDark: () => void;
  setCurrency: (c: Currency) => void;
  setLocale: (l: Locale) => void;
  fmt: (amount: number) => string;
  t: ReturnType<typeof getT>;
}

const Ctx = createContext<SettingsCtx | null>(null);
const STORAGE_KEY = 'the-block:settings';

function load(): StoredSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredSettings;
  } catch {}
  return { darkMode: false, currency: 'CAD', locale: 'en' };
}

function save(s: StoredSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoredSettings>(load);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [settings.darkMode]);

  function update(patch: Partial<StoredSettings>) {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  }

  const toggleDark = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, darkMode: !prev.darkMode };
      save(next);
      return next;
    });
  }, []);

  const setCurrency = useCallback((currency: Currency) => update({ currency }), []);
  const setLocale = useCallback((locale: Locale) => update({ locale }), []);

  const fmt = useCallback(
    (amount: number) => formatCurrency(amount, settings.currency),
    [settings.currency],
  );
  const t = useMemo(() => getT(settings.locale), [settings.locale]);

  return (
    <Ctx.Provider value={{ ...settings, toggleDark, setCurrency, setLocale, fmt, t }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
