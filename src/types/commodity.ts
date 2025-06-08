export interface CommodityCategory {
  id: number;
  name: string;
  description: string;
}

export interface Commodity {
  id: number;
  name: string;
  description: string;
  unitOfMeasure: string;
  categoryId: number;
  category?: CommodityCategory;
}

export interface CommodityRecordRequest {
  communityUnitId: number;
  commodityId: number;
  quantityExpired: number;
  quantityDamaged: number;
  stockOnHand: number;
  quantityIssued: number;
  excessQuantityReturned: number;
  quantityConsumed: number;
  closingBalance: number;
  consumptionPeriod: number;
}

export interface CommodityResponse {
  success: boolean;
  message: string;
  data: Commodity[];
}

export interface CommoditySelection {
  commodityId: number;
  communityUnitId: number;
}