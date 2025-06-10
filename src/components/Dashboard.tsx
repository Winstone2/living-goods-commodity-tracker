import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Home, Users, TrendingUp, AlertTriangle, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '@/api/config/api.config';
import type { DashboardStats } from '@/types/dashboard';
import { AUTH_HEADER } from '@/api/config/auth-headers';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.DASHBOARD.STATS}`, {
          headers: {
            'Accept': '*/*',
              'Authorization': AUTH_HEADER  // Just change this line

          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user?.token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No data available</div>;

  const statCards = [
    {
      title: 'Counties',
      value: stats.totalCounties,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Sub-Counties',
      value: stats.totalSubCounties,
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Wards',
      value: stats.totalWards,
      icon: MapPin,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Facilities',
      value: stats.totalFacilities,
      icon: Home,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role === 'ADMIN' ? 'Admin Dashboard' : 'Community Health Dashboard'}
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

      {/* Monthly Consumption & Stock Outs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Monthly Consumption</span>
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
              <span>Stock Out Items ({stats.totalStockOuts})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.stockOutStats.map((item, index) => (
                <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="font-medium text-red-800 mb-2">{item.communityUnitName}</div>
                  <div className="text-sm text-red-600">{item.commodityNames}</div>
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
            <button 
              onClick={() => navigate('/inventory')}
              className="p-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <TrendingUp className="w-6 h-6 mx-auto mb-2" />
              <span className="block font-medium">Add New Record</span>
            </button>
            <button 
              onClick={() => navigate('/inventory')}
              className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Users className="w-6 h-6 mx-auto mb-2" />
              <span className="block font-medium">View Community Units</span>
            </button>
            <button 
              onClick={() => navigate('/reports')}
              className="p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <FileText className="w-6 h-6 mx-auto mb-2" />
              <span className="block font-medium">Generate Report</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
