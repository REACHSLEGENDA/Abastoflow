import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <p className="mb-8">¡Bienvenido, {profile?.full_name || 'usuario'}!</p>
      <p className="mb-8">Tu rol es: <span className="font-bold">{profile?.role}</span></p>
      <Button onClick={handleLogout}>Cerrar Sesión</Button>
    </div>
  );
}