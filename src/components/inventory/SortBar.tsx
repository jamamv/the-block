import type { SortKey } from '../../types/vehicle.ts';
import { SORT_OPTIONS } from '../../utils/sort.ts';

interface SortBarProps {
  count: number;
  total: number;
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
}

export function SortBar({ count, total, sortKey, onSortChange }: SortBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 mb-2">
      <p className="text-sm text-slate-500">
        {count === total ? (
          <><span className="font-semibold text-slate-900">{total}</span> vehicles</>
        ) : (
          <><span className="font-semibold text-slate-900">{count}</span> <span className="text-slate-400">of {total}</span> vehicles</>
        )}
      </p>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-medium hidden sm:block">Sort by</span>
        <div className="relative">
          <select
            value={sortKey}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="appearance-none text-sm border border-slate-200 rounded-lg pl-3 pr-8 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300 transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
