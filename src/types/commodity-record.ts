// Base interface for commodity record
export interface CommodityRecord {
  commodityId: number;
  communityUnitId: number;
  quantityExpired: number;
  quantityDamaged: number;
  stockOnHand: number;
  quantityIssued: number;
  excessQuantityReturned: number;
  quantityConsumed: number;
  closingBalance: number;
  consumptionPeriod?: number;
  lastRestockDate?: Date;
  stockOutDate?: Date;
  recordDate?: Date;
}

// Partial type for form state
export type CommodityRecordPartial = Partial<CommodityRecord>;

// API response type
export interface CommodityRecordResponse {
  success: boolean;
  message: string;
  data: CommodityRecord;
}

// API request type
export type CommodityRecordRequest = Omit<CommodityRecord, 'lastRestockDate' | 'stockOutDate' | 'recordDate'>;