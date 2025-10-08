import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader } from "@/components/ui/card";

export default function WelcomeBanner() {
  const { profile } = useAuth();

  const gifSrc = "https://raw.githubusercontent.com/REACHSLEGENDA/Imagenes/main/Generated-File-October-07-2025-unscreen.gif";

  return (
    <Card className="mb-6 animate-fade-in-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              ¡Bienvenido de vuelta, {profile?.full_name || 'usuario'}!
            </h2>
            <p className="text-muted-foreground">
              Aquí tienes un resumen de la actividad de tu negocio.
            </p>
          </div>
          <div className="hidden md:block">
            <img 
              src={gifSrc}
              alt="Ilustración de bienvenida animada" 
              className="h-24 w-24"
            />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}