import React, { useState, useEffect } from 'react';
import { CommoditySelector } from '@/components/CommoditySelector';
import { CommunityUnitForm as CommunityUnitFormComponent } from '@/components/CommunityUnitForm'; // Renamed import
import { API_CONFIG } from '@/api/config/api.config';
import { useToast } from '@/hooks/use-toast';
import { CommunityUnitResponse } from '@/types/community-unit';
import { CommodityDetailsForm } from '@/components/CommodityDetailsForm';

interface CommunityUnitFormData {
  chaName: string;
  communityUnitName: string;
  totalChps: number;
  countyId: number;
  subCountyId: number;
  wardId: number;
  linkFacilityId: number;
}

// Add constants for localStorage keys
const STORAGE_KEYS = {
  COMMUNITY_UNIT_ID: 'livingGoods_communityUnitId',
  SELECTED_COMMODITIES: 'livingGoods_selectedCommodities'
} as const;

export const CommunityUnitFormPage: React.FC = () => {
  // Initialize state from localStorage
  const [communityUnitId, setCommunityUnitId] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.COMMUNITY_UNIT_ID);
    return stored ? Number(stored) : null;
  });

  const [selectedCommodities, setSelectedCommodities] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_COMMODITIES);
    return stored ? JSON.parse(stored) : [];
  });

  const { toast } = useToast();

  // Save to localStorage when values change
  useEffect(() => {
    if (communityUnitId) {
      localStorage.setItem(STORAGE_KEYS.COMMUNITY_UNIT_ID, String(communityUnitId));
    } else {
      localStorage.removeItem(STORAGE_KEYS.COMMUNITY_UNIT_ID);
    }
  }, [communityUnitId]);

  useEffect(() => {
    if (selectedCommodities.length > 0) {
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_COMMODITIES, 
        JSON.stringify(selectedCommodities)
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_COMMODITIES);
    }
  }, [selectedCommodities]);

  // Modified handleCommodityUnitCreate
  const handleCommunityUnitCreate = async (data: CommunityUnitFormData) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/community-units`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to create community unit');
      }

      const result = await response.json();
      console.log('Community Unit Creation Response:', result);

      if (result.success && result.data?.id) {
        const newId = Number(result.data.id);
        console.log('Setting Community Unit ID:', newId);
        setCommunityUnitId(newId);
        // Clear any previously selected commodities
        setSelectedCommodities([]);
        localStorage.removeItem(STORAGE_KEYS.SELECTED_COMMODITIES);
        
        toast({
          title: "Success",
          description: "Community unit created successfully"
        });
      } else {
        throw new Error('Invalid response format - missing ID');
      }
    } catch (error) {
      console.error('Community Unit Creation Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create community unit"
      });
    }
  };

  // Add a clear function for when you need to reset everything
  const handleReset = () => {
    setCommunityUnitId(null);
    setSelectedCommodities([]);
    localStorage.removeItem(STORAGE_KEYS.COMMUNITY_UNIT_ID);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_COMMODITIES);
  };

  return (
    <div className="space-y-8">
      {!communityUnitId && (
        <CommunityUnitFormComponent onSubmit={handleCommunityUnitCreate} />
      )}

      {communityUnitId && communityUnitId > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-500">
              Community Unit ID: {communityUnitId}
            </div>
            <button
              onClick={handleReset}
              className="text-red-500 text-sm hover:text-red-700"
            >
              Reset Form
            </button>
          </div>
          {/* <CommoditySelector
            selectedCommodities={selectedCommodities}
            onSelectionChange={setSelectedCommodities}
            communityUnitId={communityUnitId}
          /> */}
        </div>
      )}
    </div>
  );
};