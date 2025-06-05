
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Package, BarChart3, Users, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigationItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    ...(user?.role === 'admin' ? [
      { icon: Users, label: 'User Management', path: '/admin/users' },
      { icon: Settings, label: 'Settings', path: '/admin/settings' }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-comic flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/7334be09-684d-43d3-9eb3-3180f308eae4.png" 
              alt="Living Goods Logo" 
              className="w-10 h-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-primary">Living Goods</h1>
              <p className="text-sm text-orange-600">Commodity Tracker</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, <span className="font-semibold">{user?.username}</span>
            </span>
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
              {user?.role}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <nav className="w-64 bg-white shadow-sm border-r">
          <div className="p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-3 text-center text-sm text-gray-600">
        <p>&copy; 2024 Living Goods. All rights reserved.</p>
      </footer>
    </div>
  );
};
