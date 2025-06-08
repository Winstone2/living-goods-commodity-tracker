import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Commodity } from '@/types/commodity';
import { API_CONFIG } from '@/api/config/api.config';

interface CommoditySelectorProps {
  onSelectionChange: (selectedCommodities: string[]) => void;
  selectedCommodities: string[];
}

export const CommoditySelector: React.FC<CommoditySelectorProps> = ({ 
  onSelectionChange, 
  selectedCommodities 
}) => {
  const { toast } = useToast();
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleCommodityToggle = (commodityId: string) => {
    const newSelection = selectedCommodities.includes(commodityId)
      ? selectedCommodities.filter(id => id !== commodityId)
      : [...selectedCommodities, commodityId];
    
    onSelectionChange(newSelection);
  };

  const groupedCommodities = commodities.reduce((acc, commodity) => {
    if (!acc[commodity.categoryName]) {
      acc[commodity.categoryName] = [];
    }
    acc[commodity.categoryName].push(commodity);
    return acc;
  }, {} as Record<string, Commodity[]>);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div>Loading commodities...</div>
        </CardContent>
      </Card>
    );
  }

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
                    id={commodity.id.toString()}
                    checked={selectedCommodities.includes(commodity.id.toString())}
                    onCheckedChange={() => handleCommodityToggle(commodity.id.toString())}
                  />
                  <Label 
                    htmlFor={commodity.id.toString()}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <div>
                      <div>{commodity.name}</div>
                      <div className="text-xs text-gray-500">{commodity.description}</div>
                    </div>
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
