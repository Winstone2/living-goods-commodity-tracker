import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Package, 
  Clock,
  BarChart3,
  Activity,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_CONFIG } from '@/api/config/api.config';
import { AUTH_HEADER } from '@/api/config/auth-headers';

interface CommodityRecord {
  id: number;
  communityUnitId: number;
  communityUnitName: string;
  commodityId: number;
  commodityName: string;
  quantityExpired: number;
  quantityDamaged: number;
  stockOnHand: number;
  quantityIssued: number;
  excessQuantityReturned: number;
  quantityConsumed: number;
  closingBalance: number;
  lastRestockDate: string;
  stockOutDate: string;
  consumptionPeriod: number;
  recordDate: string;
  countyName: string;
  subCountyName: string;
  wardName: string;
  facilityName: string;
  earliestExpiryDate: string;
  quantityToOrder: number;
}

interface CHPStats {
  totalRecords: number;
  totalIssued: number;
  totalConsumed: number;
  totalExpired: number;
  totalDamaged: number;
  totalOutOfStock: number;
  commoditiesToReorder: string[];
  commoditiesInExcess: string[];
  slowMovingCommodities: string[];
  outOfStockCommodities: string[];
  advice: string;
  forecast: Record<string, number>;
}

interface CHP {
  chpId: number;
  chpUsername: string;
  chpEmail: string;
  commodityRecords: CommodityRecord[];
  stats: CHPStats;
}

interface DashboardData {
  chps: CHP[];
  stats: {
    totalRecords: number;
    totalIssued: number;
    totalConsumed: number;
    totalExpired: number;
    totalDamaged: number;
    totalClosingBalance: number;
  };
  advice: string;
}

