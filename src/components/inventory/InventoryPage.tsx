import { useState, useMemo } from 'react';
import type { FilterState, SortKey, BidStateMap } from '../../types/vehicle.ts';
import { vehicles } from '../../data/vehicles.ts';
import { filterVehicles, isFilterActive, DEFAULT_FILTERS } from '../../utils/filter.ts';
import { sortVehicles } from '../../utils/sort.ts';
import { FilterPanel } from './FilterPanel.tsx';
import { SortBar } from './SortBar.tsx';
import { VehicleCard } from './VehicleCard.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';

interface InventoryPageProps {
  bidStateMap: BidStateMap;
}

export function InventoryPage({ bidStateMap }: InventoryPageProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>('bid_desc');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(
    () => filterVehicles(vehicles, filters),
    [filters],
  );

  const sorted = useMemo(
    () => sortVehicles(filtered, sortKey, bidStateMap),
    [filtered, sortKey, bidStateMap],
  );

  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS);
    setDrawerOpen(false);
  }

  const filterActive = isFilterActive(filters);
  const activeCount =
    filters.auctionStatuses.length +
    filters.Brands.length +
    filters.bodyStyles.length +
    filters.titleStatuses.length +
    filters.provinces.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-6">
        {/* Sidebar — visible lg+ (1024px+) so cards always have enough room */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">Filters</h2>
              {filterActive && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Clear all
                </button>
              )}
            </div>
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search + filter toggle — scoped to the grid column so it aligns with cards */}
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </span>
              <input
                type="search"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                placeholder="Search by Brand, model, VIN, lot…"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-300"
              />
            </div>
            {/* Filter toggle — hidden on lg+ where sidebar is always visible */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" />
              </svg>
              Filters
              {activeCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          <SortBar
            count={sorted.length}
            total={vehicles.length}
            sortKey={sortKey}
            onSortChange={setSortKey}
          />

          {sorted.length === 0 ? (
            <EmptyState onClear={handleClearFilters} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {sorted.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  bidState={bidStateMap[vehicle.id]}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile/tablet filter drawer — shown below lg */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">Filters</h2>
                {activeCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    {activeCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {filterActive && (
                  <button onClick={handleClearFilters} className="text-xs text-blue-600 font-medium">
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                  aria-label="Close filters"
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
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
              >
                Show {sorted.length} result{sorted.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
