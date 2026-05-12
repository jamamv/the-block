import { Link } from 'react-router-dom';
import type { Vehicle, BidState } from '../../types/vehicle.ts';
import { formatCurrency, formatOdometer, formatLot } from '../../utils/format.ts';
import { TitleBadge, FuelBadge } from '../ui/Badge.tsx';
import { AuctionStatusBadge } from '../ui/AuctionStatus.tsx';

interface VehicleCardProps {
  vehicle: Vehicle;
  bidState?: BidState;
}

function StarRating({ grade }: { grade: number }) {
  const filled = Math.round(grade);
  const color = grade >= 4 ? 'text-emerald-500' : grade >= 3 ? 'text-amber-500' : 'text-red-400';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < filled ? color : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className={`text-xs font-semibold ml-1 ${color}`}>{grade.toFixed(1)}</span>
    </div>
  );
}

export function VehicleCard({ vehicle, bidState }: VehicleCardProps) {
  const currentBid = bidState?.current_bid ?? vehicle.current_bid;
  const bidCount = bidState?.bid_count ?? vehicle.bid_count;
  const reserveMet = currentBid >= vehicle.reserve_price;

  return (
    <Link
      to={`/vehicle/${vehicle.id}`}
      className="group flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all duration-150"
    >
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={vehicle.images[0]}
          alt={`${vehicle.year} ${vehicle.Brand} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />

        {/* Top gradient for badge legibility */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
        {/* Bottom gradient for status badge legibility */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* Title + fuel badges — top left */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          <TitleBadge status={vehicle.title_status} />
          <FuelBadge fuel={vehicle.fuel_type} />
        </div>

        {/* Lot number — top right, better legibility */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-md tracking-wide">
          {formatLot(vehicle.lot)}
        </div>

        {/* Auction status — bottom left, larger */}
        <div className="absolute bottom-2.5 left-2.5">
          <AuctionStatusBadge auctionStart={vehicle.auction_start} showCountdown={false} />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors">
            {vehicle.Brand} {vehicle.model} <span className="text-slate-400">({vehicle.year})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{vehicle.trim} · {formatOdometer(vehicle.odometer_km)}</p>
        </div>

        {/* Stars replace the progress bar */}
        <StarRating grade={vehicle.condition_grade} />

        <div className="flex items-end justify-between mt-auto pt-2 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500">
              {bidCount} {bidCount === 1 ? 'bid' : 'bids'}
              {reserveMet && (
                <span className="ml-1 text-emerald-600 font-medium">· Reserve Met</span>
              )}
            </p>
            {/* Larger, higher-contrast price */}
            <p className="text-xl font-bold text-slate-900 leading-tight">{formatCurrency(currentBid)}</p>
          </div>
          {vehicle.buy_now_price !== null && (
            <div className="text-right">
              <p className="text-xs text-slate-400">Buy Now</p>
              <p className="text-sm font-semibold text-blue-700">{formatCurrency(vehicle.buy_now_price)}</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
