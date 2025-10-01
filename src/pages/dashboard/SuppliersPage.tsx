import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import SupplierForm from "@/components/dashboard/SupplierForm";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<any | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<any | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  async function fetchSuppliers() {
    setLoading(true);
    const { data, error } = await supabase.from("suppliers").select("*").order("name");
    if (error) {
      showError("Error al cargar los proveedores: " + error.message);
    } else {
      setSuppliers(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddSupplier = () => {
    setSupplierToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditSupplier = (supplier: any) => {
    setSupplierToEdit(supplier);
    setIsFormOpen(true);
  };

  const handleDeleteSupplier = (supplier: any) => {
    setSupplierToDelete(supplier);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;
    const { error } = await supabase.from("suppliers").delete().eq("id", supplierToDelete.id);
    if (error) {
      showError("Error al eliminar el proveedor: " + error.message);
    } else {
      showSuccess("Proveedor eliminado con éxito.");
      fetchSuppliers();
    }
    setIsAlertOpen(false);
    setSupplierToDelete(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Proveedores</h1>
          <p className="text-muted-foreground">Administra la información de tus proveedores.</p>
        </div>
        <Button onClick={handleAddSupplier}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Proveedor
        </Button>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Cargando proveedores...
                </TableCell>
              </TableRow>
            ) : suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No has agregado ningún proveedor todavía.
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contact_name || "-"}</TableCell>
                  <TableCell>{supplier.phone || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditSupplier(supplier)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteSupplier(supplier)}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SupplierForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSuccess={fetchSuppliers}
        supplierToEdit={supplierToEdit}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente al proveedor
              "{supplierToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}