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
    <div className="flex items-center justify-between gap-4 py-3">
      <p className="text-sm text-slate-600">
        {count === total ? (
          <><span className="font-semibold text-slate-900">{total}</span> vehicles</>
        ) : (
          <><span className="font-semibold text-slate-900">{count}</span> of {total} vehicles</>
        )}
      </p>
      <select
        value={sortKey}
        onChange={(e) => onSortChange(e.target.value as SortKey)}
        className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
