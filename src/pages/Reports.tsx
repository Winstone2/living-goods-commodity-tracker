import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, FileSpreadsheet, FileImage, Calendar, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// import { API_CONFIG } from '@/api/config';
import { API_CONFIG } from '@/api/config/api.config';
import type { DashboardStats } from '@/types/dashboard';


import { SubCounty } from '@/types';

// Add these imports at the top
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

// Add these interfaces at the top
interface County {
  id: number;
  name: string;
  code: string;
}

interface Ward {
  name: string;
  subCountyId: number | null;
}

interface Facility {
  name: string;
  type: string;
  wardId: number;
}

interface CommunityUnit {
  id: number;
  chaName: string;
  communityUnitName: string;
  totalChps: number;
  countyId: number;
  subCountyId: number;
  wardId: number;
  linkFacilityId: number;
  createdById: number | null;
  createdAt: string;
}

// Update the RecordData interface to include new fields
interface RecordData {
  id: number;
  communityUnitId: number;
  communityUnitName: string;
  commodityId: number;
  commodityName: string;
  quantityExpired: number;
  quantityDamaged: number;
  stockOnHand: number;
  quantityIssued: number;
  excessQuantityReturned: number;
  quantityConsumed: number;
  closingBalance: number;
  lastRestockDate: string | null;
  stockOutDate: string | null;
  consumptionPeriod: number;
  recordDate: string;
  createdByUsername: string | null;
  countyName: string | null;
  subCountyName: string | null;
  wardName: string | null;
  countyId: number | null;
  subCountyId: number | null;
  wardId: number | null;
  facilityName: string | null;
}

interface ProcessedReportData {
  id: string;
  communityUnit: string;
  county: string;
  subCounty: string;
  ward: string;
  totalConsumption: number;
  commoditiesOutOfStock: string[];
  lastUpdate: string;
  facilityName: string | null;
}

// Add this function before the Reports component
const getSummaryData = (data: ProcessedReportData[]) => {
  const uniqueValues = data.reduce((acc, item) => {
    if (item.county !== 'Not Assigned') acc.counties.add(item.county);
    if (item.subCounty !== 'Not Assigned') acc.subCounties.add(item.subCounty);
    if (item.ward !== 'Not Assigned') acc.wards.add(item.ward);
    acc.totalConsumption += item.totalConsumption;
    return acc;
  }, {
    counties: new Set<string>(),
    subCounties: new Set<string>(),
    wards: new Set<string>(),
    totalConsumption: 0
  });

  return {
    counties: uniqueValues.counties.size,
    subCounties: uniqueValues.subCounties.size,
    wards: uniqueValues.wards.size,
    totalConsumption: uniqueValues.totalConsumption
  };
};

// Add this interface near the top with other interfaces
// interface DashboardStats {
//   totalCounties: number;
//   totalSubCounties: number;
//   totalWards: number;
//   totalFacilities: number;
//   totalCommunityUnits: number;
//   totalConsumption: number;
//   monthlyConsumption: Array<{ name: string; consumption: number }>;
//   stockOutStats: Array<{ communityUnitName: string; commodityNames: string }>;
//   totalStockOuts: number;
// }

