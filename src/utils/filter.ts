import type { Vehicle, FilterState, BodyStyle, TitleStatus } from '../types/vehicle.ts';

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  makes: [],
  bodyStyles: [],
  titleStatuses: [],
  provinces: [],
};

export function isFilterActive(filters: FilterState): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.makes.length > 0 ||
    filters.bodyStyles.length > 0 ||
    filters.titleStatuses.length > 0 ||
    filters.provinces.length > 0
  );
}

export function filterVehicles(
  vehicles: Vehicle[],
  filters: FilterState,
): Vehicle[] {
  const search = filters.search.trim().toLowerCase();
  return vehicles.filter((v) => {
    if (search) {
      const haystack = `${v.year} ${v.make} ${v.model} ${v.trim} ${v.vin} ${v.lot}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (filters.makes.length && !filters.makes.includes(v.make)) return false;
    if (filters.bodyStyles.length && !filters.bodyStyles.includes(v.body_style as BodyStyle)) return false;
    if (filters.titleStatuses.length && !filters.titleStatuses.includes(v.title_status as TitleStatus)) return false;
    if (filters.provinces.length && !filters.provinces.includes(v.province)) return false;
    return true;
  });
}
