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
  earliestExpiryDate: string | null;
  quantityToOrder: number;
  createdBy?: number | null;
  chpId?: number | null; // Add this field for CHP ID

}

// Partial type for form state
export type CommodityRecordPartial = Partial<CommodityRecord> & {
  earliestExpiryDate?: string | null;
  quantityToOrder?: number;
  createdBy?: number | null;
  chpId?: number | null;
};

// API response type
export interface CommodityRecordResponse {
  success: boolean;
  message: string;
  data: CommodityRecord;
}

// API request type
export type CommodityRecordRequest = Omit<CommodityRecord, 'lastRestockDate' | 'stockOutDate' | 'recordDate'>;