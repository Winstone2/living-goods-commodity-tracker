
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { LoginForm } from "@/components/LoginForm";

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <LoginForm />;
};

export default Index;
