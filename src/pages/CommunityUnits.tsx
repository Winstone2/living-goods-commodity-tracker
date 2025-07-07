import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, MapPin, Building2, Home, Search, Filter, MoreVertical } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_CONFIG } from '@/api/config/api.config';
import { AUTH_HEADER } from '@/api/config/auth-headers';
import { Package } from "lucide-react";


interface CommunityUnit {
    id: number;
    chaName: string;
    communityUnitName: string;
    totalChps: number;
    countyName: string;
    subCountyId: number;
    wardName: string;
    linkFacilityId: number;
    createdById: number | null;
    createdAt: string;
    totalCHPsCounted: number;
    stockLevel: number | null;
}

const CommunityUnits: React.FC = () => {
    const { user } = useAuth();
    const [communityUnits, setCommunityUnits] = useState<CommunityUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchCommunityUnits = async () => {
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.COMMUNITY_UNITS.LIST}`, {
                    headers: {
                        'Accept': '*/*',
                        'Authorization': AUTH_HEADER
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch community units');
                }

                const data = await response.json();
                setCommunityUnits(Array.isArray(data.data) ? data.data : []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchCommunityUnits();
    }, []);

    // Filter community units based on search term
    const filteredUnits = communityUnits.filter(unit =>
        unit.communityUnitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.chaName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUnits = filteredUnits.slice(startIndex, startIndex + itemsPerPage);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600">Loading community units...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                    <div className="text-red-600 font-medium">Error loading community units</div>
                </div>
                <div className="text-red-500 text-sm mt-1">{error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Community Units</h1>
                    <p className="text-gray-600 mt-1">Manage and view all community health units</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{filteredUnits.length} units found</span>
                </div>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by community unit name or CHA name..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset to first page when searching
                                }}
                            />
                        </div>
                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-primary" />
                        <span>Community Units</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="hidden md:table w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Community Unit</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">CHA Name</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Total CHPs</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">CHPs whose Commodities were Counted</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Location</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Stock Levels</th>

                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Created</th>
                                    {/* <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th> */}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedUnits.map((unit) => (
                                    <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <Home className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{unit.communityUnitName}</div>
                                                    <div className="text-sm text-gray-500">ID: {unit.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-gray-900">{unit.chaName}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-2">
                                                <Users className="w-4 h-4 text-blue-600" />
                                                <span className="font-semibold text-blue-600">{unit.totalChps}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-2 h-2 rounded-full ${unit.totalCHPsCounted >= unit.totalChps ? 'bg-green-500' : 'bg-orange-500'
                                                    }`}></div>
                                                <span className="font-medium">{unit.totalCHPsCounted}</span>
                                                <span className="text-sm text-gray-500">
                                                    ({Math.round((unit.totalCHPsCounted / unit.totalChps) * 100)}%)
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <MapPin className="w-4 h-4" />
                                                <div>
                                                    <div>County: {unit.countyName}</div>
                                                    <div>Ward: {unit.wardName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Package className="w-4 h-4" />
                                                <div>{unit.stockLevel ?? 0}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDate(unit.createdAt)}</span>
                                            </div>
                                        </td>
                                        {/* <td className="py-4 px-6">
                                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                                <MoreVertical className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                            <div className="text-sm text-gray-700">
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUnits.length)} of{' '}
                                {filteredUnits.length} results
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 text-sm border rounded ${page === currentPage
                                                ? 'bg-primary text-white border-primary'
                                                : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-800">Total Units</p>
                                <p className="text-2xl font-bold text-blue-900">{communityUnits.length}</p>
                            </div>
                            <Building2 className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-800">Total CHPs</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {communityUnits.reduce((sum, unit) => sum + unit.totalChps, 0)}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-800">CHPs Counted</p>
                                <p className="text-2xl font-bold text-orange-900">
                                    {communityUnits.reduce((sum, unit) => sum + unit.totalCHPsCounted, 0)}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile View: Card List */}
            <div className="block md:hidden space-y-4 p-4">
              {paginatedUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="bg-white rounded-xl shadow-md border border-gray-100 p-4 transition-transform duration-150 hover:scale-[1.02] active:scale-100 hover:shadow-lg"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-lg text-gray-900">{unit.communityUnitName}</div>
                      <div className="text-xs text-gray-400">ID: {unit.id}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <Users className="w-4 h-4 mr-1 text-blue-500" />
                      <span className="font-medium">CHA:</span>&nbsp;{unit.chaName}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Users className="w-4 h-4 mr-1 text-green-600" />
                      <span className="font-medium">Total CHPs:</span>&nbsp;{unit.totalChps}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Users className="w-4 h-4 mr-1 text-orange-500" />
                      <span className="font-medium">Counted:</span>&nbsp;{unit.totalCHPsCounted}
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          unit.totalCHPsCounted >= unit.totalChps
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {Math.round((unit.totalCHPsCounted / unit.totalChps) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin className="w-4 h-4 mr-1 text-purple-500" />
                      <span className="font-medium">County:</span>&nbsp;{unit.countyName}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin className="w-4 h-4 mr-1 text-purple-400" />
                      <span className="font-medium">Ward:</span>&nbsp;{unit.wardName}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Package className="w-4 h-4 mr-1 text-indigo-500" />
                      <span className="font-medium">Stock:</span>&nbsp;{unit.stockLevel ?? 0}
                    </div>
                    <div className="flex items-center text-sm text-gray-700 col-span-2">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="font-medium">Created:</span>&nbsp;{formatDate(unit.createdAt)}
                    </div>
                  </div>
                  {/* Optional: Add a details button or menu */}
                  {/* <button className="mt-2 w-full py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition">
                    View Details
                  </button> */}
                </div>
              ))}
            </div>
        </div>
    );
};
export default CommunityUnits;
