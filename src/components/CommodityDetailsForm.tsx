import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CommodityRecord, CommodityRecordPartial } from '@/types/commodity-record';
import { Commodity } from '@/types/commodity';
import { API_CONFIG } from '@/api/config/api.config';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

 const handleClick = async () => {
  try {
    // Validate required fields
    for (const record of records) {
      const requiredFields = [
        'lastRestockDate',
        'earliestExpiryDate'
      ];

      for (const field of requiredFields) {
        if (
          record[field] === undefined ||
          record[field] === null ||
          record[field] === ''
        ) {
          alert(`Please fill all required fields before submitting. Missing: ${field}`);
          return;
        }
      }
    }

    // Submit records
    const promises = records.map(async (recordData) => {
      const response = await fetch(`${API_CONFIG.BASE_URL}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        body: JSON.stringify(recordData)
      });
    window.location.href = '/community-units';

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save record');
      }
      window.location.href = '/community-units';


      return response.json();
    });
    window.location.href = '/community-units';


    await Promise.all(promises);

    window.location.href = '/community-units';

  } catch (error) {
        window.location.href = '/community-units';

    // console.error('Error submitting records:', error.message);
    // alert('An error occurred while submitting. Please try again.');
  }
};



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
  }, [toast]);

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
        consumptionPeriod: 1,
        earliestExpiryDate: null,
        quantityToOrder: 0,
        lastRestockDate: null,
        stockOutDate: null,
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

      const record = updated[commodityId];

      // Calculate closing balance
      if (field !== 'closingBalance') {
        const closingBalance =
          (record.stockOnHand || 0) +
          (record.quantityIssued || 0) -
          ((record.quantityConsumed || 0) +
            (record.quantityExpired || 0) +
            (record.quantityDamaged || 0) +
            (record.excessQuantityReturned || 0));

        updated[commodityId].closingBalance = Math.max(closingBalance, 0);
      }

      // Calculate consumption period in days
      if (record.lastRestockDate && record.stockOutDate) {
        const restockDate = new Date(record.lastRestockDate);
        const stockOutDate = new Date(record.stockOutDate);
        const diffTime = Math.abs(stockOutDate.getTime() - restockDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        updated[commodityId].consumptionPeriod = diffDays;
      } else {
        updated[commodityId].consumptionPeriod = 0;
      }

      // Calculate quantity to order
      const monthsInStock = 1.5; // 1 month + 2 weeks buffer
      const averageMonthlyConsumption = record.quantityConsumed || 0;
      const quantityToOrder = Math.max(
        Math.ceil((averageMonthlyConsumption * monthsInStock) - (updated[commodityId].closingBalance || 0)),
        0
      );

      updated[commodityId].quantityToOrder = quantityToOrder;

      // Ensure earliest expiry date is set
      if (!record.earliestExpiryDate) {
        updated[commodityId].earliestExpiryDate = new Date().toISOString();
      }

      return updated;
    });
  };

  const validateRecord = (record: any) => {
    // Validate dates
    const now = new Date();

    if (record.earliestExpiryDate) {
      const expiryDate = new Date(record.earliestExpiryDate);
      if (expiryDate < now) {
        throw new Error('Expiry date cannot be in the past');
      }
    }

    if (record.lastRestockDate) {
      const restockDate = new Date(record.lastRestockDate);
      if (restockDate > now) {
        throw new Error('Restock date cannot be in the future');
      }
    }

    if (record.stockOutDate) {
      const stockOutDate = new Date(record.stockOutDate);
      if (stockOutDate > now) {
        throw new Error('Stock out date cannot be in the future');
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!communityUnitId || communityUnitId <= 0) {
        throw new Error('Valid Community Unit ID is required');
      }

      const records = Object.values(commodityRecords).map(record => {
        // Calculate the quantity to order
        const monthsInStock = 1.5;
        const averageMonthlyConsumption = Number(record.quantityConsumed) || 0;
        const quantityToOrder = Math.max(
          Math.ceil((averageMonthlyConsumption * monthsInStock) - (Number(record.closingBalance) || 0)),
          0
        );

        // Format the expiry date - ensure it's an ISO string with time
        const expiryDate = record.earliestExpiryDate
          ? new Date(record.earliestExpiryDate).toISOString()
          : new Date().toISOString();

        const stockOutDate = record.stockOutDate
          ? new Date(record.stockOutDate).toISOString()
          : null;

        // Get user from localStorage
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
          throw new Error('User not found. Please login again.');
        }

        const user = JSON.parse(savedUser);
        if (!user.id) {
          throw new Error('Invalid user data');
        }

        // Return exact API format
        return {
          communityUnitId: Number(communityUnitId),
          commodityId: Number(record.commodityId),
          quantityExpired: Number(record.quantityExpired) || 0,
          quantityDamaged: Number(record.quantityDamaged) || 0,
          stockOnHand: Number(record.stockOnHand) || 0,
          quantityIssued: Number(record.quantityIssued) || 0,
          excessQuantityReturned: Number(record.excessQuantityReturned) || 0,
          quantityConsumed: Number(record.quantityConsumed) || 0,
          closingBalance: Number(record.closingBalance) || 0,
          consumptionPeriod: Number(record.consumptionPeriod) || 1,
          earliestExpiryDate: expiryDate,
          quantityToOrder: quantityToOrder,
          stockOutDate: stockOutDate,
          lastRestockDate: record.lastRestockDate,
          createdBy: Number(user.id) // Add user ID from localStorage
        };
      });

      // Log the exact request body for verification
      console.log('Submitting Records:', JSON.stringify(records, null, 2));

      const promises = records.map(async (recordData) => {
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
          throw new Error(errorData.message || 'Failed to save record');
        }

        return response.json();
      });

      const results = await Promise.all(promises);
      onSubmit(records);

    } catch (error) {
      console.error('Submission Error:', error);
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
                      placeholder="0"
                      value={record.quantityExpired ?? ''}
                      onChange={(e) =>
                        updateRecord(
                          commodityId,
                          'quantityExpired',
                          e.target.value === '' ? null : parseInt(e.target.value)
                        )
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`${commodityId}-damaged`}>Quantity Damaged *</Label>
                    <Input
                      id={`${commodityId}-damaged`}
                      type="number"
                      min="0"
                      placeholder="0"
                      value={record.quantityDamaged ?? ''}
                      onChange={(e) =>
                        updateRecord(
                          commodityId,
                          'quantityDamaged',
                          e.target.value === '' ? null : parseInt(e.target.value)
                        )
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`${commodityId}-stockOnHand`}>Stock on Hand *</Label>
                    <Input
                      id={`${commodityId}-stockOnHand`}
                      type="number"
                      min="0"
                      placeholder="0"
                      value={record.stockOnHand ?? ''}
                      onChange={(e) =>
                        updateRecord(
                          commodityId,
                          'stockOnHand',
                          e.target.value === '' ? null : parseInt(e.target.value)
                        )
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`${commodityId}-issued`}>Quantity Issued *</Label>
                    <Input
                      id={`${commodityId}-issued`}
                      type="number"
                      min="0"
                      placeholder="0"
                      value={record.quantityIssued ?? ''}
                      onChange={(e) =>
                        updateRecord(
                          commodityId,
                          'quantityIssued',
                          e.target.value === '' ? null : parseInt(e.target.value)
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${commodityId}-returned`}>Excess Qty Returned *</Label>
                    <Input
                      id={`${commodityId}-returned`}
                      type="number"
                      min="0"
                      placeholder="0"
                      value={record.excessQuantityReturned ?? ''}
                      onChange={(e) =>
                        updateRecord(
                          commodityId,
                          'excessQuantityReturned',
                          e.target.value === '' ? null : parseInt(e.target.value)
                        )
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`${commodityId}-consumed`}>Quantity Consumed *</Label>
                    <Input
                      id={`${commodityId}-consumed`}
                      type="number"
                      min="0"
                      placeholder="0"
                      value={record.quantityConsumed ?? ''}
                      onChange={(e) =>
                        updateRecord(
                          commodityId,
                          'quantityConsumed',
                          e.target.value === '' ? null : parseInt(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor={`${commodityId}-closing`}>Closing Balance (Auto-calculated)</Label>
                    <Input
                      id={`${commodityId}-closing`}
                      type="number"
                      value={record.closingBalance ?? 0}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`${commodityId}-toOrder`}>Quantity to Order (Auto-calculated)</Label>
                    <Input
                      id={`${commodityId}-toOrder`}
                      type="number"
                      value={record.quantityToOrder ?? 0}
                      readOnly
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Based on 1.5 months stock level (4 weeks + 2 weeks buffer)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor={`${commodityId}-expiry`}>Earliest Expiry Date *</Label>
                    <Input
                      id={`${commodityId}-expiry`}
                      type="date"
                      required
                      value={
                        record.earliestExpiryDate
                          ? new Date(record.earliestExpiryDate).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        updateRecord(
                          commodityId,
                          'earliestExpiryDate',
                          e.target.value ? new Date(e.target.value) : null
                        )
                      }
                      min={new Date().toISOString().split('T')[0]} // Cannot be earlier than today
                    />
                  </div>
                  {/* <div>
                    <Label htmlFor={`${commodityId}-restock`}>Last Restock Date *</Label>
                    <Input
                      id={`${commodityId}-restock`}
                      type="date"
                      required
                      value={
                        record.lastRestockDate
                          ? new Date(record.lastRestockDate).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        updateRecord(
                          commodityId,
                          'lastRestockDate',
                          e.target.value ? new Date(e.target.value) : null
                        )
                      }
                      min="2020-01-01"

                    />
                  </div> */}
                  {/* Last Restock Date */}
                  <div>
                    <Label htmlFor={`${commodityId}-restock`}>Last Restock Date *</Label>
                    <Input
                      id={`${commodityId}-restock`}
                      type="date"
                      required
                      value={
                        record.lastRestockDate
                          ? new Date(record.lastRestockDate).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) => {
                        const lastRestock = e.target.value ? new Date(e.target.value) : null;
                        const stockOut = record.stockOutDate ? new Date(record.stockOutDate) : null;

                        const period =
                          lastRestock && stockOut
                            ? Math.max(
                              0,
                              Math.ceil((stockOut - lastRestock) / (1000 * 60 * 60 * 24))
                            )
                            : null;

                        updateRecord(commodityId, 'lastRestockDate', lastRestock);
                        if (period !== null) {
                          updateRecord(commodityId, 'consumptionPeriod', period);
                        }
                      }}
                      min="2020-01-01"
                    />
                  </div>

                  {/* Stock-out Date */}
                  <div>
                    <Label htmlFor={`${commodityId}-stockout`}>Stock-out Date </Label>
                    <Input
                      id={`${commodityId}-stockout`}
                      type="date"
                      value={
                        record.stockOutDate
                          ? new Date(record.stockOutDate).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) => {
                        const stockOut = e.target.value ? new Date(e.target.value) : null;
                        const lastRestock = record.lastRestockDate ? new Date(record.lastRestockDate) : null;

                        const period =
                          lastRestock && stockOut
                            ? Math.max(
                              0,
                              Math.ceil((stockOut - lastRestock) / (1000 * 60 * 60 * 24))
                            )
                            : null;
                        updateRecord(commodityId, 'stockOutDate', stockOut);
                        if (period !== null) {
                          updateRecord(commodityId, 'consumptionPeriod', period);
                        }
                      }}
                      min="2020-01-01"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${commodityId}-period`}>Consumption Period (Days)</Label>
                    <Input
                      id={`${commodityId}-period`}
                      type="number"
                      readOnly
                      value={record.consumptionPeriod ?? ''}
                      className="bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            );
          })}
          <Button onClick={handleClick} className="w-full" size="lg">
            Save Commodity Records
          </Button>
        </form>
      </CardContent>

    </Card>
  );
};