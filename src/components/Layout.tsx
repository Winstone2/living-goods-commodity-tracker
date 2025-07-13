import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Package, BarChart3, Users, Settings, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AUTH_HEADER } from '@/api/config/auth-headers';
import { toast } from 'sonner';


interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

 const handleLogout = () => {
  logout();
  navigate('/');
  localStorage.removeItem('user'); // Clear user data from local storage
  toast.success('Logged out successfully');
};



  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

 const navigationItems = [
  // Always visible to ADMIN and CHA
  ...(user?.role !== 'MANAGER' ? [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
  ] : []),

  // Manager role: dashboard + reports ONLY
  ...(user?.role === 'MANAGER' ? [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: BarChart3, label: 'Reports', path: '/reports' }
  ] : []),

  // Admin-only
  ...(user?.role === 'ADMIN' ? [
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: Users, label: 'Management', path: '/management' },
    // { icon: Settings, label: 'Settings', path: '/admin/settings' }
  ] : [])
];

  
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <div className="min-h-screen bg-gray-50 font-comic flex flex-col">
      {/* Fixed Header */}
      <header className="bg-white shadow-sm border-b fixed top-0 left-0 w-full z-50">
        <div className="flex justify-between items-center px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            <img 
              src="/lovable-uploads/7334be09-684d-43d3-9eb3-3180f308eae4.png" 
              alt="Living Goods Logo" 
              className="w-8 sm:w-10 h-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-primary">Living Goods</h1>
              <p className="text-xs sm:text-sm text-orange-600">Commodity Tracker</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-semibold">{user?.username}</span>
              </span>
            </div>
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
              {user?.role}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 p-2 sm:px-3"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative pt-[72px]"> {/* pt-[72px] = header height */}
        {/* Fixed Desktop Sidebar */}
        <nav className="hidden md:block fixed top-[72px] left-0 w-64 h-[calc(100vh-72px)] bg-white shadow-sm border-r z-40">
          <div className="p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
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

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu} />
            <nav className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 pt-20">
              <div className="p-4">
                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
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
          </div>
        )}

        {/* Main Content Area */}
        <main
          className="flex-1 p-4 sm:p-6 overflow-y-auto"
          style={{
            marginLeft: '0',
            marginTop: 0,
            ...(window.innerWidth >= 768 ? { marginLeft: '16rem' } : {}), // 64px * 4 = 256px = 16rem
            height: 'calc(100vh - 72px - 48px)' // header 72px, footer 48px
          }}
        >
          {children}
        </main>
      </div>

      {/* Fixed Footer */}
      <footer className="bg-white border-t py-3 text-center text-sm text-gray-600 fixed bottom-0 left-0 w-full z-50">
        <p>&copy; 2025 Living Goods. All rights reserved.</p>
      </footer>
    </div>
  );
};
