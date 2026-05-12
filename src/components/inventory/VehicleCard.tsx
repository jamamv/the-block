import { Link } from 'react-router-dom';
import type { Vehicle, BidState } from '../../types/vehicle.ts';
import { formatCurrency, formatOdometer, formatLot, conditionColor } from '../../utils/format.ts';
import { TitleBadge, FuelBadge } from '../ui/Badge.tsx';
import { AuctionStatusBadge } from '../ui/AuctionStatus.tsx';

interface VehicleCardProps {
  vehicle: Vehicle;
  bidState?: BidState;
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
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          <TitleBadge status={vehicle.title_status} />
          <FuelBadge fuel={vehicle.fuel_type} />
        </div>
        <div className="absolute bottom-2 left-2">
          <AuctionStatusBadge auctionStart={vehicle.auction_start} showCountdown={false} />
        </div>
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
          {formatLot(vehicle.lot)}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors">
            {vehicle.Brand} {vehicle.model} <span className="text-slate-400">({vehicle.year})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{vehicle.trim} · {formatOdometer(vehicle.odometer_km)}</p>
        </div>

        <div>
          <div className="flex items-center gap-1 mb-1">
            <span className={`text-xs font-medium ${conditionColor(vehicle.condition_grade)}`}>
              {vehicle.condition_grade.toFixed(1)} / 5
            </span>
            <span className="text-xs text-slate-400">condition</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${(vehicle.condition_grade / 5) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-end justify-between mt-auto pt-2 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500">
              {bidCount} {bidCount === 1 ? 'bid' : 'bids'}
              {reserveMet && (
                <span className="ml-1 text-emerald-600 font-medium">· Reserve Met</span>
              )}
            </p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(currentBid)}</p>
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
