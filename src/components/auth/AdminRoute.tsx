import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Verificando permisos...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (profile && profile.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  
  if (profile && profile.role === 'admin') {
    return <>{children}</>;
  }

  // Si el perfil aún no se ha cargado, o no es admin, no renderiza nada hasta que se resuelva.
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Verificando permisos...</p>
    </div>
  );
}