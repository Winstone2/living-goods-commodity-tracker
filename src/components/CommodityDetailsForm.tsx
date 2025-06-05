
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CommodityRecord } from '@/types';
import { AVAILABLE_COMMODITIES } from './CommoditySelector';

interface CommodityDetailsFormProps {
  selectedCommodities: string[];
  communityUnitId: string;
  onSubmit: (records: Partial<CommodityRecord>[]) => void;
}

export const CommodityDetailsForm: React.FC<CommodityDetailsFormProps> = ({
  selectedCommodities,
  communityUnitId,
  onSubmit
}) => {
  const { toast } = useToast();
  const [commodityRecords, setCommodityRecords] = useState<Record<string, Partial<CommodityRecord>>>({});

  useEffect(() => {
    // Initialize records for selected commodities
    const initialRecords: Record<string, Partial<CommodityRecord>> = {};
    selectedCommodities.forEach(commodityId => {
      initialRecords[commodityId] = {
        commodityId,
        communityUnitId,
        quantityExpired: 0,
        quantityDamaged: 0,
        stockOnHand: 0,
        quantityIssued: 0,
        excessQuantityReturned: 0,
        quantityConsumed: 0,
        closingBalance: 0,
        recordDate: new Date(),
      };
    });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const records = Object.values(commodityRecords);
    const invalidRecords = records.filter(record => 
      record.stockOnHand === undefined || 
      record.quantityIssued === undefined || 
      record.quantityConsumed === undefined ||
      record.quantityExpired === undefined ||
      record.quantityDamaged === undefined ||
      record.excessQuantityReturned === undefined
    );

    if (invalidRecords.length > 0) {
      toast({
        title: "Error",
        description: "Please fill in all required commodity details fields.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(records);
  };

  if (selectedCommodities.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Please select commodities first to enter details.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commodity Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {selectedCommodities.map(commodityId => {
            const commodity = AVAILABLE_COMMODITIES.find(c => c.id === commodityId);
            const record = commodityRecords[commodityId] || {};

            return (
              <div key={commodityId} className="border rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold text-primary">{commodity?.name}</h3>
                
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
