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

  // Si no hay usuario o perfil, lo mandamos a login.
  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }
  
  // Si es un admin, no debería estar aquí, lo mandamos a su panel.
  if (profile.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Si está pendiente, a la página de espera.
  if (profile.role === 'pendiente') {
    return <Navigate to="/pending-approval" replace />;
  }

  // Si es un usuario aprobado, puede ver el contenido.
  return <>{children}</>;
}