export interface ConsumptionData {
  name: string;
  consumption: number;
}

export interface StockOutData {
  communityUnitName: string;
  commodityNames: string;
}

export interface DashboardStats {
  totalCounties: number;
  totalSubCounties: number;
  totalWards: number;
  totalFacilities: number;
  totalCommunityUnits: number;
  totalStockOuts: number;
  lowStockItems: number;
  monthlyConsumption: ConsumptionData[];
  stockOutStats: StockOutData[];
  topConsumption: ConsumptionData[];
}