export const CHADashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCHPData = async () => {
      if (!user?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHA.CHPS(user.id)}`, {
          headers: {
            'Accept': '*/*',
            'Authorization': AUTH_HEADER
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch CHP data');
        }

        const responseData = await response.json();
        setData(responseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCHPData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Failed to load dashboard data'}
        </AlertDescription>
      </Alert>
    );
  }

  const activeCHPs = data.chps.filter(chp => chp.commodityRecords.length > 0);
  const inactiveCHPs = data.chps.filter(chp => chp.commodityRecords.length === 0);

  const getCHPStatus = (chp: CHP) => {
    if (chp.commodityRecords.length === 0) return 'inactive';
    if (chp.stats.commoditiesToReorder.length > 0) return 'needs-attention';
    if (chp.stats.commoditiesInExcess.length > 0) return 'excess';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inactive': return 'destructive';
      case 'needs-attention': return 'secondary';
      case 'excess': return 'default';
      case 'good': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'inactive': return <XCircle className="h-4 w-4" />;
      case 'needs-attention': return <AlertTriangle className="h-4 w-4" />;
      case 'excess': return <TrendingUp className="h-4 w-4" />;
      case 'good': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CHA Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage your Community Health Providers</p>
      </div>

      {/* System-wide Advice */}
      {data.advice && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{data.advice}</AlertDescription>
        </Alert>
      )}

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CHPs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.chps.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCHPs.length} active, {inactiveCHPs.length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              Commodity reports submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consumed</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalConsumed}</div>
            <p className="text-xs text-muted-foreground">
              Units distributed to community
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Balance</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.stats.totalClosingBalance < 0 ? 'text-destructive' : 'text-foreground'}`}>
              {data.stats.totalClosingBalance}
            </div>
            <p className="text-xs text-muted-foreground">
              Current closing balance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CHP Performance Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              CHP Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.chps.map((chp) => {
              const status = getCHPStatus(chp);
              return (
                <div key={chp.chpId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(status)}
                    <div>
                      <p className="font-medium">{chp.chpUsername}</p>
                      <p className="text-sm text-muted-foreground">{chp.chpEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(status)}>
                      {chp.commodityRecords.length} records
                    </Badge>
                    {status === 'needs-attention' && (
                      <Badge variant="secondary">
                        {chp.stats.commoditiesToReorder.length} to reorder
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Critical Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Inactive CHPs */}
              {inactiveCHPs.length > 0 && (
                <div className="p-3 border rounded-lg border-destructive/20 bg-destructive/5">
                  <h4 className="font-medium text-destructive mb-2">
                    {inactiveCHPs.length} CHPs Haven't Submitted Records
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {inactiveCHPs.map((chp) => (
                      <Badge key={chp.chpId} variant="destructive" className="text-xs">
                        {chp.chpUsername}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Commodities Needing Reorder */}
              {(() => {
                const allReorderCommodities = [...new Set(
                  activeCHPs.flatMap(chp => chp.stats.commoditiesToReorder)
                )];
                
                if (allReorderCommodities.length > 0) {
                  return (
                    <div className="p-3 border rounded-lg border-secondary/20 bg-secondary/5">
                      <h4 className="font-medium mb-2">Commodities Need Reordering</h4>
                      <div className="flex flex-wrap gap-1">
                        {allReorderCommodities.map((commodity) => (
                          <Badge key={commodity} variant="secondary" className="text-xs">
                            {commodity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Expired/Damaged Stock */}
              {(data.stats.totalExpired > 0 || data.stats.totalDamaged > 0) && (
                <div className="p-3 border rounded-lg border-destructive/20 bg-destructive/5">
                  <h4 className="font-medium text-destructive mb-2">Stock Losses</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Expired: <span className="font-medium">{data.stats.totalExpired}</span></div>
                    <div>Damaged: <span className="font-medium">{data.stats.totalDamaged}</span></div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed CHP Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed CHP Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.chps.map((chp) => (
              <div key={chp.chpId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{chp.chpUsername}</h3>
                    <p className="text-sm text-muted-foreground">{chp.chpEmail}</p>
                  </div>
                  <Badge variant={getStatusColor(getCHPStatus(chp))}>
                    {getCHPStatus(chp).replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>

                {chp.commodityRecords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p>No records submitted this month</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* CHP Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold">{chp.stats.totalIssued}</div>
                        <div className="text-xs text-muted-foreground">Issued</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold">{chp.stats.totalConsumed}</div>
                        <div className="text-xs text-muted-foreground">Consumed</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold text-destructive">{chp.stats.totalExpired}</div>
                        <div className="text-xs text-muted-foreground">Expired</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold text-destructive">{chp.stats.totalDamaged}</div>
                        <div className="text-xs text-muted-foreground">Damaged</div>
                      </div>
                    </div>

                    {/* CHP Advice */}
                    {chp.stats.advice && (
                      <Alert>
                        <AlertDescription>{chp.stats.advice}</AlertDescription>
                      </Alert>
                    )}

                    {/* Recent Records */}
                    {chp.commodityRecords.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recent Commodity Records</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Commodity</th>
                                <th className="text-left p-2">Community Unit</th>
                                <th className="text-left p-2">Stock on Hand</th>
                                <th className="text-left p-2">Closing Balance</th>
                                <th className="text-left p-2">To Order</th>
                              </tr>
                            </thead>
                            <tbody>
                              {chp.commodityRecords.slice(0, 3).map((record) => (
                                <tr key={record.id} className="border-b">
                                  <td className="p-2 font-medium">{record.commodityName}</td>
                                  <td className="p-2">{record.communityUnitName}</td>
                                  <td className="p-2">{record.stockOnHand}</td>
                                  <td className={`p-2 ${record.closingBalance < 0 ? 'text-destructive' : ''}`}>
                                    {record.closingBalance}
                                  </td>
                                  <td className="p-2">
                                    <Badge variant={record.quantityToOrder > 0 ? "secondary" : "default"}>
                                      {record.quantityToOrder}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {chp.commodityRecords.length > 3 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Showing 3 of {chp.commodityRecords.length} records
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};