export const Reports = () => {
  const { toast } = useToast();
  const [reportData, setReportData] = useState<ProcessedReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [counties, setCounties] = useState<County[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [communityUnits, setCommunityUnits] = useState<CommunityUnit[]>([]);
  const [subCounties, setSubCounties] = useState<SubCounty[]>([]);
  const [filters, setFilters] = useState({
    month: new Date().getMonth().toString(),
    year: new Date().getFullYear().toString(),
    county: '',
    subCounty: '',
    ward: '',
    facility: '',
    communityUnit: ''
  });
  
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filteredCount, setFilteredCount] = useState<number>(0);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Add this helper function to format data for export
  const getExportData = (data: ProcessedReportData[]) => {
    return data.map(item => ({
      'Community Unit': item.communityUnit,
      'County': item.county,
      'Sub-County': item.subCounty,
      'Ward': item.ward,
      'Facility': item.facilityName || 'N/A',
      'Total Consumption': item.totalConsumption,
      'Out of Stock Items': item.commoditiesOutOfStock.join(', ') || 'None',
      'Last Update': item.lastUpdate
    }));
  };

  // Update the exportData function
  const exportData = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const data = getExportData(getFilteredReportData());
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `commodity-report-${timestamp}`;

      toast({
        title: "Export Started",
        description: `Generating ${format.toUpperCase()} report...`,
      });

      switch (format) {
        case 'csv': {
          const ws = XLSX.utils.json_to_sheet(data);
          const csv = XLSX.utils.sheet_to_csv(ws);
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
          saveAs(blob, `${fileName}.csv`);
          break;
        }
        case 'excel': {
          const ws = XLSX.utils.json_to_sheet(data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Report');
          XLSX.writeFile(wb, `${fileName}.xlsx`);
          break;
        }
        case 'pdf': {
          try {
            const doc = new jsPDF();
            const data = getExportData(getFilteredReportData());
            
            // Add title and metadata
            doc.setProperties({
              title: 'Commodity Report',
              subject: 'Commodity Tracking Report',
              author: 'Living Goods'
            });

            // Add title and date
            doc.setFontSize(16);
            doc.text('Commodity Report', 14, 15);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

            // Configure and add the table
            doc.autoTable({
              head: [Object.keys(data[0])],
              body: data.map(Object.values),
              startY: 35,
              styles: { 
                fontSize: 8,
                cellPadding: 2,
                overflow: 'linebreak'
              },
              headStyles: { 
                fillColor: [63, 131, 248],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
              },
              columnStyles: {
                0: { cellWidth: 30 }, // Community Unit
                1: { cellWidth: 25 }, // County
                2: { cellWidth: 25 }, // Sub-County
                3: { cellWidth: 25 }, // Ward
                4: { cellWidth: 25 }, // Facility
                5: { cellWidth: 20 }, // Total Consumption
                6: { cellWidth: 'auto' }, // Out of Stock Items
                7: { cellWidth: 25 }  // Last Update
              },
              margin: { top: 35 }
            });

            // Save the PDF
            doc.save(`${fileName}.pdf`);
          } catch (error) {
            console.error('PDF generation error:', error);
            throw error;
          }
          break;
        }
      }

      toast({
        title: "Export Complete",
        description: `Report exported as ${format.toUpperCase()} successfully!`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to generate export file. Please try again.",
      });
    }
  };

  // Add this function before the return statement
  const getFilteredReportData = () => {
    return reportData.filter(item => {
      // Filter by month and year if they're selected
      if (filters.month || filters.year) {
        const recordDate = new Date(item.lastUpdate);
        const selectedMonth = parseInt(filters.month);
        const selectedYear = parseInt(filters.year);

        if (filters.month && recordDate.getMonth() !== selectedMonth) return false;
        if (filters.year && recordDate.getFullYear() !== selectedYear) return false;
      }

      // Filter by county - fix the comparison
      if (filters.county && item.county) {
        const selectedCounty = counties.find(c => c.id.toString() === filters.county);
        if (!selectedCounty || item.county !== selectedCounty.name) {
          return false;
        }
      }

      // Filter by sub-county
      if (filters.subCounty && item.subCounty !== subCounties.find(sc => sc.id.toString() === filters.subCounty)?.name) {
        return false;
      }

      // Filter by ward
      if (filters.ward && item.ward !== filters.ward) {
        return false;
      }

      // Filter by facility
      if (filters.facility && item.facilityName !== filters.facility) {
        return false;
      }

      // Filter by community unit
      if (filters.communityUnit && item.id !== filters.communityUnit) {
        return false;
      }

      return true;
    });
  };

  // Update the applyFilters function
  const applyFilters = () => {
    const filteredData = getFilteredReportData();
    console.log('Applying filters:', {
      filters,
      resultCount: filteredData.length,
      totalCount: reportData.length
    });

    setFilteredCount(filteredData.length);

    if (filteredData.length === 0) {
      toast({
        title: "No Results",
        description: "No data matches your filter criteria.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Filters Applied",
        description: `Showing ${filteredData.length} of ${reportData.length} records.`,
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      month: new Date().getMonth().toString(),
      year: new Date().getFullYear().toString(),
      county: '',
      subCounty: '',
      ward: '',
      facility: '',
      communityUnit: ''
    });
  };

  const toggleFilters = () => {
    setIsFiltersExpanded(!isFiltersExpanded);
  };

  // Keep fetchReportData and fetchLocationData as separate functions
  const fetchReportData = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/records`, {
        headers:
         {
          'Accept': '*/*'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }

      const result = await response.json();
      if (result.success) {
        const processedData = processReportData(result.data);
        setReportData(processedData);
        return processedData;
      }
      throw new Error(result.message);
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw error;
    }
  };

  const fetchLocationData = async () => {
    try {
      const [countiesRes, subCountiesRes, wardsRes, facilitiesRes, communityUnitsRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/counties`),
        fetch(`${API_CONFIG.BASE_URL}/sub-counties`),
        fetch(`${API_CONFIG.BASE_URL}/wards`),
        fetch(`${API_CONFIG.BASE_URL}/facilities`),
        fetch(`${API_CONFIG.BASE_URL}/community-units`)
      ]);

      const countiesData = await countiesRes.json();
      const subCountiesData = await subCountiesRes.json();
      const wardsData = await wardsRes.json();
      const facilitiesData = await facilitiesRes.json();
      const communityUnitsData = await communityUnitsRes.json();

      if (countiesData.success) setCounties(countiesData.data);
      if (subCountiesData.success) setSubCounties(subCountiesData.data);
      if (wardsData.success) setWards(wardsData.data);
      if (facilitiesData.success) setFacilities(facilitiesData.data);
      if (communityUnitsData.success) setCommunityUnits(communityUnitsData.data);

      return {
        counties: countiesData.data,
        subCounties: subCountiesData.data,
        wards: wardsData.data,
        facilities: facilitiesData.data,
        communityUnits: communityUnitsData.data
      };
    } catch (error) {
      console.error('Error fetching location data:', error);
      throw error;
    }
  };

  // Single useEffect for data fetching
  useEffect(() => {
    let mounted = true;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats first
        const statsResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.DASHBOARD.STATS}`, {
          headers: {
            'Accept': '*/*'
          }
        });

        if (!statsResponse.ok) {
          throw new Error('Failed to fetch stats data');
        }

        const statsData = await statsResponse.json();
        console.log('Stats Response:', {
          status: statsResponse.status,
          data: statsData
        });

        if (statsData.success && statsData.data && mounted) {
          setStats(statsData.data);
          console.log('Stats state updated with:', statsData.data);
        }

        // Fetch other data
        await Promise.all([
          fetchLocationData(),
          fetchReportData()
        ]);

      } catch (error) {
        console.error('Error in fetchAllData:', error);
        if (mounted) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to load data"
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAllData();

    return () => {
      mounted = false;
    };
  }, [toast]);

  // Separate useEffect for stats monitoring (optional)
  useEffect(() => {
    if (stats) {
      console.log('Stats state updated:', stats);
    }
  }, [stats]);

  // Add this useEffect to initialize filteredCount
  useEffect(() => {
    setFilteredCount(reportData.length);
  }, [reportData]);

  const processReportData = (records: RecordData[]): ProcessedReportData[] => {
    // Group records by community unit
    const groupedByCU = records.reduce((acc, record) => {
      if (!acc[record.communityUnitId]) {
        acc[record.communityUnitId] = {
          id: record.communityUnitId.toString(),
          communityUnit: record.communityUnitName,
          county: record.countyName || 'Not Assigned',
          subCounty: record.subCountyName || 'Not Assigned',
          ward: record.wardName || 'Not Assigned',
          totalConsumption: 0,
          commoditiesOutOfStock: [] as string[],
          lastUpdate: record.recordDate,
          facilityName: record.facilityName || null,
          records: [] as RecordData[]
        };
      }

      acc[record.communityUnitId].records.push(record);
      acc[record.communityUnitId].totalConsumption += record.quantityConsumed;

      if (record.stockOnHand === 0) {
        acc[record.communityUnitId].commoditiesOutOfStock.push(record.commodityName);
      }

      // Update lastUpdate if this record is more recent
      if (new Date(record.recordDate) > new Date(acc[record.communityUnitId].lastUpdate)) {
        acc[record.communityUnitId].lastUpdate = record.recordDate;
      }

      return acc;
    }, {} as Record<number, ProcessedReportData & { records: RecordData[] }>);

    // Convert to array and format dates
    return Object.values(groupedByCU).map(({ records, ...rest }) => ({
      ...rest,
      lastUpdate: new Date(rest.lastUpdate).toLocaleDateString(),
      commoditiesOutOfStock: [...new Set(rest.commoditiesOutOfStock)] // Remove duplicates
    }));
  };

  // Add loading state to the UI
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-primary">Loading report data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary data before the return statement
  const summaryData = getSummaryData(reportData);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <FileText className="w-8 h-8 text-primary" />
          <span>Reports & Analytics</span>
        </h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          <Button onClick={() => exportData('csv')} variant="outline" className="text-xs sm:text-sm" size="sm">
            <FileSpreadsheet className="w-4 h-4 mr-1 sm:mr-2" />
            CSV
          </Button>
          <Button onClick={() => exportData('excel')} variant="outline" className="text-xs sm:text-sm" size="sm">
            <FileSpreadsheet className="w-4 h-4 mr-1 sm:mr-2" />
            Excel
          </Button>
          <Button onClick={() => exportData('pdf')} variant="outline" className="text-xs sm:text-sm" size="sm">
            <FileImage className="w-4 h-4 mr-1 sm:mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filter Reports</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleFilters}
              className="h-8 w-8 p-0 rounded-full"
            >
              {isFiltersExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 ${isFiltersExpanded ? '' : 'hidden sm:grid'}`}>
            <div>
              <Label>Month</Label>
              <Select value={filters.month} onValueChange={(value) => setFilters({ ...filters, month: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Year</Label>
              <Input
                type="number"
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                min="2020"
                max="2030"
              />
            </div>
            <div>
              <Label>County</Label>
              <Select value={filters.county} onValueChange={(value) => setFilters({ ...filters, county: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select County" />
                </SelectTrigger>
                <SelectContent>
                  {counties.map((county) => (
                    <SelectItem key={county.id} value={county.id.toString()}>
                      {county.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sub-County</Label>
              <Select 
                value={filters.subCounty} 
                onValueChange={(value) => setFilters({ ...filters, subCounty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Sub-County" />
                </SelectTrigger>
                <SelectContent>
                  {subCounties
                    .filter(sc => !filters.county || sc.county_id.toString() === filters.county)
                    .map((subCounty) => (
                      <SelectItem 
                        key={subCounty.id} 
                        value={subCounty.id.toString()}
                      >
                        {subCounty.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ward</Label>
              <Select value={filters.ward} onValueChange={(value) => setFilters({ ...filters, ward: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Ward" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((ward, index) => (
                    <SelectItem key={index} value={ward.name}>
                      {ward.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isFiltersExpanded && (
              <>
                <div>
                  <Label>Linked Facility</Label>
                  <Select value={filters.facility} onValueChange={(value) => setFilters({ ...filters, facility: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map((facility, index) => (
                        <SelectItem key={index} value={facility.name}>
                          {facility.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Community Unit</Label>
                  <Select value={filters.communityUnit} onValueChange={(value) => setFilters({ ...filters, communityUnit: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Community Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {communityUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id.toString()}>
                          {unit.communityUnitName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={applyFilters} className="bg-primary hover:bg-primary/90">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
            <Button onClick={resetFilters} variant="outline">
              Reset Filters
            </Button>
            <Button 
              onClick={toggleFilters} 
              variant="ghost"
              className="sm:hidden flex items-center" 
              size="sm"
            >
              {isFiltersExpanded ? 'Less Filters' : 'More Filters'}
              {isFiltersExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-primary">
              {stats?.totalCounties || 0}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Total Counties</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {stats?.totalSubCounties || 0}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Total Sub-Counties</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {stats?.totalWards || 0}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Total Wards</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">
              {stats?.totalConsumption || 0}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Total Consumption</div>
          </CardContent>
        </Card>
      </div> */}

      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Report</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Community Unit</TableHead>
                  <TableHead>County</TableHead>
                  <TableHead>Sub-County</TableHead>
                  <TableHead className="hidden sm:table-cell">Ward</TableHead>
                  <TableHead className="hidden sm:table-cell">Facility</TableHead>
                  <TableHead>Consumption</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="hidden sm:table-cell">Last Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredReportData().map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.communityUnit}</TableCell>
                    <TableCell>{item.county}</TableCell>
                    <TableCell>{item.subCounty}</TableCell>
                    <TableCell className="hidden sm:table-cell">{item.ward}</TableCell>
                    <TableCell className="hidden sm:table-cell">{item.facilityName}</TableCell>
                    <TableCell>{item.totalConsumption}</TableCell>
                    <TableCell>
                      {item.commoditiesOutOfStock.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.commoditiesOutOfStock.map((commodity, index) => (
                            <span key={index} className="px-1 sm:px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full whitespace-nowrap">
                              {commodity}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-green-600">In Stock</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{item.lastUpdate}</TableCell>
                  </TableRow>
                ))}
                {getFilteredReportData().length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No records found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
