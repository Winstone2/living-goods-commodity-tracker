export interface Location {
  countyName: string;
  wardName: string;
  id: number;
  name: string;
  parentIds?: number[];

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