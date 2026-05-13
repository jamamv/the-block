import { Link } from 'react-router-dom';
import type { BidStateMap } from '../../types/vehicle.ts';
import { getVehicleById } from '../../data/vehicles.ts';
import { formatCurrency } from '../../utils/format.ts';
import { useAuctionStatus } from '../../hooks/useAuctionStatus.ts';
import { getNormalizedAuctionStart, getAuctionStatus } from '../../utils/auction.ts';
import { useState } from 'react';

interface BidsPageProps {
  bidStateMap: BidStateMap;
  onRetractBid: (vehicleId: string) => void;
}

type Outcome = 'purchased' | 'won' | 'lost' | 'active';

function getOutcome(status: string, boughtNow: boolean, reserveMet: boolean): Outcome {
  if (boughtNow) return 'purchased';
  if (status === 'ended') return reserveMet ? 'won' : 'lost';
  return 'active';
}

const OUTCOME_BADGE: Record<Outcome, { label: string; className: string }> = {
  purchased: { label: 'Purchased',    className: 'bg-emerald-100 text-emerald-700' },
  won:       { label: '🏆 Won',       className: 'bg-emerald-100 text-emerald-700' },
  lost:      { label: 'Reserve not met', className: 'bg-slate-100 text-slate-500' },
  active:    { label: '',             className: '' },
};

const OUTCOME_BORDER: Record<Outcome, string> = {
  purchased: 'border-emerald-300 shadow-emerald-50',
  won:       'border-emerald-300 shadow-emerald-50',
  lost:      'border-slate-200',
  active:    'border-slate-200',
};

function BidRow({
  vehicleId,
  bidStateMap,
  onRetractBid,
}: {
  vehicleId: string;
  bidStateMap: BidStateMap;
  onRetractBid: (id: string) => void;
}) {
  const vehicle = getVehicleById(vehicleId);
  const bidState = bidStateMap[vehicleId];
  const { status, countdown } = useAuctionStatus(vehicle?.auction_start ?? '');
  const [retractConfirm, setRetractConfirm] = useState(false);

  if (!vehicle || !bidState) return null;

  const reserveMet = vehicle.reserve_price != null && bidState.current_bid >= vehicle.reserve_price;
  const boughtNow = bidState.bought_now === true;
  const outcome = getOutcome(status, boughtNow, reserveMet);
  const badge = OUTCOME_BADGE[outcome];

  const statusColor: Record<string, string> = {
    live: 'text-red-600', 'ending-soon': 'text-orange-600', upcoming: 'text-blue-600', ended: 'text-slate-400',
  };
  const statusDot: Record<string, string> = {
    live: 'bg-red-500', 'ending-soon': 'bg-orange-500', upcoming: 'bg-blue-400', ended: 'bg-slate-300',
  };

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden ${OUTCOME_BORDER[outcome]}`}>
      <div className="flex">
        <Link to={`/vehicle/${vehicle.id}`} className="flex-shrink-0">
          <img
            src={vehicle.images[0]}
            alt=""
            className={`w-36 sm:w-48 h-full object-cover min-h-[96px] ${outcome === 'lost' ? 'opacity-50 grayscale' : ''}`}
          />
        </Link>
        <div className="flex-1 p-4 min-w-0 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link
                to={`/vehicle/${vehicle.id}`}
                className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
              >
                {vehicle.year} {vehicle.Brand} {vehicle.model}
              </Link>
              <p className="text-xs text-slate-400 mt-0.5">{vehicle.trim} · Lot {vehicle.lot}</p>
            </div>
            {outcome === 'active' ? (
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot[status]} ${status === 'live' ? 'animate-pulse' : ''}`} />
                <span className={`text-xs font-medium ${statusColor[status]}`}>{countdown}</span>
              </div>
            ) : (
              <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${badge.className}`}>
                {badge.label}
              </span>
            )}
          </div>

          <div className="flex items-end justify-between gap-3 mt-auto">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">Your bid</p>
                <p className={`text-lg font-bold ${outcome === 'lost' ? 'text-slate-400' : 'text-slate-900'}`}>
                  {formatCurrency(bidState.current_bid)}
                </p>
              </div>
              {outcome !== 'purchased' && (
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">Reserve</p>
                  <p className={`text-sm font-semibold ${reserveMet ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {reserveMet ? 'Met ✓' : 'Not met'}
                  </p>
                </div>
              )}
            </div>

            {outcome !== 'purchased' && (
              retractConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-700 font-medium">{outcome !== 'active' ? 'Remove?' : 'Retract?'}</span>
                  <button
                    onClick={() => { onRetractBid(vehicleId); setRetractConfirm(false); }}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setRetractConfirm(false)}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setRetractConfirm(true)}
                  className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors border border-transparent hover:border-red-200"
                  title={outcome !== 'active' ? 'Remove from list' : 'Retract bid'}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {outcome !== 'active' ? 'Remove' : 'Retract'}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BidsPage({ bidStateMap, onRetractBid }: BidsPageProps) {
  const vehicleIds = Object.keys(bidStateMap);

  const summary = vehicleIds.reduce(
    (acc, id) => {
      const vehicle = getVehicleById(id);
      const bidState = bidStateMap[id];
      if (!vehicle || !bidState) return acc;
      const status = getAuctionStatus(getNormalizedAuctionStart(vehicle.auction_start));
      const reserveMet = vehicle.reserve_price != null && bidState.current_bid >= vehicle.reserve_price;
      const outcome = getOutcome(status, bidState.bought_now === true, reserveMet);
      acc[outcome] = (acc[outcome] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<Outcome, number>>,
  );

  const parts = [
    summary.active && `${summary.active} active`,
    summary.won && `${summary.won} won`,
    summary.purchased && `${summary.purchased} purchased`,
    summary.lost && `${summary.lost} not sold`,
  ].filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Bids</h1>
        <p className="text-sm text-slate-500 mt-1">
          {vehicleIds.length === 0 ? 'No bids placed yet.' : parts.join(' · ')}
        </p>
      </div>

      {vehicleIds.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">No bids yet</p>
          <p className="text-xs text-slate-400 mb-5">Browse the inventory and place your first bid.</p>
          <Link
            to="/"
            className="inline-flex px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Inventory
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicleIds.map((id) => (
            <BidRow
              key={id}
              vehicleId={id}
              bidStateMap={bidStateMap}
              onRetractBid={onRetractBid}
            />
          ))}
        </div>
      )}
    </div>
  );
}
