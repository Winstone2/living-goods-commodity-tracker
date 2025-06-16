import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CommunityUnit } from '@/types';
import { Location, LocationDropdowns } from '@/types/location';
import { API_CONFIG } from '@/api/config/api.config';
import { useAuth } from '@/contexts/AuthContext'; // Add this import
import { AUTH_HEADER } from '@/api/config/auth-headers';

const STORAGE_KEYS = {
  COMMUNITY_UNIT_ID: 'livingGoods_communityUnitId',
  SELECTED_COMMODITIES: 'livingGoods_selectedCommodities'
} as const;

interface CommunityUnitFormProps {
  onSubmit: (data: Partial<CommunityUnit>) => void;
  initialData?: Partial<CommunityUnit>;
}

export const CommunityUnitForm: React.FC<CommunityUnitFormProps> = ({ onSubmit, initialData }) => {
  const { user } = useAuth(); // Add this hook
  const { toast } = useToast();
  const [dropdowns, setDropdowns] = useState<LocationDropdowns | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState({
    countyId: 0,
    subCountyId: 0,
    wardId: 0
  });
  const [formData, setFormData] = useState({
    county: initialData?.county || '',
    subCounty: initialData?.subCounty || '',
    ward: initialData?.ward || '',
    linkFacility: initialData?.linkFacility || '',
    communityUnitName: initialData?.communityUnitName || '',
    chaName: initialData?.chaName || '',
    totalCHPs: initialData?.totalCHPs || 0,
    totalCHPsCounted: initialData?.totalCHPsCounted || 0 // Add default value
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/locations/dropdowns`, {
          headers: {
            'Accept': '*/*'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }

        const data = await response.json();
        setDropdowns(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load location data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDropdowns();
  }, []);

  if (loading) {
    return <div>Loading location data...</div>;
  }

  // Filter functions for cascading dropdowns
  const filteredSubCounties = dropdowns?.subCounties.filter(
    subCounty => subCounty.parentId === selectedIds.countyId
  ) || [];

  const filteredWards = dropdowns?.wards.filter(
    ward => ward.parentId === selectedIds.subCountyId
  ) || [];

  const filteredFacilities = dropdowns?.facilities.filter(
    facility => facility.parentId === selectedIds.wardId
  ) || [];

  // Handle selection changes
  const handleCountyChange = (value: string) => {
    const county = dropdowns?.counties.find(c => c.name === value);
    setSelectedIds(prev => ({
      ...prev,
      countyId: county?.id || 0,
      subCountyId: 0 // Reset child selections
    }));
    setFormData(prev => ({
      ...prev,
      county: value,
      subCounty: '', // Reset child selections
      ward: '',
      linkFacility: ''
    }));
  };

  const handleSubCountyChange = (value: string) => {
    const subCounty = dropdowns?.subCounties.find(sc => sc.name === value);
    setSelectedIds(prev => ({
      ...prev,
      subCountyId: subCounty?.id || 0,
      wardId: 0 // Reset child selection
    }));
    setFormData(prev => ({
      ...prev,
      subCounty: value,
      ward: '', // Reset child selections
      linkFacility: ''
    }));
  };

  const handleWardChange = (value: string) => {
    const ward = dropdowns?.wards.find(w => w.name === value);
    setSelectedIds(prev => ({
      ...prev,
      wardId: ward?.id || 0
    }));
    setFormData(prev => ({
      ...prev,
      ward: value,
      linkFacility: '' // Reset facility selection
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get IDs from the selected names
      const county = dropdowns?.counties.find(c => c.name === formData.county);
      const subCounty = dropdowns?.subCounties.find(sc => sc.name === formData.subCounty);
      const ward = dropdowns?.wards.find(w => w.name === formData.ward);
      const facility = dropdowns?.facilities.find(f => f.name === formData.linkFacility);

      if (!county || !subCounty || !ward || !facility) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select all required locations"
        });
        return;
      }

      const communityUnitData = {
        chaName: formData.chaName,
        communityUnitName: formData.communityUnitName,
        totalChps: Number(formData.totalCHPs),
        totalCHPsCounted: Number(formData.totalCHPsCounted), // Add this line
        countyId: county.id,
        subCountyId: subCounty.id,
        wardId: ward.id,
        linkFacilityId: facility.id,
        createdBy: user?.id || null,
        createdAt: new Date().toISOString()
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.COMMUNITY_UNITS.CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': AUTH_HEADER  // Just change this line
        },
        body: JSON.stringify(communityUnitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create community unit');
      }

      const result = await response.json();
      
      if (result.success) {
        // Store the community unit ID in localStorage
        const communityUnitId = result.data.id;
        localStorage.setItem(STORAGE_KEYS.COMMUNITY_UNIT_ID, String(communityUnitId));
        
        console.log('Stored Community Unit ID:', {
          id: communityUnitId,
          timestamp: new Date().toISOString()
        });

        toast({
          title: "Success",
          description: "Community unit created successfully"
        });
        
        onSubmit(formData);
        return communityUnitId;
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      console.error('Community Unit Creation Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create community unit"
      });
      // Clear the stored ID if there's an error
      localStorage.removeItem(STORAGE_KEYS.COMMUNITY_UNIT_ID);
      throw error;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Unit Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="county">County *</Label>
              <Select
                value={formData.county}
                onValueChange={handleCountyChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {dropdowns?.counties.map((county) => (
                    <SelectItem key={county.id} value={county.name}>
                      {county.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subCounty">Sub-County *</Label>
              <Select
                value={formData.subCounty}
                onValueChange={handleSubCountyChange}
                disabled={!formData.county}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-county" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubCounties.map((subCounty) => (
                    <SelectItem key={subCounty.id} value={subCounty.name}>
                      {subCounty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ward">Ward *</Label>
              <Select
                value={formData.ward}
                onValueChange={handleWardChange}
                disabled={!formData.subCounty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  {filteredWards.map((ward) => (
                    <SelectItem key={ward.id} value={ward.name}>
                      {ward.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="linkFacility">Link Facility *</Label>
              <Select
                value={formData.linkFacility}
                onValueChange={(value) => setFormData(prev => ({ ...prev, linkFacility: value }))}
                disabled={!formData.ward}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {filteredFacilities.map((facility) => (
                    <SelectItem key={facility.id} value={facility.name}>
                      {facility.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="communityUnitName">Community Unit Name *</Label>
              <Input
                id="communityUnitName"
                value={formData.communityUnitName}
                onChange={(e) => setFormData({ ...formData, communityUnitName: e.target.value })}
                placeholder="Enter community unit name"
                required
              />
            </div>
            <div>
              <Label htmlFor="chaName">CHA Name *</Label>
              <Input
                id="chaName"
                value={formData.chaName}
                onChange={(e) => setFormData({ ...formData, chaName: e.target.value })}
                placeholder="Enter CHA name"
                required
              />
            </div>
            <div>
              <Label htmlFor="totalCHPs">Total CHPs *</Label>
              <Input
                id="totalCHPs"
                type="number"
                min="1"
                placeholder="0"
                value={formData.totalCHPs === 0 ? '' : formData.totalCHPs}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  totalCHPs: e.target.value === '' ? 0 : parseInt(e.target.value)
                })}
                required
              />
            </div>
            <div>
              <Label htmlFor="totalCHPsCounted">CHPs whose Commodities were Counted *</Label>
              <Input
                id="totalCHPsCounted"
                type="number"
                min="0"
                placeholder="0"
                value={formData.totalCHPsCounted === 0 ? '' : formData.totalCHPsCounted}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  totalCHPsCounted: e.target.value === '' ? 0 : parseInt(e.target.value)
                })}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Save Community Unit Information
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
