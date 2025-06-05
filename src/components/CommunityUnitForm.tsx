
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CommunityUnit } from '@/types';

interface CommunityUnitFormProps {
  onSubmit: (data: Partial<CommunityUnit>) => void;
  initialData?: Partial<CommunityUnit>;
}

export const CommunityUnitForm: React.FC<CommunityUnitFormProps> = ({ onSubmit, initialData }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    county: initialData?.county || '',
    subCounty: initialData?.subCounty || '',
    ward: initialData?.ward || '',
    linkFacility: initialData?.linkFacility || '',
    communityUnitName: initialData?.communityUnitName || '',
    chaName: initialData?.chaName || '',
    totalCHPs: initialData?.totalCHPs || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.county || !formData.subCounty || !formData.ward || 
        !formData.linkFacility || !formData.communityUnitName || 
        !formData.chaName || formData.totalCHPs <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all community unit information fields.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
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
              <Input
                id="county"
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                placeholder="Enter county"
                required
              />
            </div>
            <div>
              <Label htmlFor="subCounty">Sub-County *</Label>
              <Input
                id="subCounty"
                value={formData.subCounty}
                onChange={(e) => setFormData({ ...formData, subCounty: e.target.value })}
                placeholder="Enter sub-county"
                required
              />
            </div>
            <div>
              <Label htmlFor="ward">Ward *</Label>
              <Input
                id="ward"
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                placeholder="Enter ward"
                required
              />
            </div>
            <div>
              <Label htmlFor="linkFacility">Link Facility *</Label>
              <Input
                id="linkFacility"
                value={formData.linkFacility}
                onChange={(e) => setFormData({ ...formData, linkFacility: e.target.value })}
                placeholder="Enter link facility"
                required
              />
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
                value={formData.totalCHPs}
                onChange={(e) => setFormData({ ...formData, totalCHPs: parseInt(e.target.value) || 0 })}
                placeholder="Enter total CHPs"
                min="1"
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
