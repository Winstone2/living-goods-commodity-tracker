// Re-export database types for backward compatibility
export * from './database';
export * from './commodity-record';

// Legacy types - keeping for backward compatibility with existing components
export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'USER' | 'CHA' | 'MANAGER';
  createdAt: Date;
  token?: string; // Optional for legacy support
}

export interface CommunityUnit {
  id: number;
  county: string;
  subCounty: string;
  ward: string;
  linkFacility: string;
  communityUnitName: string;
  chaName: string;
  totalCHPs: number;
  totalCHPsCounted: number; // Add this field
  countyId: number;
  subCountyId: number;
  wardId: number;
  linkFacilityId: number;
  createdById: number | null;
  chpId: number | null; // Add this field for CHP ID
  stockLevel: number | null; // Add this field for stock level
  createdAt: string;
  SubCounty: number;
}

export interface Commodity {
  id: string;
  name: string;
  category: string;
}

export interface CommodityRecord {
  id: string;
  communityUnitId: string;
  commodityId: string;
  quantityExpired: number;
  quantityDamaged: number;
  stockOnHand: number;
  quantityIssued: number;
  excessQuantityReturned: number;
  quantityConsumed: number;
  closingBalance: number;
  lastRestockDate?: Date;
  stockOutDate?: Date;
  consumptionPeriod?: number;
  recordDate: Date;
  userId: string;
  earliestExpiryDate:string
  quantityToOrder:string
  createdById: number | null;

  
}

export interface DashboardStats {
  totalSubCounties: number;
  totalFacilities: number;
  totalCommunityUnits: number;
  totalWards: number;
  monthlyConsumption: { communityUnit: string; totalConsumption: number }[];
  outOfStockUnits: { communityUnit: string; commodities: string[] }[];
}
