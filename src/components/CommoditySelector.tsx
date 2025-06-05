
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Commodity } from '@/types';

interface CommoditySelectorProps {
  onSelectionChange: (selectedCommodities: string[]) => void;
  selectedCommodities: string[];
}

const AVAILABLE_COMMODITIES: Commodity[] = [
  { id: '1', name: 'MRDT', category: 'Diagnostic' },
  { id: '2', name: 'AL 6s', category: 'Treatment' },
  { id: '3', name: 'AL 12s', category: 'Treatment' },
  { id: '4', name: 'AL 18s', category: 'Treatment' },
  { id: '5', name: 'AL 24s', category: 'Treatment' },
  { id: '6', name: 'ORS/ZINC Combo', category: 'Treatment' },
  { id: '7', name: 'ORS Sachets', category: 'Treatment' },
  { id: '8', name: 'Zinc Tablets', category: 'Treatment' },
  { id: '9', name: 'PCM SYRUP', category: 'Treatment' },
  { id: '10', name: 'PCM Tablets', category: 'Treatment' },
  { id: '11', name: 'Deworming Tablets', category: 'Prevention' },
  { id: '12', name: 'Vitamin A Supplements', category: 'Prevention' },
  { id: '13', name: 'Deworming Syrup', category: 'Prevention' },
];

export const CommoditySelector: React.FC<CommoditySelectorProps> = ({ 
  onSelectionChange, 
  selectedCommodities 
}) => {
  const handleCommodityToggle = (commodityId: string) => {
    const newSelection = selectedCommodities.includes(commodityId)
      ? selectedCommodities.filter(id => id !== commodityId)
      : [...selectedCommodities, commodityId];
    
    onSelectionChange(newSelection);
  };

  const groupedCommodities = AVAILABLE_COMMODITIES.reduce((acc, commodity) => {
    if (!acc[commodity.category]) {
      acc[commodity.category] = [];
    }
    acc[commodity.category].push(commodity);
    return acc;
  }, {} as Record<string, Commodity[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Commodities</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.entries(groupedCommodities).map(([category, commodities]) => (
          <div key={category} className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-primary">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {commodities.map((commodity) => (
                <div key={commodity.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={commodity.id}
                    checked={selectedCommodities.includes(commodity.id)}
                    onCheckedChange={() => handleCommodityToggle(commodity.id)}
                  />
                  <Label 
                    htmlFor={commodity.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {commodity.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export { AVAILABLE_COMMODITIES };
