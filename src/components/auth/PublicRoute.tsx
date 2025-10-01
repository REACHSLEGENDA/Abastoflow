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

  // Si ya terminó de cargar y tenemos un usuario con perfil, lo redirigimos fuera de la página pública.
  if (user && profile) {
    if (profile.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (profile.role === 'pendiente') {
      return <Navigate to="/pending-approval" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Si no, mostramos la página pública (login, registro, etc.)
  return <>{children}</>;
}