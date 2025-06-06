
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, FileSpreadsheet, FileImage, Calendar, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Reports = () => {
  const { toast } = useToast();
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

  // Mock data for reports
  const reportData = [
    {
      id: '1',
      communityUnit: 'Kibera East Unit',
      county: 'Nairobi',
      subCounty: 'Kibera',
      ward: 'Kibera East',
      facility: 'Kibera Health Center',
      totalConsumption: 450,
      commoditiesOutOfStock: ['AL 6s', 'ORS Sachets'],
      lastUpdate: new Date().toLocaleDateString()
    },
    {
      id: '2',
      communityUnit: 'Mathare North Unit',
      county: 'Nairobi',
      subCounty: 'Mathare',
      ward: 'Mathare North',
      facility: 'Mathare Health Center',
      totalConsumption: 320,
      commoditiesOutOfStock: [],
      lastUpdate: new Date().toLocaleDateString()
    }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Mock data for filters
  const counties = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'];
  const subCounties = ['Kibera', 'Mathare', 'Kasarani', 'Westlands'];
  const wards = ['Kibera East', 'Kibera West', 'Mathare North', 'Mathare South'];
  const facilities = ['Kibera Health Center', 'Mathare Health Center', 'Kasarani Hospital'];
  const communityUnits = ['Kibera East Unit', 'Mathare North Unit', 'Kasarani Community Unit'];

  const exportData = (format: 'csv' | 'excel' | 'pdf') => {
    // Mock export functionality
    toast({
      title: "Export Started",
      description: `Generating ${format.toUpperCase()} report...`,
    });

    // Simulate export delay
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Report exported as ${format.toUpperCase()} successfully!`,
      });
    }, 2000);
  };

  const applyFilters = () => {
    toast({
      title: "Filters Applied",
      description: "Report data has been filtered according to your selection.",
    });
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
                    <SelectItem key={county} value={county.toLowerCase()}>{county}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sub-County</Label>
              <Select value={filters.subCounty} onValueChange={(value) => setFilters({ ...filters, subCounty: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Sub-County" />
                </SelectTrigger>
                <SelectContent>
                  {subCounties.map((subCounty) => (
                    <SelectItem key={subCounty} value={subCounty.toLowerCase()}>{subCounty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isFiltersExpanded && (
              <>
                <div>
                  <Label>Ward</Label>
                  <Select value={filters.ward} onValueChange={(value) => setFilters({ ...filters, ward: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Ward" />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map((ward) => (
                        <SelectItem key={ward} value={ward.toLowerCase()}>{ward}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Linked Facility</Label>
                  <Select value={filters.facility} onValueChange={(value) => setFilters({ ...filters, facility: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map((facility) => (
                        <SelectItem key={facility} value={facility.toLowerCase()}>{facility}</SelectItem>
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
                        <SelectItem key={unit} value={unit.toLowerCase()}>{unit}</SelectItem>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-primary">12</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Sub-Counties</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-green-600">156</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Facilities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">89</div>
            <div className="text-xs sm:text-sm text-gray-600">Community Units</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">770</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Consumption</div>
          </CardContent>
        </Card>
      </div>

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
                {reportData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.communityUnit}</TableCell>
                    <TableCell>{item.county}</TableCell>
                    <TableCell>{item.subCounty}</TableCell>
                    <TableCell className="hidden sm:table-cell">{item.ward}</TableCell>
                    <TableCell className="hidden sm:table-cell">{item.facility}</TableCell>
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
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
