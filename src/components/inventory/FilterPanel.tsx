import { useMemo, useState } from 'react';
import type { FilterState, BodyStyle, FuelType, TitleStatus, AuctionStatusFilter } from '../../types/vehicle.ts';
import { ALL_BrandS, ALL_PROVINCES, ALL_BODY_STYLES, ALL_FUEL_TYPES, vehicles } from '../../data/vehicles.ts';
import { bodyStyleLabel, titleStatusLabel, fuelTypeLabel } from '../../utils/format.ts';
import { computeFilterCounts, filterVehicles } from '../../utils/filter.ts';
import { useSettings } from '../../contexts/SettingsContext.tsx';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const BrandS_PREVIEW = 6;
const TITLE_STATUSES: TitleStatus[] = ['clean', 'rebuilt', 'salvage'];
const AUCTION_STATUSES: AuctionStatusFilter[] = ['live', 'ending-soon', 'upcoming', 'ended'];

type StatusConfig = {
  tKey: 'status.live' | 'status.ending_soon' | 'status.upcoming' | 'status.ended';
  pulse: boolean;
  dot: string;
  active: string;
  inactive: string;
};

const AUCTION_STATUS_CONFIG: Record<AuctionStatusFilter, StatusConfig> = {
  live: {
    tKey: 'status.live',
    pulse: true,
    dot: 'bg-red-500',
    active: 'bg-red-500 text-white border-red-500',
    inactive: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30',
  },
  'ending-soon': {
    tKey: 'status.ending_soon',
    pulse: false,
    dot: 'bg-orange-500',
    active: 'bg-orange-500 text-white border-orange-500',
    inactive: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30',
  },
  upcoming: {
    tKey: 'status.upcoming',
    pulse: false,
    dot: 'bg-blue-500',
    active: 'bg-blue-500 text-white border-blue-500',
    inactive: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30',
  },
  ended: {
    tKey: 'status.ended',
    pulse: false,
    dot: 'bg-slate-400',
    active: 'bg-slate-500 text-white border-slate-500',
    inactive: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600',
  },
};

