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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/utils/toast";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

export default function AdminDashboardPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function fetchData() {
    setLoading(true);
    const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("*");

    if (profilesError) {
      showError("Error al cargar los datos: " + profilesError.message);
    } else {
      setProfiles(profilesData || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    if (error) {
      showError("Error al actualizar el rol: " + error.message);
    } else {
      showSuccess("Rol actualizado correctamente.");
      fetchData();
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    const { error } = await supabase.functions.invoke('delete-user-and-data', {
      body: { user_id: userToDelete.id }
    });
    if (error) {
      showError(`Error al eliminar usuario: ${error.message}`);
    } else {
      showSuccess("Usuario y todos sus datos eliminados con éxito.");
    }
    setUserToDelete(null);
    fetchData();
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-gray-500 dark:text-gray-400">Gestión de usuarios</p>
          </div>
          <Button onClick={handleLogout} variant="outline">Cerrar Sesión</Button>
        </header>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Gestión de Usuarios</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Comercio</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={4} className="text-center">Cargando...</TableCell></TableRow> :
                 profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.full_name}</TableCell>
                    <TableCell>{profile.commerce_name}</TableCell>
                    <TableCell>
                      <Select defaultValue={profile.role} onValueChange={(newRole) => handleRoleChange(profile.id, newRole)}>
                        <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aprobado">Aprobado</SelectItem>
                          <SelectItem value="cajero">Cajero</SelectItem>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="destructive" size="icon" onClick={() => setUserToDelete(profile)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                 ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás ABSOLUTAMENTE seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. Se eliminará permanentemente al usuario <strong>{userToDelete?.full_name}</strong> y TODOS sus datos asociados (ventas, productos, compras, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">Sí, eliminar todo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}