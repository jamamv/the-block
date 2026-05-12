export type TitleStatus = 'clean' | 'rebuilt' | 'salvage';
export type FuelType = 'gasoline' | 'hybrid' | 'electric' | 'diesel';
export type BodyStyle = 'suv' | 'sedan' | 'truck' | 'coupe' | 'hatchback';
export type Transmission = 'automatic' | 'manual' | 'CVT' | 'single-speed';
export type Drivetrain = 'AWD' | '4WD' | 'FWD' | 'RWD';

export interface Vehicle {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  body_style: BodyStyle;
  exterior_color: string;
  interior_color: string;
  engine: string;
  transmission: Transmission;
  drivetrain: Drivetrain;
  odometer_km: number;
  fuel_type: FuelType;
  condition_grade: number;
  condition_report: string;
  damage_notes: string[];
  title_status: TitleStatus;
  province: string;
  city: string;
  auction_start: string;
  starting_bid: number;
  reserve_price: number;
  buy_now_price: number | null;
  images: string[];
  selling_dealership: string;
  lot: string;
  current_bid: number;
  bid_count: number;
}

export interface BidState {
  current_bid: number;
  bid_count: number;
  last_bid_at: string;
  bought_now?: boolean;
}

export type BidStateMap = Record<string, BidState>;

export type AuctionStatusFilter = 'live' | 'ending-soon' | 'upcoming' | 'ended';

export interface FilterState {
  search: string;
  auctionStatuses: AuctionStatusFilter[];
  makes: string[];
  bodyStyles: BodyStyle[];
  titleStatuses: TitleStatus[];
  provinces: string[];
}

export type SortKey =
  | 'bid_desc'
  | 'bid_asc'
  | 'year_desc'
  | 'odometer_asc'
  | 'condition_desc';
