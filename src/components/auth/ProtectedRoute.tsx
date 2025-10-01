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

  // Si el usuario está logueado pero aún no tenemos su perfil (o su rol es pendiente),
  // lo enviamos a la página de espera. Esta es la zona segura.
  if (!profile || profile.role === 'pendiente') {
    return <Navigate to="/pending-approval" replace />;
  }

  // Solo si tenemos un perfil y el rol NO es pendiente, mostramos el contenido.
  return <>{children}</>;
}