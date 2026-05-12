import type { Vehicle, FilterState, BodyStyle, TitleStatus, AuctionStatusFilter } from '../types/vehicle.ts';
import { getNormalizedAuctionStart, getAuctionStatus } from './auction.ts';

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  auctionStatuses: [],
  makes: [],
  bodyStyles: [],
  titleStatuses: [],
  provinces: [],
};

export function isFilterActive(filters: FilterState): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.auctionStatuses.length > 0 ||
    filters.makes.length > 0 ||
    filters.bodyStyles.length > 0 ||
    filters.titleStatuses.length > 0 ||
    filters.provinces.length > 0
  );
}

export function filterVehicles(
  vehicles: Vehicle[],
  filters: FilterState,
  now = Date.now(),
): Vehicle[] {
  const search = filters.search.trim().toLowerCase();
  return vehicles.filter((v) => {
    if (search) {
      const haystack = `${v.year} ${v.make} ${v.model} ${v.trim} ${v.vin} ${v.lot}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (filters.auctionStatuses.length) {
      const status = getAuctionStatus(getNormalizedAuctionStart(v.auction_start), now) as AuctionStatusFilter;
      if (!filters.auctionStatuses.includes(status)) return false;
    }
    if (filters.makes.length && !filters.makes.includes(v.make)) return false;
    if (filters.bodyStyles.length && !filters.bodyStyles.includes(v.body_style as BodyStyle)) return false;
    if (filters.titleStatuses.length && !filters.titleStatuses.includes(v.title_status as TitleStatus)) return false;
    if (filters.provinces.length && !filters.provinces.includes(v.province)) return false;
    return true;
  });
}

export interface FilterCounts {
  auctionStatuses: Record<string, number>;
  makes: Record<string, number>;
  bodyStyles: Record<string, number>;
  titleStatuses: Record<string, number>;
  provinces: Record<string, number>;
}

export function computeFilterCounts(vehicles: Vehicle[]): FilterCounts {
  const now = Date.now();
  const counts: FilterCounts = {
    auctionStatuses: {},
    makes: {},
    bodyStyles: {},
    titleStatuses: {},
    provinces: {},
  };
  for (const v of vehicles) {
    const status = getAuctionStatus(getNormalizedAuctionStart(v.auction_start), now);
    counts.auctionStatuses[status] = (counts.auctionStatuses[status] ?? 0) + 1;
    counts.makes[v.make] = (counts.makes[v.make] ?? 0) + 1;
    counts.bodyStyles[v.body_style] = (counts.bodyStyles[v.body_style] ?? 0) + 1;
    counts.titleStatuses[v.title_status] = (counts.titleStatuses[v.title_status] ?? 0) + 1;
    counts.provinces[v.province] = (counts.provinces[v.province] ?? 0) + 1;
  }
  return counts;
}
