import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (profile?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (profile?.role === 'pendiente') {
    return <Navigate to="/pending-approval" replace />;
  }

  return <>{children}</>;
}