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
    // Si el usuario está logueado, decidimos a dónde redirigirlo.
    // Si no tenemos perfil o es pendiente, va a la página de espera.
    if (!profile || profile.role === 'pendiente') {
      return <Navigate to="/pending-approval" replace />;
    }
    // Si tiene un rol válido, va al dashboard.
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}