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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
    setMobileFiltersOpen(false);
  }

  const filterActive = isFilterActive(filters);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Search by make, model, VIN, lot…"
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setMobileFiltersOpen((v) => !v)}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 font-medium"
        >
          <span>Filters</span>
          {filterActive && (
            <span className="w-2 h-2 rounded-full bg-blue-600" />
          )}
        </button>
      </div>

      <div className="flex gap-6">
        <aside
          className={`lg:block ${mobileFiltersOpen ? 'block' : 'hidden'} w-52 flex-shrink-0`}
        >
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-4 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
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

        <div className="flex-1 min-w-0">
          <SortBar
            count={sorted.length}
            total={vehicles.length}
            sortKey={sortKey}
            onSortChange={setSortKey}
          />

          {sorted.length === 0 ? (
            <EmptyState onClear={handleClearFilters} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-1">
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
    </div>
  );
}
