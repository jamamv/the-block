import { useMemo } from 'react';
import type { FilterState, BodyStyle } from '../../types/vehicle.ts';
import { vehicles, ALL_BrandS, ALL_BODY_STYLES } from '../../data/vehicles.ts';
import { getNormalizedAuctionStart, getAuctionStatus } from '../../utils/auction.ts';

interface SearchSuggestionsProps {
  query: string;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onClose: () => void;
}

interface Suggestion {
  id: string;
  icon: 'brand' | 'body' | 'status' | 'fuel';
  label: string;
  sublabel: string;
  patch: Partial<FilterState>;
}

const BODY_LABELS: Record<BodyStyle, string> = {
  suv: 'SUV', sedan: 'Sedan', truck: 'Truck', coupe: 'Coupe', hatchback: 'Hatchback',
};

export function SearchSuggestions({ query, setFilters, onClose }: SearchSuggestionsProps) {
  const suggestions = useMemo<Suggestion[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return [];

    const now = Date.now();
    const result: Suggestion[] = [];

    const liveCount = vehicles.filter((v) =>
      getAuctionStatus(getNormalizedAuctionStart(v.auction_start), now) === 'live'
    ).length;
    const endingCount = vehicles.filter((v) =>
      getAuctionStatus(getNormalizedAuctionStart(v.auction_start), now) === 'ending-soon'
    ).length;

    if (liveCount > 0 && 'live auction'.includes(q)) {
      result.push({ id: 'status-live', icon: 'status', label: 'Live Auctions', sublabel: `${liveCount} vehicles`, patch: { auctionStatuses: ['live'] } });
    }
    if (endingCount > 0 && 'ending soon'.includes(q)) {
      result.push({ id: 'status-ending', icon: 'status', label: 'Ending Soon', sublabel: `${endingCount} vehicles`, patch: { auctionStatuses: ['ending-soon'] } });
    }

    if (q.length >= 2 && 'electric'.includes(q)) {
      const count = vehicles.filter((v) => v.fuel_type === 'electric').length;
      if (count > 0) result.push({ id: 'fuel-electric', icon: 'fuel', label: 'Electric Vehicles', sublabel: `${count} vehicles`, patch: {} });
    }
    if (q.length >= 3 && 'hybrid'.includes(q)) {
      const count = vehicles.filter((v) => v.fuel_type === 'hybrid').length;
      if (count > 0) result.push({ id: 'fuel-hybrid', icon: 'fuel', label: 'Hybrid Vehicles', sublabel: `${count} vehicles`, patch: {} });
    }

    const brandMatches = ALL_BrandS.filter((b) => b.toLowerCase().includes(q));
    for (const brand of brandMatches.slice(0, 3)) {
      const count = vehicles.filter((v) => v.Brand === brand).length;
      result.push({ id: `brand-${brand}`, icon: 'brand', label: brand, sublabel: `${count} vehicles`, patch: { Brands: [brand] } });
    }

    for (const bs of ALL_BODY_STYLES) {
      const label = BODY_LABELS[bs];
      if (bs.includes(q) || label.toLowerCase().includes(q)) {
        const count = vehicles.filter((v) => v.body_style === bs).length;
        result.push({ id: `body-${bs}`, icon: 'body', label, sublabel: `${count} vehicles`, patch: { bodyStyles: [bs] } });
      }
    }

    return result.slice(0, 6);
  }, [query]);

  if (suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-30 overflow-hidden">
      {suggestions.map((s) => (
        <button
          key={s.id}
          onMouseDown={(e) => {
            e.preventDefault();
            setFilters((f) => ({ ...f, ...s.patch }));
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
        >
          <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400">
            {s.icon === 'brand' && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )}
            {s.icon === 'body' && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1m0-11h8l4 5 1 3h-1m-8-8v8" />
              </svg>
            )}
            {s.icon === 'status' && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {s.icon === 'fuel' && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{s.label}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{s.sublabel}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
