
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Home, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();

  // Mock data - in real app this would come from API
  const stats = {
    totalSubCounties: 12,
    totalFacilities: 156,
    totalCommunityUnits: 89,
    totalWards: 234,
    monthlyConsumption: [
      { name: 'Kibera East', consumption: 250 },
      { name: 'Mathare North', consumption: 180 },
      { name: 'Mukuru', consumption: 320 },
    ],
    outOfStock: [
      { unit: 'Kibera East', commodities: ['AL 6s', 'ORS Sachets'] },
      { unit: 'Dandora', commodities: ['PCM Syrup'] },
    ]
  };

  const statCards = [
    {
      title: 'Sub-Counties',
      value: stats.totalSubCounties,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Facilities',
      value: stats.totalFacilities,
      icon: Home,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Community Units',
      value: stats.totalCommunityUnits,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Wards',
      value: stats.totalWards,
      icon: MapPin,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role === 'admin' ? 'Admin Dashboard' : 'Community Health Dashboard'}
        </h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Monthly Consumption & Out of Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Monthly Consumption by Community Unit</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.monthlyConsumption.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-lg font-bold text-primary">{item.consumption}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Units Out of Stock</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.outOfStock.map((item, index) => (
                <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="font-medium text-red-800 mb-2">{item.unit}</div>
                  <div className="flex flex-wrap gap-2">
                    {item.commodities.map((commodity, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full"
                      >
                        {commodity}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <TrendingUp className="w-6 h-6 mx-auto mb-2" />
              <span className="block font-medium">Add New Record</span>
            </button>
            <button className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Users className="w-6 h-6 mx-auto mb-2" />
              <span className="block font-medium">View Community Units</span>
            </button>
            <button className="p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              <Building2 className="w-6 h-6 mx-auto mb-2" />
              <span className="block font-medium">Generate Report</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
