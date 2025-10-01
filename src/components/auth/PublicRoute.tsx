import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface PublicRouteProps {
  children: ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  if (user) {
    if (!profile || profile.role === 'pendiente') {
      return <Navigate to="/pending-approval" replace />;
    }
    if (profile.role === 'cajero') {
      return <Navigate to="/dashboard/ventas" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}