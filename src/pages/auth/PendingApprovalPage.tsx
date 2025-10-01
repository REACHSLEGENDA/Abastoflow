import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function PendingApprovalPage() {
  const { signOut, profile, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (profile && profile.role !== 'pendiente') {
        navigate('/dashboard');
      }
    }
  }, [user, profile, loading, navigate]);

  // Mientras se carga el perfil, muestra un estado de carga temático e informativo.
  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-gray-800 dark:to-gray-900">
        <Card className="w-full max-w-md text-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm shadow-2xl rounded-2xl animate-pulse">
          <CardHeader>
            <CardTitle className="text-2xl">Verificando tu cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Estamos revisando el estado de tu cuenta. Un momento por favor...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Una vez confirmado que el usuario está pendiente, muestra el mensaje completo.
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-gray-800 dark:to-gray-900">
      <Card className="w-full max-w-md text-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm shadow-2xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Cuenta Pendiente de Aprobación</CardTitle>
          <CardDescription>
            Gracias por registrarte en AbastoFlow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            Tu cuenta está siendo revisada por un administrador. Recibirás una notificación por correo electrónico una vez que sea aprobada.
          </p>
          <Button onClick={signOut} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}