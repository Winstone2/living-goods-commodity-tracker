import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CommodityRecord, CommodityRecordPartial } from '@/types/commodity-record';import { Commodity } from '@/types/commodity';
import { API_CONFIG } from '@/api/config/api.config';

const STORAGE_KEYS = {
  COMMUNITY_UNIT_ID: 'livingGoods_communityUnitId',
  SELECTED_COMMODITIES: 'livingGoods_selectedCommodities'
} as const;

interface CommodityDetailsFormProps {
  selectedCommodities: string[];
  communityUnitId: number;
  onSubmit: (records: CommodityRecord[]) => void;
}

export const CommodityDetailsForm: React.FC<CommodityDetailsFormProps> = ({
  selectedCommodities,
  communityUnitId: propsCommunityUnitId,
  onSubmit
}) => {
  const { toast } = useToast();
  
  // Get and validate community unit ID from localStorage or props
  const communityUnitId = useMemo(() => {
    // First try to get from props
    if (propsCommunityUnitId && propsCommunityUnitId > 0) {
      console.log('Using community unit ID from props:', propsCommunityUnitId);
      return propsCommunityUnitId;
    }

    // Then try localStorage
    const storedId = localStorage.getItem(STORAGE_KEYS.COMMUNITY_UNIT_ID);
    const parsedId = storedId ? Number(storedId) : null;
    
    console.log('Community Unit ID Check:', {
      fromProps: propsCommunityUnitId,
      fromStorage: storedId,
      parsedId,
      isValid: parsedId && parsedId > 0
    });

    return parsedId;
  }, [propsCommunityUnitId]);

  // Add validation effect
  useEffect(() => {
    if (!communityUnitId || communityUnitId <= 0) {
      console.warn('Invalid Community Unit ID:', {
        id: communityUnitId,
        source: propsCommunityUnitId ? 'props' : 'localStorage'
      });
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please create or select a community unit first"
      });
    }
  }, [communityUnitId, propsCommunityUnitId, toast]);

  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [commodityRecords, setCommodityRecords] = useState<Record<string, CommodityRecordPartial>>({});
  const [loading, setLoading] = useState(true);

  // Fetch commodities data
  useEffect(() => {
    const fetchCommodities = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.COMMODITIES.LIST}`, {
          headers: {
            'Accept': '*/*'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch commodities');
        }

        const result = await response.json();
        if (result.success) {
          setCommodities(result.data);
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load commodities"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCommodities();
  }, []);

  // Modified initialization effect with debugging
  useEffect(() => {
    console.log('Initializing Records:', {
      selectedCommodities,
      communityUnitId,
      timestamp: new Date().toISOString()
    });

    const initialRecords: Record<string, Partial<CommodityRecord>> = {};
    selectedCommodities.forEach(commodityId => {
      initialRecords[commodityId] = {
        commodityId: Number(commodityId),
        communityUnitId: Number(communityUnitId),
        quantityExpired: 0,
        quantityDamaged: 0,
        stockOnHand: 0,
        quantityIssued: 0,
        excessQuantityReturned: 0,
        quantityConsumed: 0,
        closingBalance: 0,
        consumptionPeriod: 1
      };
    });

    console.log('Initialized Records:', initialRecords);
    setCommodityRecords(initialRecords);
  }, [selectedCommodities, communityUnitId]);

  const updateRecord = (commodityId: string, field: string, value: any) => {
    setCommodityRecords(prev => {
      const updated = {
        ...prev,
        [commodityId]: {
          ...prev[commodityId],
          [field]: value,
        }
      };

      // Auto-calculate closing balance
      const record = updated[commodityId];
      if (field !== 'closingBalance') {
        const closingBalance = 
          (record.stockOnHand || 0) + 
          (record.quantityIssued || 0) - 
          ((record.quantityConsumed || 0) + 
           (record.quantityExpired || 0) + 
           (record.quantityDamaged || 0));
        
        updated[commodityId].closingBalance = closingBalance;
      }

      // Auto-calculate consumption period if both dates are provided
      if (record.lastRestockDate && record.stockOutDate) {
        const diffTime = new Date(record.stockOutDate).getTime() - new Date(record.lastRestockDate).getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        updated[commodityId].consumptionPeriod = diffDays;
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!communityUnitId || communityUnitId <= 0) {
        throw new Error('Valid Community Unit ID is required');
      }

      console.log('Submitting with Community Unit ID:', {
        id: communityUnitId,
        source: propsCommunityUnitId ? 'props' : 'localStorage'
      });

      // Add pre-submission validation logging
      console.log('Pre-submission Check:', {
        communityUnitId,
        recordsCount: Object.keys(commodityRecords).length,
        records: commodityRecords
      });

      const records = Object.values(commodityRecords).map(record => {
        const formattedRecord = {
          communityUnitId: Number(communityUnitId),
          commodityId: Number(record.commodityId),
          quantityExpired: Number(record.quantityExpired) || 0,
          quantityDamaged: Number(record.quantityDamaged) || 0,
          stockOnHand: Number(record.stockOnHand) || 0,
          quantityIssued: Number(record.quantityIssued) || 0,
          excessQuantityReturned: Number(record.excessQuantityReturned) || 0,
          quantityConsumed: Number(record.quantityConsumed) || 0,
          closingBalance: Number(record.closingBalance) || 0,
          consumptionPeriod: Number(record.consumptionPeriod) || 1
        };

        console.log('Formatted Record:', formattedRecord);
        return formattedRecord;
      });

      // Submit each record with logging
      const promises = records.map(async (recordData) => {
        console.log('Submitting Record:', {
          url: `${API_CONFIG.BASE_URL}/records`,
          method: 'POST',
          data: recordData
        });

        const response = await fetch(`${API_CONFIG.BASE_URL}/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
          },
          body: JSON.stringify(recordData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Record Submission Failed:', {
            status: response.status,
            errorData,
            record: recordData
          });
          throw new Error(errorData.message || 'Failed to save record');
        }

        return response.json();
      });

      const results = await Promise.all(promises);
      console.log('All Records Submitted:', results);
      onSubmit(records);

    } catch (error) {
      console.error('Submission Error:', {
        error,
        communityUnitId,
        source: propsCommunityUnitId ? 'props' : 'localStorage'
      });
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save records"
      });
    }
  };

  if (loading) {
    return <div>Loading commodities...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commodity Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {selectedCommodities.map(commodityId => {
            const commodity = commodities.find(c => c.id.toString() === commodityId);
            const record = commodityRecords[commodityId] || {};

            if (!commodity) return null;

            return (
              <div key={commodityId} className="border rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold text-primary">
                  {commodity.name}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({commodity.unitOfMeasure})
                  </span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`${commodityId}-expired`}>Quantity Expired *</Label>
                    <Input
                      id={`${commodityId}-expired`}
                      type="number"
                      min="0"
                      value={record.quantityExpired || ''}
                      onChange={(e) => updateRecord(commodityId, 'quantityExpired', parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`${commodityId}-damaged`}>Quantity Damaged *</Label>
                    <Input
                      id={`${commodityId}-damaged`}
                      type="number"
                      min="0"
                      value={record.quantityDamaged || ''}
                      onChange={(e) => updateRecord(commodityId, 'quantityDamaged', parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`${commodityId}-stockOnHand`}>Stock on Hand *</Label>
                    <Input
                      id={`${commodityId}-stockOnHand`}
                      type="number"
                      min="0"
                      value={record.stockOnHand || ''}
                      onChange={(e) => updateRecord(commodityId, 'stockOnHand', parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`${commodityId}-issued`}>Quantity Issued *</Label>
                    <Input
                      id={`${commodityId}-issued`}
                      type="number"
                      min="0"
                      value={record.quantityIssued || ''}
                      onChange={(e) => updateRecord(commodityId, 'quantityIssued', parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`${commodityId}-returned`}>Excess Qty Returned *</Label>
                    <Input
                      id={`${commodityId}-returned`}
                      type="number"
                      min="0"
                      value={record.excessQuantityReturned || ''}
                      onChange={(e) => updateRecord(commodityId, 'excessQuantityReturned', parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`${commodityId}-consumed`}>Quantity Consumed *</Label>
                    <Input
                      id={`${commodityId}-consumed`}
                      type="number"
                      min="0"
                      value={record.quantityConsumed || ''}
                      onChange={(e) => updateRecord(commodityId, 'quantityConsumed', parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`${commodityId}-closing`}>Closing Balance (Auto-calculated)</Label>
                    <Input
                      id={`${commodityId}-closing`}
                      type="number"
                      value={record.closingBalance || 0}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`${commodityId}-restock`}>Last Restock Date</Label>
                    <Input
                      id={`${commodityId}-restock`}
                      type="date"
                      value={record.lastRestockDate ? new Date(record.lastRestockDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => updateRecord(commodityId, 'lastRestockDate', e.target.value ? new Date(e.target.value) : null)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`${commodityId}-stockout`}>Stock-out Date</Label>
                    <Input
                      id={`${commodityId}-stockout`}
                      type="date"
                      value={record.stockOutDate ? new Date(record.stockOutDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => updateRecord(commodityId, 'stockOutDate', e.target.value ? new Date(e.target.value) : null)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`${commodityId}-period`}>Consumption Period (Days)</Label>
                    <Input
                      id={`${commodityId}-period`}
                      type="number"
                      value={record.consumptionPeriod || ''}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            );
          })}
          
          <Button type="submit" className="w-full" size="lg">
            Save Commodity Records
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
