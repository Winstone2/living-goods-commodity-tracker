
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
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
  }, [toast]);

  const filteredCommodities = commodities.filter(commodity =>
    commodity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (commodity.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedCommodities = filteredCommodities.reduce((acc, commodity) => {
    const categoryName = commodity.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(commodity);
    return acc;
  }, {} as Record<string, Commodity[]>);

  const handleCommodityToggle = (commodityId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedCommodities, commodityId]
      : selectedCommodities.filter(id => id !== commodityId);
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allCommodityIds = commodities.map(c => c.id.toString());
    onSelectionChange(allCommodityIds);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  if (loading) {
    return <div>Loading commodities...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Commodities</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search commodities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSelectAll} variant="outline" size="sm">
              Select All
            </Button>
            <Button onClick={handleClearAll} variant="outline" size="sm">
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedCommodities).map(([categoryName, commoditiesInCategory]) => (
            <div key={categoryName}>
              <h3 className="text-lg font-semibold text-primary mb-3">{categoryName}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {commoditiesInCategory.map((commodity) => (
                  <div key={commodity.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={commodity.id.toString()}
                      checked={selectedCommodities.includes(commodity.id.toString())}
                      onCheckedChange={(checked) => 
                        handleCommodityToggle(commodity.id.toString(), checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={commodity.id.toString()}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      <div>
                        <div className="font-medium">{commodity.name}</div>
                        <div className="text-xs text-gray-500">{commodity.unitOfMeasure}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {selectedCommodities.length > 0 && (
          <div className="mt-6 p-4 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium">
              Selected: {selectedCommodities.length} commodit{selectedCommodities.length === 1 ? 'y' : 'ies'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
