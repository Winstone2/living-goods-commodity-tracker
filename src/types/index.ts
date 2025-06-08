// Re-export database types for backward compatibility
export * from './database';

// Legacy types - keeping for backward compatibility with existing components
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: Date;
  token?: string; // Optional for legacy support
}

export interface CommunityUnit {
  id: string;
  county: string;
  subCounty: string;
  ward: string;
  linkFacility: string;
  communityUnitName: string;
  chaName: string;
  totalCHPs: number;
  createdAt: Date;
  userId: string;
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
}

export interface DashboardStats {
  totalSubCounties: number;
  totalFacilities: number;
  totalCommunityUnits: number;
  totalWards: number;
  monthlyConsumption: { communityUnit: string; totalConsumption: number }[];
  outOfStockUnits: { communityUnit: string; commodities: string[] }[];
}