const FUEL_ICON: Record<FuelType, string> = {
  gasoline: '⛽',
  hybrid: '🔋',
  electric: '⚡',
  diesel: '🛢',
};

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">
      {title}
    </h3>
  );
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 py-0.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 flex-shrink-0 dark:bg-slate-700"
      />
      <span className={`flex-1 text-sm leading-snug ${checked ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'} transition-colors`}>
        {label}
      </span>
      <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">{count}</span>
    </label>
  );
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const { t } = useSettings();
  const [showAllBrands, setShowAllBrands] = useState(false);

  const counts = useMemo(() => ({
    auctionStatuses: computeFilterCounts(filterVehicles(vehicles, { ...filters, auctionStatuses: [] })).auctionStatuses,
    Brands:          computeFilterCounts(filterVehicles(vehicles, { ...filters, Brands: [] })).Brands,
    bodyStyles:      computeFilterCounts(filterVehicles(vehicles, { ...filters, bodyStyles: [] })).bodyStyles,
    fuelTypes:       computeFilterCounts(filterVehicles(vehicles, { ...filters, fuelTypes: [] })).fuelTypes,
    titleStatuses:   computeFilterCounts(filterVehicles(vehicles, { ...filters, titleStatuses: [] })).titleStatuses,
    provinces:       computeFilterCounts(filterVehicles(vehicles, { ...filters, provinces: [] })).provinces,
  }), [filters]);

  const visibleBrands = showAllBrands ? ALL_BrandS : ALL_BrandS.slice(0, BrandS_PREVIEW);
  const hiddenCount = ALL_BrandS.length - BrandS_PREVIEW;

  function toggleAuctionStatus(status: AuctionStatusFilter) {
    const curr = filters.auctionStatuses;
    onChange({ ...filters, auctionStatuses: curr.includes(status) ? curr.filter((s) => s !== status) : [...curr, status] });
  }

  function toggleBrand(Brand: string) {
    const curr = filters.Brands;
    onChange({ ...filters, Brands: curr.includes(Brand) ? curr.filter((m) => m !== Brand) : [...curr, Brand] });
  }

  function toggleBodyStyle(style: BodyStyle) {
    const curr = filters.bodyStyles;
    onChange({ ...filters, bodyStyles: curr.includes(style) ? curr.filter((s) => s !== style) : [...curr, style] });
  }

  function toggleFuelType(fuel: FuelType) {
    const curr = filters.fuelTypes;
    onChange({ ...filters, fuelTypes: curr.includes(fuel) ? curr.filter((f) => f !== fuel) : [...curr, fuel] });
  }

  function toggleTitle(status: TitleStatus) {
    const curr = filters.titleStatuses;
    onChange({ ...filters, titleStatuses: curr.includes(status) ? curr.filter((s) => s !== status) : [...curr, status] });
  }

  function toggleProvince(province: string) {
    const curr = filters.provinces;
    onChange({ ...filters, provinces: curr.includes(province) ? curr.filter((p) => p !== province) : [...curr, province] });
  }

  function setPriceMin(raw: string) {
    const val = raw === '' ? null : Number(raw);
    onChange({ ...filters, priceMin: val });
  }

  function setPriceMax(raw: string) {
    const val = raw === '' ? null : Number(raw);
    onChange({ ...filters, priceMax: val });
  }

  return (
    <div className="space-y-5">

      {/* Auction Status */}
      <div>
        <SectionHeader title={t('filter.auction_status')} />
        <div className="space-y-1.5">
          {AUCTION_STATUSES.map((status) => {
            const cfg = AUCTION_STATUS_CONFIG[status];
            const active = filters.auctionStatuses.includes(status);
            return (
              <button
                key={status}
                onClick={() => toggleAuctionStatus(status)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${active ? cfg.active : cfg.inactive}`}
              >
                {active ? (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
                )}
                <span className="flex-1 text-left">{t(cfg.tKey)}</span>
                <span className={`text-xs tabular-nums ${active ? 'opacity-75' : 'opacity-60'}`}>
                  {counts.auctionStatuses[status] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-700" />

      {/* Price Range */}
      <div>
        <SectionHeader title="Price Range" />
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm select-none">$</span>
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={filters.priceMin ?? ''}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <span className="text-slate-300 dark:text-slate-600 text-sm flex-shrink-0">—</span>
          <div className="flex-1 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm select-none">$</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={filters.priceMax ?? ''}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        {(filters.priceMin !== null || filters.priceMax !== null) && (
          <button
            onClick={() => onChange({ ...filters, priceMin: null, priceMax: null })}
            className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            Clear range
          </button>
        )}
      </div>

      <div className="border-t border-slate-100 dark:border-slate-700" />

      {/* Brand */}
      <div>
        <SectionHeader title={t('filter.brand')} />
        <div className="space-y-0.5">
          {visibleBrands.map((Brand) => (
            <CheckRow
              key={Brand}
              label={Brand}
              count={counts.Brands[Brand] ?? 0}
              checked={filters.Brands.includes(Brand)}
              onChange={() => toggleBrand(Brand)}
            />
          ))}
        </div>
        {ALL_BrandS.length > BrandS_PREVIEW && (
          <button
            onClick={() => setShowAllBrands((v) => !v)}
            className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${showAllBrands ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showAllBrands ? t('filter.show_less') : t('filter.more_brands', { n: hiddenCount })}
          </button>
        )}
      </div>

      <div className="border-t border-slate-100 dark:border-slate-700" />

      {/* Body Style */}
      <div>
        <SectionHeader title={t('filter.type')} />
        <div className="space-y-0.5">
          {ALL_BODY_STYLES.map((style) => (
            <CheckRow
              key={style}
              label={bodyStyleLabel(style)}
              count={counts.bodyStyles[style] ?? 0}
              checked={filters.bodyStyles.includes(style)}
              onChange={() => toggleBodyStyle(style)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-700" />

      {/* Fuel Type */}
      <div>
        <SectionHeader title="Fuel Type" />
        <div className="space-y-0.5">
          {ALL_FUEL_TYPES.map((fuel) => (
            <CheckRow
              key={fuel}
              label={`${FUEL_ICON[fuel]} ${fuelTypeLabel(fuel)}`}
              count={counts.fuelTypes[fuel] ?? 0}
              checked={filters.fuelTypes.includes(fuel)}
              onChange={() => toggleFuelType(fuel)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-700" />

      {/* Title Status */}
      <div>
        <SectionHeader title={t('filter.title_status')} />
        <div className="space-y-0.5">
          {TITLE_STATUSES.map((status) => (
            <CheckRow
              key={status}
              label={titleStatusLabel(status)}
              count={counts.titleStatuses[status] ?? 0}
              checked={filters.titleStatuses.includes(status)}
              onChange={() => toggleTitle(status)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-700" />

      {/* Province */}
      <div>
        <SectionHeader title={t('filter.province')} />
        <div className="space-y-0.5">
          {ALL_PROVINCES.map((province) => (
            <CheckRow
              key={province}
              label={province}
              count={counts.provinces[province] ?? 0}
              checked={filters.provinces.includes(province)}
              onChange={() => toggleProvince(province)}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
