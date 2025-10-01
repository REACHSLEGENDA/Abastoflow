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
        <p>Cargando...</p>
      </div>
    );
  }

  // Si no hay usuario, perfil, o el rol no es 'admin', lo sacamos de aquí.
  if (!user || !profile || profile.role !== 'admin') {
    // Lo mandamos a una ruta neutral y que el sistema decida a dónde va.
    return <Navigate to="/dashboard" replace />;
  }

  // Si todo está en orden, es un admin y puede ver la página.
  return <>{children}</>;
}