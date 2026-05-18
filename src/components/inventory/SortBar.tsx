import type { SortKey } from '../../types/vehicle.ts';
import { useSettings } from '../../contexts/SettingsContext.tsx';

interface SortBarProps {
  count: number;
  total: number;
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
}

type TKey = Parameters<ReturnType<typeof import('../../utils/i18n.ts').getT>>[0];

const SORT_KEY_LABELS: Record<SortKey, TKey> = {
  bid_desc:       'sort.bid_desc',
  bid_asc:        'sort.bid_asc',
  year_desc:      'sort.newest',
  odometer_asc:   'sort.mileage',
  condition_desc: 'sort.condition',
};

const SORT_KEYS: SortKey[] = ['bid_desc', 'bid_asc', 'year_desc', 'odometer_asc', 'condition_desc'];

export function SortBar({ count, total, sortKey, onSortChange, viewMode, onViewChange }: SortBarProps) {
  const { t } = useSettings();
  const btnCls = (active: boolean) =>
    `w-7 h-7 flex items-center justify-center rounded-md border transition-colors ${
      active
        ? 'bg-blue-600 border-blue-600 text-white'
        : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-slate-300 bg-white dark:bg-slate-800'
    }`;

  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <p className="text-xs text-slate-400 dark:text-slate-500">
        {count === total ? (
          <><span className="font-semibold text-slate-600 dark:text-slate-300">{total}</span> {t('sort.vehicles')}</>
        ) : (
          <><span className="font-semibold text-slate-600 dark:text-slate-300">{count}</span> {t('sort.of')} {total}</>
        )}
      </p>

      <div className="flex items-center gap-2">
        {/* View toggle */}
        <div className="flex items-center gap-1">
          <button onClick={() => onViewChange('grid')} className={btnCls(viewMode === 'grid')} aria-label="Grid view">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
              <rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>
          </button>
          <button onClick={() => onViewChange('list')} className={btnCls(viewMode === 'list')} aria-label="List view">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 16 16">
              <line x1="1" y1="4" x2="15" y2="4" /><line x1="1" y1="8" x2="15" y2="8" /><line x1="1" y1="12" x2="15" y2="12" />
            </svg>
          </button>
        </div>

        <span className="w-px h-4 bg-slate-200 dark:bg-slate-700" />

        <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">{t('sort.label')}</span>
        <div className="relative">
          <select
            value={sortKey}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="appearance-none text-xs border border-slate-200 dark:border-slate-700 rounded-lg pl-2.5 pr-7 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
          >
            {SORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(SORT_KEY_LABELS[key])}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 dark:text-slate-500"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
