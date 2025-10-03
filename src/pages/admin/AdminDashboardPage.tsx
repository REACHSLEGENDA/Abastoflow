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
import { Trash2, LogOut, Users, UserCheck, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function AdminDashboardPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
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
      const total = profilesData?.length || 0;
      const pending = profilesData?.filter(p => p.role === 'pendiente').length || 0;
      const approved = profilesData?.filter(p => p.role === 'aprobado').length || 0;
      setStats({ total, pending, approved });
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="AbastoFlow" className="h-8 w-auto" />
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Panel de Administración</h1>
            </div>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Aprobados</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approved}</div>
              </CardContent>
            </Card>
          </div>

          {/* User Management Table */}
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Modifica roles y administra el acceso de los usuarios a la plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="hidden md:block rounded-md border">
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
                    {loading ? <TableRow><TableCell colSpan={4} className="text-center h-24">Cargando...</TableCell></TableRow> :
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
                          <Button variant="ghost" size="icon" onClick={() => setUserToDelete(profile)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                     ))}
                  </TableBody>
                </Table>
              </div>
              <div className="md:hidden space-y-4">
                {loading ? <p className="text-center">Cargando...</p> : profiles.map((profile) => (
                  <Card key={profile.id} className="bg-white dark:bg-gray-800/50">
                    <CardHeader>
                      <CardTitle>{profile.full_name}</CardTitle>
                      <CardDescription>{profile.commerce_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Label>Rol</Label>
                      <Select defaultValue={profile.role} onValueChange={(newRole) => handleRoleChange(profile.id, newRole)}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aprobado">Aprobado</SelectItem>
                          <SelectItem value="cajero">Cajero</SelectItem>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                    <CardFooter>
                      <Button variant="destructive" size="sm" onClick={() => setUserToDelete(profile)} className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar Usuario
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
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