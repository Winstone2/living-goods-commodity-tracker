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
import {
  Building,
  Map,
  MapPin,
  Home,
  Users,
  Package,
  AlertTriangle,
  Check,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { AUTH_HEADER } from '@/api/config/auth-headers';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Create a helper function for common headers
const getDefaultHeaders = () => ({
  'Accept': '*/*',
  'Content-Type': 'application/json',
  'Authorization': AUTH_HEADER
});

// First, ensure the County interface matches the API response
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
  // createdById: number | null;
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
  // createdByUsername: string | null;
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
  facility: string;
  createdByUsername: string | null;

  commodities: Array<{
    name: string;
    consumed: number;
    expired: number;
    damaged: number;
    stockOnHand: number;
    issued: number;
    returned: number;
    closing: number;
    lastRestock: string | null;
    stockOut: string | null;
    consumptionPeriod: number;
    closingBalance: number;
    quantityToOrder: number;
    lastRestockDate: string | null;
    stockOutDate: string | null;
    earliestExpiryDate: string | null;
    createdByUsername: string | null;

  }>;
  totalConsumption: number;
  commoditiesOutOfStock: string[];
  lastUpdate: string;
  // createdBy: string | null;
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
  // Add these state variables after existing useState declarations
  const [filteredSubCounties, setFilteredSubCounties] = useState<SubCounty[]>([]);
  const [filteredWards, setFilteredWards] = useState<Ward[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [filteredCommunityUnits, setFilteredCommunityUnits] = useState<CommunityUnit[]>([]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Add this helper function to format data for export
  const getExportData = (data: ProcessedReportData[]) => {
    const exportRows: any[] = [];

    data.forEach(item => {
      // For each commodity in the community unit, create a separate row
      item.commodities.forEach(commodity => {
        exportRows.push({
        
          'County': item.county,
          'Sub-County': item.subCounty,
          'Ward': item.ward,
          'Facility': item.facility,
          'Community Unit': item.communityUnit,
          'Commodity': commodity.name,
          'Opening Balance': commodity.stockOnHand,
          'Quantity Issued': commodity.issued,
          'Quantity Consumed': commodity.consumed,
          'Quantity Expired': commodity.expired || 'N/A', // Added missing field
          'Quantity Damaged': commodity.damaged,
          'Excess Qty Returned': commodity.returned,
          'Closing Balance': commodity.closing,
          'Quantity to Order': commodity.quantityToOrder,
          'Last Restock Date': commodity.lastRestock ? new Date(commodity.lastRestock).toLocaleDateString() : 'N/A',
          'Stock-out Date': commodity.stockOutDate ? new Date(commodity.stockOutDate).toLocaleDateString() : 'N/A',
          'Consumption Period (Days)': commodity.consumptionPeriod,
          'Earliest Expiry Date': commodity.earliestExpiryDate
        });
      });
    });

    return exportRows;
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
            const doc = new jsPDF('landscape', 'pt', 'a4');
            const data = getExportData(getFilteredReportData());

            doc.setProperties({
              title: 'Commodity Report',
              subject: 'Commodity Tracking Report',
              author: 'Living Goods'
            });

            // Add title and date
            doc.setFontSize(16);
            doc.text('Commodity Report', 40, 40);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 60);

            // Configure and add the table
            doc.autoTable({
              head: [Object.keys(data[0])],
              body: data.map(Object.values),
              startY: 70,
              styles: {
                fontSize: 7,
                cellPadding: 2,
                overflow: 'linebreak'
              },
              headStyles: {
                fillColor: [63, 131, 248],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
              },
              columnStyles: {
                0: { cellWidth: 40 }, // Community Unit
                1: { cellWidth: 35 }, // County
                2: { cellWidth: 35 }, // Sub-County
                3: { cellWidth: 35 }, // Ward
                4: { cellWidth: 40 }, // Facility
                5: { cellWidth: 40 }, // Commodity
                6: { cellWidth: 25 }, // Stock On Hand
                7: { cellWidth: 25 }, // Consumed
                8: { cellWidth: 25 }, // Issued
                9: { cellWidth: 25 }, // Damaged
                10: { cellWidth: 25 }, // Returned
                11: { cellWidth: 30 }, // Closing Balance
                12: { cellWidth: 35 }, // Last Restock Date
                13: { cellWidth: 35 }, // Stock Out Date
                14: { cellWidth: 30 }, // Stock Status
                15: { cellWidth: 35 }  // Last Update
              },
              margin: { top: 70 }
            });

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

  // Add these helper functions before getFilteredReportData
  const getFilteredSubCounties = () => {
    if (!filters.county || filters.county === 'all') {
      return subCounties;
    }
    return subCounties.filter(sc => sc.county_id?.toString() === filters.county);
  };

  const getFilteredWards = () => {
    if (!filters.subCounty) {
      if (!filters.county || filters.county === 'all') {
        return wards;
      }
      // If only county is selected, show wards from all sub-counties in that county
      const countySubCounties = getFilteredSubCounties();
      const subCountyIds = countySubCounties.map(sc => sc.id);
      return wards.filter(ward =>
        ward.subCountyId === null || subCountyIds.includes(ward.subCountyId)
      );
    }
    // If sub-county is selected, show only wards from that sub-county
    return wards.filter(ward => ward.subCountyId?.toString() === filters.subCounty);
  };

  const getFilteredFacilities = () => {
    if (!filters.ward) {
      // ...existing logic for county/subcounty...
      return facilities;
    }
    // Ward selected - show facilities linked to the selected ward
    const wardIds = filteredWards.filter(w => w.subCountyId?.toString() === filters.subCounty).map(w => w.id);
    return facilities.filter(
      facility => Array.isArray(facility.parentIds) && facility.parentIds.some(id => wardIds.includes(id))
    );
  };

  const getFilteredCommunityUnits = () => {
    let filtered = communityUnits;

    if (filters.county && filters.county !== 'all') {
      filtered = filtered.filter(cu => cu.countyId?.toString() === filters.county);
    }

    if (filters.subCounty) {
      filtered = filtered.filter(cu => cu.subCountyId?.toString() === filters.subCounty);
    }

    if (filters.ward) {
      filtered = filtered.filter(cu => cu.wardId?.toString() === filters.ward);
    }

    if (filters.facility) {
      const selectedFacility = facilities.find(f => f.name === filters.facility);
      if (selectedFacility) {
        // Assuming facilities have an ID that matches linkFacilityId
        filtered = filtered.filter(cu => cu.linkFacilityId === selectedFacility.wardId); // You'll need the facility ID here
      }
    }

    return filtered;
  };
  // Add this function before the return statement
  const getFilteredReportData = () => {
    return reportData.filter(item => {
      // Filter by month and year
      if (filters.month || filters.year) {
        const recordDate = new Date(item.lastUpdate);
        const selectedMonth = parseInt(filters.month);
        const selectedYear = parseInt(filters.year);

        if (filters.month && recordDate.getMonth() !== selectedMonth) return false;
        if (filters.year && recordDate.getFullYear() !== selectedYear) return false;
      }

      // Updated county filter check with proper comparison
      if (filters.county && filters.county !== 'all') {
        const selectedCounty = counties.find(c => c.id.toString() === filters.county);
        if (!selectedCounty) return false;
        // Compare county names directly since that's what we have in the report data
        if (item.county.toLowerCase() !== selectedCounty.name.toLowerCase()) return false;
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
        headers: getDefaultHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }

      const result = await response.json();
      if (result.success) {
        const processedData = processReportData(result.data);
        console.log('what we are getting fromn te record data source', result)
        console.log('Processed Report Data:', processedData);
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
      const headers = getDefaultHeaders();
      const [countiesRes, subCountiesRes, wardsRes, facilitiesRes, communityUnitsRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/counties`, { headers }),
        fetch(`${API_CONFIG.BASE_URL}/sub-counties`, { headers }),
        fetch(`${API_CONFIG.BASE_URL}/wards`, { headers }),
        fetch(`${API_CONFIG.BASE_URL}/facilities`, { headers }),
        fetch(`${API_CONFIG.BASE_URL}/community-units`, { headers })
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
          headers: getDefaultHeaders()
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

  // Add this useEffect to check counties loading
  useEffect(() => {
    if (counties.length === 0) {
      console.warn('Counties not loaded');
    } else {
      console.log('Counties loaded:', counties);
    }
  }, [counties]);

  // Add this useEffect to update filtered options when dependencies change
  useEffect(() => {
    setFilteredSubCounties(getFilteredSubCounties());
    setFilteredWards(getFilteredWards());
    setFilteredFacilities(getFilteredFacilities());
    setFilteredCommunityUnits(getFilteredCommunityUnits());
  }, [filters.county, filters.subCounty, filters.ward, filters.facility, subCounties, wards, facilities, communityUnits]);
  

 const processReportData = (records: RecordData[]): ProcessedReportData[] => {
  const groupedByCU = records.reduce((acc, record) => {
    const cuId = record.communityUnitId;
    if (!acc[cuId]) {
      acc[cuId] = {
        id: cuId.toString(),
        communityUnit: record.communityUnitName,
        county: record.countyName || 'Not Assigned',
        subCounty: record.subCountyName || 'Not Assigned',
        ward: record.wardName || 'Not Assigned',
        facility: record.facilityName || 'Not Assigned',
        commodities: [],
        totalConsumption: 0,
        commoditiesOutOfStock: [],
        lastUpdate: record.recordDate,
        createdByUsername: record.createdByUsername || 'Unknown',
      };
    } else {
      // ✅ Update createdByUsername if it was 'Unknown' and now we have a valid name
      if (
        acc[cuId].createdByUsername === 'Unknown' &&
        record.createdByUsername
      ) {
        acc[cuId].createdByUsername = record.createdByUsername;
      }

      // ✅ Update lastUpdate if this record is more recent
      if (new Date(record.recordDate) > new Date(acc[cuId].lastUpdate)) {
        acc[cuId].lastUpdate = record.recordDate;
      }
    }

    // ✅ Add commodity details
    acc[cuId].commodities.push({
      name: record.commodityName,
      consumed: record.quantityConsumed,
      expired: record.quantityExpired,
      damaged: record.quantityDamaged,
      stockOnHand: record.stockOnHand,
      issued: record.quantityIssued,
      returned: record.excessQuantityReturned,
      closing: record.closingBalance,
      lastRestock: record.lastRestockDate,
      stockOutDate: record.stockOutDate,
      earliestExpiryDate: record.earliestExpiryDate,
      quantityToOrder: record.quantityToOrder,
      consumptionPeriod: record.consumptionPeriod,
      createdByUsername: record.createdByUsername || 'Unknown',
    });

    // ✅ Track total consumption
    acc[cuId].totalConsumption += record.quantityConsumed;

    // ✅ Track out-of-stock commodities
    if (record.stockOnHand === 0) {
      acc[cuId].commoditiesOutOfStock.push(record.commodityName);
    }

    return acc;
  }, {} as Record<number, ProcessedReportData>);

  return Object.values(groupedByCU).map(item => ({
    ...item,
    lastUpdate: new Date(item.lastUpdate).toLocaleDateString(),
    commoditiesOutOfStock: [...new Set(item.commoditiesOutOfStock)],
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
          {/* <Button onClick={() => exportData('pdf')} variant="outline" className="text-xs sm:text-sm" size="sm">
            <FileImage className="w-4 h-4 mr-1 sm:mr-2" />
            PDF
          </Button> */}
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
              <Select
                value={filters.county}
                onValueChange={(value) => {
                  console.log('Selected county:', value);
                  setFilters({
                    ...filters,
                    county: value,
                    subCounty: '', // Reset dependent filters
                    ward: '',
                    facility: '',
                    communityUnit: ''
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select County" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Counties</SelectItem>
                  {counties && counties.length > 0 && counties.map((county) => (
                    <SelectItem
                      key={county.id}
                      value={county.id.toString()}
                    >
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
                onValueChange={(value) => setFilters({
                  ...filters,
                  subCounty: value,
                  ward: '', // Reset dependent filters
                  facility: '',
                  communityUnit: ''
                })}
                disabled={!filters.county || filters.county === 'all'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Sub-County" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubCounties.map((subCounty) => (
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
              <Select
                value={filters.ward}
                onValueChange={(value) => setFilters({
                  ...filters,
                  ward: value,
                  facility: '', // Reset dependent filters
                  communityUnit: ''
                })}
                disabled={!filters.subCounty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Ward" />
                </SelectTrigger>
                <SelectContent>
                  {filteredWards.map((ward, index) => (
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
                  <Select
                    value={filters.facility}
                    onValueChange={(value) => setFilters({
                      ...filters,
                      facility: value,
                      communityUnit: '' // Reset dependent filter
                    })}
                    disabled={!filters.ward}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredFacilities.map((facility, index) => (
                        <SelectItem key={index} value={facility.name}>
                          {facility.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Community Unit</Label>
                  <Select
                    value={filters.communityUnit}
                    onValueChange={(value) => setFilters({ ...filters, communityUnit: value })}
                    disabled={!filters.facility}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Community Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCommunityUnits.map((unit) => (
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
      <Card>
  <CardHeader>
    <CardTitle>Detailed Report</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Desktop View */}
    <div
      className="hidden md:block overflow-x-auto"
      style={{
        maxHeight: '60vh', // or any height you prefer
        overflowY: 'auto',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb'
      }}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Community Unit</TableHead>
            <TableHead>Location Details</TableHead>
            <TableHead>Commodity Details</TableHead>
            <TableHead>Stock Status</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Last Update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getFilteredReportData().map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.communityUnit}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-semibold">{item.county}</p>
                  <p>{item.subCounty}</p>
                  <p className="text-sm text-gray-500">{item.ward}</p>
                  <p className="text-sm text-gray-500">{item.facility}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  {item.commodities.map((commodity, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded-md">
                      <p className="font-medium">{commodity.name}</p>
                      <div className="grid grid-cols-2 gap-x-4 text-sm">
                        <span>Consumed: {commodity.consumed}</span>
                        <span>Issued: {commodity.issued}</span>
                        <span>Damaged: {commodity.damaged}</span>
                        <span>Returned: {commodity.returned}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {item.commoditiesOutOfStock.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {item.commoditiesOutOfStock.map((commodity, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        {commodity}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-green-600">All In Stock</span>
                )}
              </TableCell>
              <TableCell>
                {item.createdByUsername || 'N/A'}
              </TableCell>
              <TableCell>{item.lastUpdate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    {/* Mobile View */}
    <div className="md:hidden space-y-4">
      {getFilteredReportData().map((item) => (
        <div key={item.id} className="bg-white p-4 rounded-lg border">
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-lg">{item.communityUnit}</h3>
              <p className="text-sm text-gray-500">{item.facility}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">County:</span> {item.county}
              </div>
              <div>
                <span className="font-medium">Sub-County:</span> {item.subCounty}
              </div>
              <div>
                <span className="font-medium">Ward:</span> {item.ward}
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Commodities:</p>
              {item.commodities.map((commodity, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded-md text-sm">
                  <p className="font-medium">{commodity.name}</p>
                  <div className="grid grid-cols-2 gap-1">
                    <span>Stock: {commodity.stockOnHand}</span>
                    <span>Used: {commodity.consumed}</span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="font-medium text-sm">Stock Status:</p>
              {item.commoditiesOutOfStock.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.commoditiesOutOfStock.map((commodity, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {commodity}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-green-600 text-sm">All In Stock</span>
              )}
            </div>

            {/* <div className="text-sm text-gray-500">
              Created: {item.createdByUsername || 'N/A'}
            </div> */}

            <div className="text-sm text-gray-500">
              Last Update: {item.lastUpdate}
            </div>
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>

    </div>
  );
};

// In your parent component or route
<ErrorBoundary>
  <Reports />
</ErrorBoundary>
