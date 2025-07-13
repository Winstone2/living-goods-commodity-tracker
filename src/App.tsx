import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import { LoginForm } from "@/components/LoginForm";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { CHADashboard } from "@/components/CHADashboard";

import { Inventory } from "@/pages/Inventory";
import { Reports } from "@/pages/Reports";
import { UserManagement } from "@/pages/UserManagement";
import { Settings } from "@/pages/Settings";
import NotFound from "./pages/NotFound";
import CommunityUnits from "./pages/CommunityUnits";
import { Management } from "./pages/Management";


const queryClient = new QueryClient();

// ✅ Restrict layout to only allowed pages
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // ✅ If user is CHA, only allow access to specific routes
  const allowedForCHA = ["/CHADashboard", "/inventory", "/reports"];
  if (user.role === "CHA" && !allowedForCHA.includes(location.pathname)) {
    return <Navigate to="/CHADashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

// ✅ Admin-only routes
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (user.role === "CHA") return <Navigate to="/CHADashboard" />;
  if (user.role !== "ADMIN") return <Navigate to="/dashboard" />;

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? (
        user.role === "CHA" ? <Navigate to="/CHADashboard" /> : <Navigate to="/dashboard" />
      ) : (
        <LoginForm />
      )} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
        {/* <Route path="/login" element={<LoginForm />} /> */}


      <Route path="/inventory" element={
        <ProtectedRoute>
          <Inventory />
        </ProtectedRoute>
      } />
      <Route path="/management" element={
        <ProtectedRoute>
          <Management />
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      } />

      <Route path="/CHADashboard" element={
        <ProtectedRoute>
          <CHADashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute>
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/settings" element={
        <ProtectedRoute>
          <AdminRoute>
            <Settings />
          </AdminRoute>
        </ProtectedRoute>
      } />

      <Route path="/community-units" element={
        <ProtectedRoute>
          <CommunityUnits />
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
