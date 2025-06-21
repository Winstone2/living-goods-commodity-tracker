export interface CommunityUnitResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    chaName: string;
    communityUnitName: string;
    totalChps: number;
    countyName: number;
    subCountyId: number;
    wardName: number;
    linkFacilityId: number;
    createdById: number | null;
    createdAt: string;
    
  };
  timestamp: string;
  totalCHPsCounted:number
}