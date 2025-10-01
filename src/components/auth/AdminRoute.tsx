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

  // Si no es un admin, lo mandamos a una ruta segura que no cause un bucle.
  if (!user || !profile || profile.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // Si todo está en orden, es un admin y puede ver la página.
  return <>{children}</>;
}