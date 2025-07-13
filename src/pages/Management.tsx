import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, UserCheck, Building, MapPin, Link, Unlink, 
  Plus, AlertCircle, CheckCircle, Loader
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/api/config/api.config';

interface CHP {
  id: number;
  username: string;
  email: string;
  role: string | null;
}

interface CHA {
  id: number;
  username: string;
  email: string;
  role: string | null;
}

interface CommunityUnit {
  id: number;
  chaName: string;
  communityUnitName: string;
  totalChps: number;
  countyName: string;
  subCountyId: number;
  wardName: string;
  linkFacilityId: number;
  createdBy: number;
  createdAt: string;
  stockLevel: number;
  totalCHPsCounted: number;
}

interface MappingRequest {
  chaId: number;
  chpId: number;
  communityUnitId: number;
}

export const Management = () => {
  const [chps, setCHPs] = useState<CHP[]>([]);
  const [chas, setCHAs] = useState<CHA[]>([]);
  const [communityUnits, setCommunityUnits] = useState<CommunityUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [mappingLoading, setMappingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Mapping form state
  const [selectedCHA, setSelectedCHA] = useState<string>('');
  const [selectedCHP, setSelectedCHP] = useState<string>('');
  const [selectedCommunityUnit, setSelectedCommunityUnit] = useState<string>('');
  
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [chpsResponse, chasResponse, communityUnitsResponse] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERS.CHPS}`, {
          headers: { 'accept': '*/*' }
        }),
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERS.CHAS}`, {
          headers: { 'accept': '*/*' }
        }),
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.COMMUNITY_UNIT}`, {
          headers: { 'accept': '*/*' }
        })
      ]);

      if (!chpsResponse.ok || !chasResponse.ok || !communityUnitsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [chpsData, chasData, communityUnitsData] = await Promise.all([
        chpsResponse.json(),
        chasResponse.json(),
        communityUnitsResponse.json()
      ]);

      setCHPs(chpsData || []);
      setCHAs(chasData || []);
      setCommunityUnits(communityUnitsData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMapCHAToCHP = async () => {
    if (!selectedCHA || !selectedCHP || !selectedCommunityUnit) {
      toast({
        title: "Validation Error",
        description: "Please select CHA, CHP, and Community Unit",
        variant: "destructive"
      });
      return;
    }

    try {
      setMappingLoading(true);
      
      const mappingData: MappingRequest = {
        chaId: parseInt(selectedCHA),
        chpId: parseInt(selectedCHP),
        communityUnitId: parseInt(selectedCommunityUnit)
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERS.MAP_CHA_CHP}`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mappingData)
      });

      if (!response.ok) {
        throw new Error('Failed to create mapping');
      }

      toast({
        title: "Success",
        description: "CHA-CHP mapping created successfully",
        variant: "default"
      });

      // Reset form and close dialog
      setSelectedCHA('');
      setSelectedCHP('');
      setSelectedCommunityUnit('');
      setIsDialogOpen(false);
      
      // Refresh data
      await fetchAllData();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create mapping",
        variant: "destructive"
      });
    } finally {
      setMappingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading user management data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error loading data: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User & Community Management</h1>
          <p className="text-muted-foreground">
            Manage CHA, CHP relationships and Community Unit assignments
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Create New Mapping
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Map CHA to CHP</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select CHA</label>
                <Select value={selectedCHA} onValueChange={setSelectedCHA}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a CHA" />
                  </SelectTrigger>
                  <SelectContent>
                    {chas.map((cha) => (
                      <SelectItem key={cha.id} value={cha.id.toString()}>
                        {cha.username} ({cha.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select CHP</label>
                <Select value={selectedCHP} onValueChange={setSelectedCHP}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a CHP" />
                  </SelectTrigger>
                  <SelectContent>
                    {chps.map((chp) => (
                      <SelectItem key={chp.id} value={chp.id.toString()}>
                        {chp.username} ({chp.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select Community Unit</label>
                <Select value={selectedCommunityUnit} onValueChange={setSelectedCommunityUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a Community Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {communityUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id.toString()}>
                        {unit.communityUnitName} - {unit.wardName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleMapCHAToCHP} 
                disabled={mappingLoading || !selectedCHA || !selectedCHP || !selectedCommunityUnit}
                className="w-full"
              >
                {mappingLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Creating Mapping...
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4 mr-2" />
                    Create Mapping
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total CHAs</p>
                <p className="text-2xl font-bold">{chas.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total CHPs</p>
                <p className="text-2xl font-bold">{chps.length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Community Units</p>
                <p className="text-2xl font-bold">{communityUnits.length}</p>
              </div>
              <Building className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="community-units" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="community-units">Community Units</TabsTrigger>
          <TabsTrigger value="chas">CHAs</TabsTrigger>
          <TabsTrigger value="chps">CHPs</TabsTrigger>
        </TabsList>

        <TabsContent value="community-units">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Community Units ({communityUnits.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Community Unit</TableHead>
                    <TableHead>CHA Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>CHPs Count</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communityUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium">{unit.id}</TableCell>
                      <TableCell className="font-medium">{unit.communityUnitName}</TableCell>
                      <TableCell>{unit.chaName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3" />
                          {unit.wardName}, {unit.countyName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {unit.totalCHPsCounted}/{unit.totalChps}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={unit.stockLevel > 10 ? "default" : "destructive"}>
                          {unit.stockLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(unit.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Community Health Assistants ({chas.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chas.map((cha) => (
                    <TableRow key={cha.id}>
                      <TableCell className="font-medium">{cha.id}</TableCell>
                      <TableCell className="font-medium">{cha.username}</TableCell>
                      <TableCell>{cha.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {cha.role || 'CHA'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chps">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Community Health Providers ({chps.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chps.map((chp) => (
                    <TableRow key={chp.id}>
                      <TableCell className="font-medium">{chp.id}</TableCell>
                      <TableCell className="font-medium">{chp.username}</TableCell>
                      <TableCell>{chp.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {chp.role || 'CHP'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};