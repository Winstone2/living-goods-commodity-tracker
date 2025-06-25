export interface Location {
  wardName: string;
  id: number;
  name: string;
  parentId?: number;
}

export interface LocationDropdowns {
  counties: Location[];
  subCounties: Location[];
  wards: Location[];
  facilities: Location[];
  communityUnits: Location[] | null;
  communityHealthWorkers: Location[] | null;
  countyName: string;
  subCountyName: string;
  wardName: string;
}