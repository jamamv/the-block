import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { FilterState, SortKey, BidStateMap } from '../../types/vehicle.ts';
import { vehicles } from '../../data/vehicles.ts';
import { filterVehicles, isFilterActive, DEFAULT_FILTERS } from '../../utils/filter.ts';
import { sortVehicles } from '../../utils/sort.ts';
import { FilterPanel } from './FilterPanel.tsx';
import { SortBar } from './SortBar.tsx';
import { VehicleCard } from './VehicleCard.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { CompareDrawer } from '../ui/CompareDrawer.tsx';
import { useComparison } from '../../hooks/useComparison.ts';
import { SearchSuggestions } from './SearchSuggestions.tsx';
import { useSettings } from '../../contexts/SettingsContext.tsx';

interface InventoryPageProps {
  bidStateMap: BidStateMap;
  watchlist: Set<string>;
  toggleWatch: (id: string) => void;
}

export function InventoryPage({ bidStateMap, watchlist, toggleWatch }: InventoryPageProps) {
  const { t } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const watchlistOnly = searchParams.get('saved') === '1';
  const q = searchParams.get('q') ?? '';

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>('bid_desc');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchConfirmed, setSearchConfirmed] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { compareIds, toggleCompare, removeCompare, clearCompare, canAdd } = useComparison();

  function setQ(value: string) {
    const p = new URLSearchParams(searchParams);
    if (value) p.set('q', value);
    else p.delete('q');
    setSearchParams(p, { replace: true });
  }

  function handleSearchEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      setSearchConfirmed(true);
      setTimeout(() => setSearchConfirmed(false), 600);
    }
  }

  const filtered = useMemo(
    () => filterVehicles(vehicles, { ...filters, search: q }),
    [filters, q],
  );
  const sorted = useMemo(() => sortVehicles(filtered, sortKey, bidStateMap), [filtered, sortKey, bidStateMap]);
  const display = useMemo(
    () => watchlistOnly ? sorted.filter((v) => watchlist.has(v.id)) : sorted,
    [sorted, watchlistOnly, watchlist],
  );

  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS);
    setDrawerOpen(false);
    const p = new URLSearchParams(searchParams);
    p.delete('saved');
    p.delete('q');
    setSearchParams(p, { replace: true });
  }

  const filterActive = isFilterActive(filters) || q.length > 0;
  const activeCount =
    filters.auctionStatuses.length +
    filters.Brands.length +
    filters.bodyStyles.length +
    filters.titleStatuses.length +
    filters.provinces.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-6">
        {/* Sidebar — visible lg+ */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('filter.title')}</h2>
              {filterActive && (
                <button onClick={handleClearFilters} className="text-xs text-blue-600 hover:text-blue-700">
                  {t('filter.clear_all')}
                </button>
              )}
            </div>
            <FilterPanel filters={filters} onChange={setFilters} />

          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search + filter toggle */}
          <div className="mb-3 flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </span>
              <input
                type="search"
                value={q}
                onChange={(e) => { setQ(e.target.value); setSearchFocused(true); }}
                placeholder={t('search.placeholder')}
                onKeyDown={handleSearchEnter}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors duration-150 ${
                  searchConfirmed
                    ? 'border-emerald-400 ring-2 ring-emerald-400 focus:ring-emerald-400 focus:border-emerald-400'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {searchFocused && q.length > 0 && (
                <SearchSuggestions
                  query={q}
                  setFilters={setFilters}
                  onClose={() => setSearchFocused(false)}
                />
              )}
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" />
              </svg>
              {t('search.filter_btn')}
              {activeCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          <SortBar
            count={display.length}
            total={vehicles.length}
            sortKey={sortKey}
            onSortChange={setSortKey}
          />

          {display.length === 0 ? (
            <EmptyState onClear={handleClearFilters} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {display.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  bidState={bidStateMap[vehicle.id]}
                  isWatched={watchlist.has(vehicle.id)}
                  onToggleWatch={toggleWatch}
                  isInCompare={compareIds.includes(vehicle.id)}
                  canAddToCompare={canAdd(vehicle.id)}
                  onToggleCompare={toggleCompare}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile/tablet filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-800 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t('filter.title')}</h2>
                {activeCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                    {t('filter.active', { n: activeCount })}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {filterActive && (
                  <button onClick={handleClearFilters} className="text-xs text-blue-600 font-medium">
                    {t('filter.clear_all')}
                  </button>
                )}
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                  aria-label={t('filter.close_filters')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              <FilterPanel filters={filters} onChange={setFilters} />
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
              >
                {display.length === 1
                  ? t('filter.show_results', { n: display.length })
                  : t('filter.show_results_plural', { n: display.length })}
              </button>
            </div>
          </div>
        </div>
      )}

      <CompareDrawer compareIds={compareIds} onRemove={removeCompare} onClear={clearCompare} />
      {compareIds.length > 0 && <div className="h-20" />}
    </div>
  );
}
