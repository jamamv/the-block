import { useMemo, useState } from 'react';
import type { FilterState, BodyStyle, TitleStatus, AuctionStatusFilter } from '../../types/vehicle.ts';
import { ALL_MAKES, ALL_PROVINCES, ALL_BODY_STYLES, vehicles } from '../../data/vehicles.ts';
import { bodyStyleLabel, titleStatusLabel } from '../../utils/format.ts';
import { computeFilterCounts } from '../../utils/filter.ts';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const MAKES_PREVIEW = 6;
const TITLE_STATUSES: TitleStatus[] = ['clean', 'rebuilt', 'salvage'];
const AUCTION_STATUSES: AuctionStatusFilter[] = ['live', 'ending-soon', 'upcoming', 'ended'];

const AUCTION_STATUS_CONFIG: Record<AuctionStatusFilter, {
  label: string;
  pulse: boolean;
  dot: string;
  active: string;
  inactive: string;
}> = {
  live: {
    label: 'Live',
    pulse: true,
    dot: 'bg-red-500',
    active: 'bg-red-500 text-white border-red-500',
    inactive: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  },
  'ending-soon': {
    label: 'Ending Soon',
    pulse: false,
    dot: 'bg-orange-500',
    active: 'bg-orange-500 text-white border-orange-500',
    inactive: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
  },
  upcoming: {
    label: 'Upcoming',
    pulse: false,
    dot: 'bg-blue-500',
    active: 'bg-blue-500 text-white border-blue-500',
    inactive: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  ended: {
    label: 'Ended',
    pulse: false,
    dot: 'bg-slate-400',
    active: 'bg-slate-500 text-white border-slate-500',
    inactive: 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200',
  },
};

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
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
        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 flex-shrink-0"
      />
      <span className={`flex-1 text-sm leading-snug ${checked ? 'text-slate-900 font-medium' : 'text-slate-600 group-hover:text-slate-900'} transition-colors`}>
        {label}
      </span>
      <span className="text-xs text-slate-400 tabular-nums">{count}</span>
    </label>
  );
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [showAllMakes, setShowAllMakes] = useState(false);

  const counts = useMemo(() => computeFilterCounts(vehicles), []);

  const visibleMakes = showAllMakes ? ALL_MAKES : ALL_MAKES.slice(0, MAKES_PREVIEW);
  const hiddenCount = ALL_MAKES.length - MAKES_PREVIEW;

  function toggleAuctionStatus(status: AuctionStatusFilter) {
    const curr = filters.auctionStatuses;
    onChange({
      ...filters,
      auctionStatuses: curr.includes(status)
        ? curr.filter((s) => s !== status)
        : [...curr, status],
    });
  }

  function toggleMake(make: string) {
    const curr = filters.makes;
    onChange({ ...filters, makes: curr.includes(make) ? curr.filter((m) => m !== make) : [...curr, make] });
  }

  function toggleBodyStyle(style: BodyStyle) {
    const curr = filters.bodyStyles;
    onChange({ ...filters, bodyStyles: curr.includes(style) ? curr.filter((s) => s !== style) : [...curr, style] });
  }

  function toggleTitle(status: TitleStatus) {
    const curr = filters.titleStatuses;
    onChange({ ...filters, titleStatuses: curr.includes(status) ? curr.filter((s) => s !== status) : [...curr, status] });
  }

  function toggleProvince(province: string) {
    const curr = filters.provinces;
    onChange({ ...filters, provinces: curr.includes(province) ? curr.filter((p) => p !== province) : [...curr, province] });
  }

  return (
    <div className="space-y-5">

      {/* Auction Status */}
      <div>
        <SectionHeader title="Auction Status" />
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
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-current opacity-80' : cfg.dot} ${cfg.pulse && !active ? 'animate-pulse' : ''}`} />
                <span className="flex-1 text-left">{cfg.label}</span>
                <span className={`text-xs tabular-nums ${active ? 'opacity-75' : 'opacity-60'}`}>
                  {counts.auctionStatuses[status] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Make */}
      <div>
        <SectionHeader title="Make" />
        <div className="space-y-0.5">
          {visibleMakes.map((make) => (
            <CheckRow
              key={make}
              label={make}
              count={counts.makes[make] ?? 0}
              checked={filters.makes.includes(make)}
              onChange={() => toggleMake(make)}
            />
          ))}
        </div>
        {ALL_MAKES.length > MAKES_PREVIEW && (
          <button
            onClick={() => setShowAllMakes((v) => !v)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {showAllMakes ? 'Show less' : `+ ${hiddenCount} more`}
          </button>
        )}
      </div>

      <div className="border-t border-slate-100" />

      {/* Body Style */}
      <div>
        <SectionHeader title="Body Style" />
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

      <div className="border-t border-slate-100" />

      {/* Title Status */}
      <div>
        <SectionHeader title="Title Status" />
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

      <div className="border-t border-slate-100" />

      {/* Province */}
      <div>
        <SectionHeader title="Province" />
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
