import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Vehicle } from '../../types/vehicle.ts';
import { getVehicleById } from '../../data/vehicles.ts';
import { formatCurrency, formatOdometer } from '../../utils/format.ts';
import { useAuctionStatus } from '../../hooks/useAuctionStatus.ts';

interface CompareDrawerProps {
  compareIds: string[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

function StarsMini({ grade }: { grade: number }) {
  const filled = Math.round(grade);
  const color = grade >= 4 ? 'text-emerald-500' : grade >= 3 ? 'text-amber-500' : 'text-red-400';
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`w-3 h-3 ${i < filled ? color : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className={`text-xs font-semibold ml-0.5 ${color}`}>{grade.toFixed(1)}</span>
    </span>
  );
}

function AuctionLabel({ auctionStart }: { auctionStart: string }) {
  const { status, countdown } = useAuctionStatus(auctionStart);
  const colors: Record<string, string> = {
    live: 'text-red-600', 'ending-soon': 'text-orange-600', upcoming: 'text-blue-600', ended: 'text-slate-400',
  };
  const labels: Record<string, string> = {
    live: 'Live', 'ending-soon': 'Ending Soon', upcoming: 'Upcoming', ended: 'Ended',
  };
  return <span className={`text-sm font-medium ${colors[status]}`}>{labels[status]}{status !== 'ended' ? ` · ${countdown}` : ''}</span>;
}

type SpecRow = { label: string; render: (v: Vehicle) => React.ReactNode; key: string };

const SPEC_ROWS: SpecRow[] = [
  { key: 'bid',   label: 'Current Bid',   render: v => <span className="font-bold text-slate-900 text-base">{v.current_bid != null ? formatCurrency(v.current_bid) : '—'}</span> },
  { key: 'res',   label: 'Reserve Price', render: v => formatCurrency(v.reserve_price) },
  { key: 'buy',   label: 'Buy Now',       render: v => v.buy_now_price != null ? <span className="text-blue-700 font-semibold">{formatCurrency(v.buy_now_price)}</span> : <span className="text-slate-300">—</span> },
  { key: 'sep1',  label: '',              render: () => null },
  { key: 'year',  label: 'Year',          render: v => v.year },
  { key: 'odo',   label: 'Odometer',      render: v => formatOdometer(v.odometer_km) },
  { key: 'cond',  label: 'Condition',     render: v => <StarsMini grade={v.condition_grade} /> },
  { key: 'fuel',  label: 'Fuel',          render: v => v.fuel_type.charAt(0).toUpperCase() + v.fuel_type.slice(1) },
  { key: 'eng',   label: 'Engine',        render: v => v.engine },
  { key: 'trans', label: 'Transmission',  render: v => v.transmission.charAt(0).toUpperCase() + v.transmission.slice(1) },
  { key: 'drive', label: 'Drivetrain',    render: v => v.drivetrain },
  { key: 'sep2',  label: '',              render: () => null },
  { key: 'title', label: 'Title',         render: v => v.title_status.charAt(0).toUpperCase() + v.title_status.slice(1) },
  { key: 'loc',   label: 'Location',      render: v => `${v.city}, ${v.province}` },
  { key: 'status',label: 'Auction',       render: v => <AuctionLabel auctionStart={v.auction_start} /> },
];

function isDiff(row: SpecRow, a: Vehicle, b: Vehicle): boolean {
  if (row.key.startsWith('sep')) return false;
  try {
    const ra = String(row.render(a));
    const rb = String(row.render(b));
    return ra !== rb;
  } catch { return false; }
}

export function CompareDrawer({ compareIds, onRemove, onClear }: CompareDrawerProps) {
  const [expanded, setExpanded] = useState(false);

  const vehicles = compareIds
    .map((id) => getVehicleById(id))
    .filter((v): v is Vehicle => v != null);

  if (compareIds.length === 0) return null;

  return (
    <>
      {/* Bottom bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:block">Compare</span>

          <div className="flex items-center gap-3 flex-1">
            {[0, 1].map((i) => {
              const v = vehicles[i];
              return (
                <div key={i} className="flex items-center gap-2">
                  {v ? (
                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200">
                      <img src={v.images[0]} className="w-10 h-7 object-cover rounded flex-shrink-0" alt="" />
                      <div className="min-w-0 hidden sm:block">
                        <p className="text-xs font-semibold text-slate-900 truncate max-w-[100px]">{v.year} {v.Brand} {v.model}</p>
                        <p className="text-xs text-slate-500">{v.current_bid != null ? formatCurrency(v.current_bid) : 'No bids'}</p>
                      </div>
                      <button
                        onClick={() => onRemove(v.id)}
                        className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                        aria-label="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-32 h-9 rounded-lg border-2 border-dashed border-slate-200">
                      <span className="text-xs text-slate-300">+ Select vehicle</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onClear} className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium">
              Clear
            </button>
            {compareIds.length === 2 && (
              <button
                onClick={() => setExpanded(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Compare Now →
              </button>
            )}
            {compareIds.length < 2 && (
              <span className="text-xs text-slate-400">Select {2 - compareIds.length} more</span>
            )}
          </div>
        </div>
      </div>

      {/* Full comparison overlay */}
      {expanded && vehicles.length === 2 && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => setExpanded(false)}>
          <div
            className="bg-white w-full max-h-[88vh] rounded-t-2xl overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-base font-bold text-slate-900">Side-by-Side Comparison</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => { onClear(); setExpanded(false); }} className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium">
                  Clear all
                </button>
                <button
                  onClick={() => setExpanded(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable spec table */}
            <div className="overflow-y-auto flex-1 px-6 pb-8">
              <div className="grid grid-cols-[140px_1fr_1fr] gap-x-4 min-w-0">

                {/* Vehicle headers */}
                <div /> {/* spacer */}
                {vehicles.map((v) => (
                  <div key={v.id} className="py-4">
                    <Link to={`/vehicle/${v.id}`} onClick={() => setExpanded(false)}>
                      <img
                        src={v.images[0]}
                        className="w-full aspect-[4/3] object-cover rounded-xl mb-3 hover:opacity-90 transition-opacity"
                        alt=""
                      />
                    </Link>
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                      {v.year} {v.Brand} {v.model}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{v.trim}</p>
                  </div>
                ))}

                {/* Spec rows */}
                {SPEC_ROWS.map((row) => {
                  if (row.key.startsWith('sep')) {
                    return (
                      <div key={row.key} className="col-span-3 border-t border-slate-100 my-1" />
                    );
                  }

                  const diff = vehicles.length === 2 && isDiff(row, vehicles[0], vehicles[1]);

                  return (
                    <>
                      <div key={`${row.key}-label`} className={`flex items-center py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide ${diff ? 'text-slate-500' : ''}`}>
                        {row.label}
                      </div>
                      {vehicles.map((v) => (
                        <div
                          key={`${row.key}-${v.id}`}
                          className={`flex items-center py-2.5 text-sm text-slate-700 ${diff ? 'font-semibold bg-amber-50 rounded px-2 -mx-2' : ''}`}
                        >
                          {row.render(v)}
                        </div>
                      ))}
                    </>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
