import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/utils/toast";
import { useNavigate } from "react-router-dom";

type ProfileWithEmail = UserProfile & { email: string };

export default function AdminDashboardPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function fetchProfiles() {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*");

    if (error) {
      showError("Error al cargar los perfiles: " + error.message);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      showError("Error al actualizar el rol: " + error.message);
    } else {
      showSuccess("Rol actualizado correctamente.");
      setProfiles((prevProfiles) =>
        prevProfiles.map((p) => (p.id === userId ? { ...p, role: newRole as UserProfile['role'] } : p))
      );
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-gray-500 dark:text-gray-400">Gestión de usuarios y roles</p>
          </div>
          <Button onClick={handleLogout} variant="outline">Cerrar Sesión</Button>
        </header>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Comercio</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="w-[180px]">Rol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Cargando usuarios...
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.full_name}</TableCell>
                    <TableCell>{profile.commerce_name}</TableCell>
                    <TableCell>{profile.phone}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={profile.role}
                        onValueChange={(newRole) => handleRoleChange(profile.id, newRole)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aprobado">Aprobado</SelectItem>
                          <SelectItem value="cajero">Cajero</SelectItem>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}