
import React, { useState } from 'react';
import { CommunityUnitForm } from '@/components/CommunityUnitForm';
import { CommoditySelector } from '@/components/CommoditySelector';
import { CommodityDetailsForm } from '@/components/CommodityDetailsForm';
import { useToast } from '@/hooks/use-toast';
import { CommunityUnit, CommodityRecord } from '@/types';

export const Inventory = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [communityUnit, setCommunityUnit] = useState<Partial<CommunityUnit> | null>(null);
  const [selectedCommodities, setSelectedCommodities] = useState<string[]>([]);

  const handleCommunityUnitSubmit = (data: Partial<CommunityUnit>) => {
    // Generate a temporary ID for the community unit
    const unitWithId = {
      ...data,
      id: `temp-${Date.now()}`,
      createdAt: new Date(),
      userId: 'current-user-id' // This would come from auth context
    };
    
    setCommunityUnit(unitWithId);
    setCurrentStep(2);
    
    toast({
      title: "Success",
      description: "Community unit information saved. Please select commodities.",
    });
  };

  const handleCommoditySelection = (commodities: string[]) => {
    setSelectedCommodities(commodities);
    if (commodities.length > 0) {
      setCurrentStep(3);
    }
  };

  const handleCommodityRecordsSubmit = (records: Partial<CommodityRecord>[]) => {
    // Here you would save to your backend/database
    console.log('Saving records:', { communityUnit, records });
    
    toast({
      title: "Success",
      description: "Inventory records saved successfully!",
    });

    // Reset form
    setCommunityUnit(null);
    setSelectedCommodities([]);
    setCurrentStep(1);
  };

  const resetForm = () => {
    setCommunityUnit(null);
    setSelectedCommodities([]);
    setCurrentStep(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        {currentStep > 1 && (
          <button
            onClick={resetForm}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Start Over
          </button>
        )}
      </div>

      {/* Progress indicator */}
      <div className="flex items-center space-x-4 mb-6">
        <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200'
          }`}>
            1
          </div>
          <span className="font-medium">Community Unit Info</span>
        </div>
        <div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'} rounded`}></div>
        <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200'
          }`}>
            2
          </div>
          <span className="font-medium">Select Commodities</span>
        </div>
        <div className={`w-8 h-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'} rounded`}></div>
        <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200'
          }`}>
            3
          </div>
          <span className="font-medium">Commodity Details</span>
        </div>
      </div>

      {/* Step 1: Community Unit Form */}
      {currentStep >= 1 && (
        <CommunityUnitForm onSubmit={handleCommunityUnitSubmit} />
      )}

      {/* Step 2: Commodity Selection */}
      {currentStep >= 2 && (
        <CommoditySelector
          onSelectionChange={handleCommoditySelection}
          selectedCommodities={selectedCommodities}
        />
      )}

      {/* Step 3: Commodity Details */}
      {currentStep >= 3 && communityUnit && (
        <CommodityDetailsForm
          selectedCommodities={selectedCommodities}
          communityUnitId={communityUnit.id!}
          onSubmit={handleCommodityRecordsSubmit}
        />
      )}
    </div>
  );
};
