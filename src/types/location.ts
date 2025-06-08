export interface Location {
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
}