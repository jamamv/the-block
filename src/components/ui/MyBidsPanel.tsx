import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { BidStateMap } from '../../types/vehicle.ts';
import { getVehicleById } from '../../data/vehicles.ts';
import { formatCurrency } from '../../utils/format.ts';
import { useAuctionStatus } from '../../hooks/useAuctionStatus.ts';

interface MyBidsPanelProps {
  bidStateMap: BidStateMap;
  onClose: () => void;
  onRetractBid: (vehicleId: string) => void;
}

function BidRow({
  vehicleId,
  bidStateMap,
  onClose,
  onRetractBid,
}: {
  vehicleId: string;
  bidStateMap: BidStateMap;
  onClose: () => void;
  onRetractBid: (id: string) => void;
}) {
  const vehicle = getVehicleById(vehicleId);
  const bidState = bidStateMap[vehicleId];
  const { status, countdown } = useAuctionStatus(vehicle?.auction_start ?? '');

  if (!vehicle || !bidState) return null;

  const reserveMet = vehicle.reserve_price != null && bidState.current_bid >= vehicle.reserve_price;

  const statusColor = {
    live: 'text-red-600',
    'ending-soon': 'text-orange-600',
    upcoming: 'text-blue-600',
    ended: 'text-slate-400',
  }[status];

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group">
      <Link
        to={`/vehicle/${vehicle.id}`}
        onClick={onClose}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <img
          src={vehicle.images[0]}
          alt=""
          className="w-12 h-9 object-cover rounded flex-shrink-0 bg-slate-100"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">
            {vehicle.year} {vehicle.Brand} {vehicle.model}
          </p>
          <p className={`text-xs ${statusColor}`}>{countdown}</p>
        </div>
        <div className="text-right flex-shrink-0 mr-2">
          <p className="text-sm font-bold text-slate-900">{formatCurrency(bidState.current_bid)}</p>
          <p className={`text-xs font-medium ${reserveMet ? 'text-emerald-600' : 'text-slate-400'}`}>
            {reserveMet ? 'Reserve met' : 'Not met'}
          </p>
        </div>
      </Link>
      <button
        onClick={() => onRetractBid(vehicleId)}
        className="flex-shrink-0 p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
        title="Retract bid"
        aria-label="Retract bid"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function MyBidsPanel({ bidStateMap, onClose, onRetractBid }: MyBidsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const vehicleIds = Object.keys(bidStateMap);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-30 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800">My Bids</span>
        <span className="text-xs text-slate-500">{vehicleIds.length} vehicle{vehicleIds.length !== 1 ? 's' : ''}</span>
      </div>

      {vehicleIds.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-500 text-center">No bids placed yet.</p>
      ) : (
        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {vehicleIds.map((id) => (
            <BidRow
              key={id}
              vehicleId={id}
              bidStateMap={bidStateMap}
              onClose={onClose}
              onRetractBid={onRetractBid}
            />
          ))}
        </div>
      )}
    </div>
  );
}
