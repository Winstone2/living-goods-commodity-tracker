
// Database Schema Types for Community Health Supply Management System

export interface DatabaseTables {
  users: User;
  counties: County;
  sub_counties: SubCounty;
  wards: Ward;
  facilities: Facility;
  community_units: CommunityUnit;
  commodity_categories: CommodityCategory;
  commodities: Commodity;
  commodity_records: CommodityRecord;
  commodity_stock_history: CommodityStockHistory;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'user';
  created_at: Date;
  last_login?: Date;
}

export interface County {
  id: string;
  name: string;
  code: string;
}

export interface SubCounty {
  id: string;
  name: string;
  county_id: string;
  county?: County;
}

export interface Ward {
  id: string;
  name: string;
  sub_county_id: string;
  sub_county?: SubCounty;
}

export interface Facility {
  id: string;
  name: string;
  ward_id: string;
  facility_code: string;
  type: string;
  ward?: Ward;
}

export interface CommunityUnit {
  id: string;
  community_unit_name: string;
  county_id: string;
  sub_county_id: string;
  ward_id: string;
  link_facility_id: string;
  cha_name: string;
  total_chps: number;
  created_at: Date;
  created_by: string;
  county?: County;
  sub_county?: SubCounty;
  ward?: Ward;
  link_facility?: Facility;
  created_by_user?: User;
}

export interface CommodityCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Commodity {
  id: string;
  name: string;
  category_id: string;
  unit_of_measure: string;
  description?: string;
  category?: CommodityCategory;
}

export interface CommodityRecord {
  id: string;
  community_unit_id: string;
  commodity_id: string;
  quantity_expired: number;
  quantity_damaged: number;
  stock_on_hand: number;
  quantity_issued: number;
  excess_quantity_returned: number;
  quantity_consumed: number;
  closing_balance: number;
  last_restock_date?: Date;
  stock_out_date?: Date;
  consumption_period?: number;
  record_date: Date;
  created_by: string;
  created_at: Date;
  community_unit?: CommunityUnit;
  commodity?: Commodity;
  created_by_user?: User;
}

export interface CommodityStockHistory {
  id: string;
  community_unit_id: string;
  commodity_id: string;
  previous_balance: number;
  new_balance: number;
  quantity_changed: number;
  change_type: 'restock' | 'issue' | 'return' | 'adjustment' | 'expired' | 'damaged';
  record_date: Date;
  recorded_by: string;
  notes?: string;
  community_unit?: CommunityUnit;
  commodity?: Commodity;
  recorded_by_user?: User;
}

// Database Views and Aggregated Data Types
export interface DashboardStats {
  total_counties: number;
  total_sub_counties: number;
  total_wards: number;
  total_facilities: number;
  total_community_units: number;
  total_commodities: number;
  monthly_consumption: MonthlyConsumption[];
  out_of_stock_units: OutOfStockUnit[];
  low_stock_alerts: LowStockAlert[];
}

export interface MonthlyConsumption {
  community_unit_id: string;
  community_unit_name: string;
  total_consumption: number;
  month: number;
  year: number;
}

export interface OutOfStockUnit {
  community_unit_id: string;
  community_unit_name: string;
  county: string;
  sub_county: string;
  ward: string;
  facility: string;
  out_of_stock_commodities: string[];
}

export interface LowStockAlert {
  community_unit_id: string;
  community_unit_name: string;
  commodity_id: string;
  commodity_name: string;
  current_stock: number;
  minimum_threshold: number;
}

// Filter and Search Types
export interface ReportFilters {
  month?: string;
  year?: string;
  county_id?: string;
  sub_county_id?: string;
  ward_id?: string;
  facility_id?: string;
  community_unit_id?: string;
  commodity_category_id?: string;
  commodity_id?: string;
  date_from?: Date;
  date_to?: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  pagination?: {
    current_page: number;
    total_pages: number;
    total_records: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface BulkImportResult {
  total_records: number;
  successful_imports: number;
  failed_imports: number;
  errors: ImportError[];
}

export interface ImportError {
  row_number: number;
  field: string;
  error_message: string;
  provided_value: string;
}
