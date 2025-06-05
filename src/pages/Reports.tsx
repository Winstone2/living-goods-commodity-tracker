
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, FileSpreadsheet, FileImage, Calendar, Filter } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <FileText className="w-8 h-8 text-primary" />
          <span>Reports & Analytics</span>
        </h1>
        <div className="flex space-x-2">
          <Button onClick={() => exportData('csv')} variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => exportData('excel')} variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={() => exportData('pdf')} variant="outline">
            <FileImage className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
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
                  <SelectItem value="nairobi">Nairobi</SelectItem>
                  <SelectItem value="mombasa">Mombasa</SelectItem>
                  <SelectItem value="kisumu">Kisumu</SelectItem>
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
                  <SelectItem value="kibera">Kibera</SelectItem>
                  <SelectItem value="mathare">Mathare</SelectItem>
                  <SelectItem value="kasarani">Kasarani</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={applyFilters} className="bg-primary hover:bg-primary/90">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
            <Button onClick={resetFilters} variant="outline">
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-sm text-gray-600">Total Sub-Counties</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">156</div>
            <div className="text-sm text-gray-600">Total Facilities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600">89</div>
            <div className="text-sm text-gray-600">Community Units</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600">770</div>
            <div className="text-sm text-gray-600">Total Consumption</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Community Unit</TableHead>
                <TableHead>County</TableHead>
                <TableHead>Sub-County</TableHead>
                <TableHead>Ward</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Total Consumption</TableHead>
                <TableHead>Out of Stock</TableHead>
                <TableHead>Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.communityUnit}</TableCell>
                  <TableCell>{item.county}</TableCell>
                  <TableCell>{item.subCounty}</TableCell>
                  <TableCell>{item.ward}</TableCell>
                  <TableCell>{item.facility}</TableCell>
                  <TableCell>{item.totalConsumption}</TableCell>
                  <TableCell>
                    {item.commoditiesOutOfStock.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.commoditiesOutOfStock.map((commodity, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            {commodity}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-green-600">In Stock</span>
                    )}
                  </TableCell>
                  <TableCell>{item.lastUpdate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
