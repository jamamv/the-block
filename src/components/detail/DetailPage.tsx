import { useParams, Link } from 'react-router-dom';
import type { BidStateMap } from '../../types/vehicle.ts';
import { getVehicleById } from '../../data/vehicles.ts';
import { formatCurrency, formatLot } from '../../utils/format.ts';
import { TitleBadge, FuelBadge, ConditionBadge } from '../ui/Badge.tsx';
import { AuctionStatusBadge } from '../ui/AuctionStatus.tsx';
import { ImageGallery } from './ImageGallery.tsx';
import { SpecsGrid } from './SpecsGrid.tsx';
import { ConditionPanel } from './ConditionPanel.tsx';
import { BidPanel } from './BidPanel.tsx';

interface DetailPageProps {
  bidStateMap: BidStateMap;
  onPlaceBid: (vehicleId: string, amount: number) => void;
}

export function DetailPage({ bidStateMap, onPlaceBid }: DetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const vehicle = id ? getVehicleById(id) : undefined;

  if (!vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-2xl font-bold text-slate-700 mb-2">Vehicle not found</p>
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          ← Back to inventory
        </Link>
      </div>
    );
  }

  const bidState = bidStateMap[vehicle.id];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav className="mb-5 flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-blue-600 transition-colors">
          Inventory
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate">
          {vehicle.make} {vehicle.model} ({vehicle.year})
        </span>
      </nav>

      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {vehicle.make} {vehicle.model} {vehicle.trim}{' '}
            <span className="text-slate-400">({vehicle.year})</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {formatLot(vehicle.lot)} · {vehicle.vin}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <AuctionStatusBadge auctionStart={vehicle.auction_start} />
          <TitleBadge status={vehicle.title_status} />
          <FuelBadge fuel={vehicle.fuel_type} />
          <ConditionBadge grade={vehicle.condition_grade} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery images={vehicle.images} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />

          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Specifications</h2>
            <SpecsGrid vehicle={vehicle} />
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Condition</h2>
            <ConditionPanel vehicle={vehicle} />
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Auction Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Starting Bid</p>
                <p className="font-semibold text-slate-800">{formatCurrency(vehicle.starting_bid)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Reserve Price</p>
                <p className="font-semibold text-slate-800">{formatCurrency(vehicle.reserve_price)}</p>
              </div>
              {vehicle.buy_now_price !== null && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Buy Now Price</p>
                  <p className="font-semibold text-blue-700">{formatCurrency(vehicle.buy_now_price)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Auction Start</p>
                <p className="font-semibold text-slate-800">
                  {new Date(vehicle.auction_start).toLocaleDateString('en-CA', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <BidPanel
            vehicle={vehicle}
            bidState={bidState}
            onPlaceBid={onPlaceBid}
          />
        </div>
      </div>
    </div>
  );
}
