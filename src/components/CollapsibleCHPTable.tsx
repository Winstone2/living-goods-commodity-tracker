import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { API_CONFIG } from '@/api/config/api.config';
import { AUTH_HEADER } from '@/api/config/auth-headers';

const CollapsibleCHPTable: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_CONFIG.BASE_URL}/records`,
          {
            headers: {
              'Accept': '*/*',
              'Authorization': AUTH_HEADER
            }
          }
        );
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : data?.data || []);
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  // Group by CHP (or createdByUsername) and Community Unit
  const grouped = records.reduce((acc, rec) => {
    const chpKey = rec.chp?.id || rec.createdBy || rec.createdByUsername || 'Unknown';
    const cuKey = rec.communityUnitId || 'UnknownCU';
    const groupKey = `${chpKey}-${cuKey}`;
    if (!acc[groupKey]) {
      acc[groupKey] = {
        chp: rec.chp,
        chpUsername: rec.chp?.username || rec.createdByUsername || 'Unknown',
        chpEmail: rec.chp?.email || '',
        communityUnitName: rec.communityUnitName,
        records: []
      };
    }
    acc[groupKey].records.push(rec);
    return acc;
  }, {} as Record<string, any>);

  if (loading) return <div>Loading CHP records...</div>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">CHP Commodity Records</h2>
      <div className="border rounded-lg overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left"></th>
              <th className="p-2 text-left">CHP Name</th>
              <th className="p-2 text-left">CHP Email</th>
              <th className="p-2 text-left">Community Unit</th>
              <th className="p-2 text-left"># Records</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([groupKey, group]) => (
              <React.Fragment key={groupKey}>
                <tr className="border-b">
                  <td className="p-2">
                    <button
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [groupKey]: !prev[groupKey]
                        }))
                      }
                      aria-label="Expand/Collapse"
                    >
                      {expanded[groupKey] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="p-2">{group.chpUsername}</td>
                  <td className="p-2">{group.chpEmail}</td>
                  <td className="p-2">{group.communityUnitName}</td>
                  <td className="p-2">{group.records.length}</td>
                </tr>
                {expanded[groupKey] && (
                  <tr>
                    <td colSpan={5} className="bg-gray-50">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr>
                              <th className="p-1">Commodity</th>
                              <th className="p-1">Stock On Hand</th>
                              <th className="p-1">Consumed</th>
                              <th className="p-1">Issued</th>
                              <th className="p-1">Expired</th>
                              <th className="p-1">Damaged</th>
                              <th className="p-1">Closing Balance</th>
                              <th className="p-1">To Order</th>
                              <th className="p-1">Earliest Expiry</th>
                              <th className="p-1">Last Restock</th>
                              <th className="p-1">Record Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.records.map((rec: any) => (
                              <tr key={rec.id}>
                                <td className="p-1">{rec.commodityName}</td>
                                <td className="p-1">{rec.stockOnHand}</td>
                                <td className="p-1">{rec.quantityConsumed}</td>
                                <td className="p-1">{rec.quantityIssued}</td>
                                <td className="p-1">{rec.quantityExpired}</td>
                                <td className="p-1">{rec.quantityDamaged}</td>
                                <td className="p-1">{rec.closingBalance}</td>
                                <td className="p-1">{rec.quantityToOrder}</td>
                                <td className="p-1">{rec.earliestExpiryDate ? new Date(rec.earliestExpiryDate).toLocaleDateString() : '-'}</td>
                                <td className="p-1">{rec.lastRestockDate ? new Date(rec.lastRestockDate).toLocaleDateString() : '-'}</td>
                                <td className="p-1">{rec.recordDate ? new Date(rec.recordDate).toLocaleDateString() : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CollapsibleCHPTable;