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
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_HEADER } from '@/api/config/auth-headers';

const STORAGE_KEYS = {
  COMMUNITY_UNIT_ID: 'livingGoods_communityUnitId',
  SELECTED_COMMODITIES: 'livingGoods_selectedCommodities'
} as const;

interface CommunityUnitFormProps {
  onSubmit: (data: Partial<CommunityUnit> & { chpId?: number }) => void;
  initialData?: Partial<CommunityUnit>;
}

export const CommunityUnitForm: React.FC<CommunityUnitFormProps> = ({ onSubmit, initialData }) => {
  const { user } = useAuth();
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
  });
  const [communityUnits, setCommunityUnits] = useState<CommunityUnit[]>([]);
  const [selectedCommunityUnitId, setSelectedCommunityUnitId] = useState<number | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [chps, setChps] = useState<{ id: number; Username: string; Email: string; chpUsername: string; chpEmail: string }[]>([]);
  const [selectedChpId, setSelectedChpId] = useState<number | null>(null);

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

    const fetchUnits = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.COMMUNITY_UNITS}`, {
          headers: {
            'Accept': '*/*',
            'Authorization': AUTH_HEADER
          }
        });
        const data = await response.json();
        setCommunityUnits(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        // Optionally handle error
      }
    };

    fetchDropdowns();
    // Only fetch community units for CHA users
    if (user?.role === 'CHA') {
      fetchUnits();
    }
  }, [user?.role]);

  const fetchChps = async (chaId: number) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/cha/${chaId}/chps`, {
        headers: {
          'Accept': '*/*',
          'Authorization': AUTH_HEADER,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CHPs: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ CHPs data received:", data);

      // Extract and map CHPs
      const mappedCHPs = data.chps.map((chp: any) => ({
        id: chp.chpId,
        Username: chp.chpUsername,
        Email: chp.chpEmail,
        chpUsername: chp.chpUsername,
        chpEmail: chp.chpEmail,
        stats: chp.stats,
        recordCount: chp.commodityRecords?.length ?? 0,
      }));

      setChps(mappedCHPs);

      toast({
        title: "Success",
        description: `Loaded ${mappedCHPs.length} CHPs`,
      });

    } catch (error) {
      console.error("❌ CHP fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to load CHPs. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch CHPs when user is CHA
  useEffect(() => {
    if (user?.role === 'CHA' && user.id) {
      fetchChps(user.id);
    }
  }, [user]);

  if (loading) {
    return <div>Loading location data...</div>;
  }

  // Filter functions for cascading dropdowns
  const filteredSubCounties = dropdowns?.subCounties.filter(
    subCounty => subCounty.parentIds?.includes(selectedIds.countyId)
  ) || [];

  const filteredWards = dropdowns?.wards.filter(
    ward => ward.parentIds?.includes(selectedIds.subCountyId)
  ) || [];

  const filteredFacilities = dropdowns?.facilities.filter(
    facility => Array.isArray(facility.parentIds) && facility.parentIds.includes(selectedIds.wardId)
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
        communityUnitName: formData.communityUnitName,
        countyId: county.id,
        subCountyId: subCounty.id,
        wardId: ward.id,
        linkFacilityId: facility.id,
        createdBy: user?.id || null,
        createdAt: new Date().toISOString()
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}/community-units`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': AUTH_HEADER
        },
        body: JSON.stringify(communityUnitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create community unit');
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Community unit created successfully"
        });
        setTimeout(() => {
        window.location.href = '/community-units';
      }, 10);

        // For ADMIN: Just show success, no further steps
        if (user?.role === 'ADMIN') {
          // Reset form
          setFormData({
            county: '',
            subCounty: '',
            ward: '',
            linkFacility: '',
            communityUnitName: '',
          });
          setSelectedIds({
            countyId: 0,
            subCountyId: 0,
            wardId: 0
          });
          
          return;
        }

        // For CHA: Continue to step 2
        if (user?.role === 'CHA') {
          const communityUnitId = result.data.id;
          localStorage.setItem(STORAGE_KEYS.COMMUNITY_UNIT_ID, String(communityUnitId));
          setStep(2);
        }
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
        {/* ADMIN: Only show CU creation form */}
        {user?.role === 'ADMIN' ? (
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
            </div>
            <Button type="submit" className="w-full">
              Create Community Unit
            </Button>
          </form>
        ) : (
          /* CHA: Show community unit selection and CHP management */
          <>
            <div className="mb-4">
              <Label htmlFor="communityUnitSelect">Select Community Unit</Label>
              <Select
                value={selectedCommunityUnitId ? selectedCommunityUnitId.toString() : ""}
                onValueChange={(value) => {
                  const cu = communityUnits.find(u => u.id.toString() === value);
                  setSelectedCommunityUnitId(cu?.id ?? null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Community Unit" />
                </SelectTrigger>
                <SelectContent>
                  {communityUnits.map(unit => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.communityUnitName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCommunityUnitId ? (
              <div className="p-4 mb-4 bg-muted/20 rounded border">
                {(() => {
                  const cu = communityUnits.find(u => u.id === selectedCommunityUnitId);
                  if (!cu) return null;
                  const county = dropdowns?.counties.find(c => c.id === cu.countyId)?.countyName || '-';
                  const subCounty = dropdowns?.subCounties.find(sc => sc.id === cu.subCountyId)?.name || '-';
                  const ward = dropdowns?.wards.find(w => w.id === cu.wardId)?.wardName || '-';
                  return (
                    <div>
                      <h2 className="text-lg font-semibold mb-2 text-primary">Selected Community Unit Details</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        <div>
                          <span className="font-medium">Community Unit Name:</span> {cu.communityUnitName}
                        </div>
                        <div>
                          <span className="font-medium">Sub-County:</span> {subCounty}
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="chpSelect">Select CHP *</Label>
                        <Select
                          value={selectedChpId ? selectedChpId.toString() : ""}
                          onValueChange={val => {
                            setSelectedChpId(Number(val));
                            localStorage.setItem('livingGoods_selectedChpId', val);
                            sessionStorage.setItem('livingGoods_selectedChpId', val);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select CHP" />
                          </SelectTrigger>
                          <SelectContent>
                            {chps
                              .filter(chp => chp && chp.id !== undefined && chp.chpUsername && chp.chpEmail)
                              .map(chp => (
                                <SelectItem key={chp.id} value={chp.id.toString()}>
                                  {chp.chpUsername} ({chp.chpEmail})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 mt-6">
                        <Button
                          type="button"
                          variant="default"
                          className="w-full sm:w-auto"
                          disabled={!selectedChpId}
                          onClick={() => {
                            localStorage.setItem(STORAGE_KEYS.COMMUNITY_UNIT_ID, String(cu.id));
                            toast({
                              title: "Success",
                              description: "Community unit and CHP selected and saved."
                            });
                            onSubmit({
                              ...cu,
                              chpId: selectedChpId
                            });
                          }}
                        >
                          Save Selection & Proceed
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => {
                            setSelectedCommunityUnitId(null);
                            setSelectedChpId(null);
                            localStorage.removeItem('livingGoods_selectedChpId');
                            sessionStorage.removeItem('livingGoods_selectedChpId');
                          }}
                        >
                          Clear Selection
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              step === 2 && (
                <div className="space-y-4">
                  <Label htmlFor="chpSelect">Select CHP *</Label>
                  <Select
                    value={selectedChpId ? selectedChpId.toString() : ""}
                    onValueChange={val => setSelectedChpId(Number(val))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select CHP" />
                    </SelectTrigger>
                    <SelectContent>
                      {chps
                        .filter(chp => chp && chp.id !== undefined && chp.chpUsername && chp.chpEmail)
                        .map(chp => (
                          <SelectItem key={chp.id} value={chp.id.toString()}>
                            {chp.chpUsername} ({chp.chpEmail})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    className="w-full"
                    disabled={!selectedChpId}
                    onClick={() => {
                      onSubmit({ ...formData, chpId: selectedChpId });
                    }}
                  >
                    Proceed to Commodity Record
                  </Button>
                </div>
              )
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};