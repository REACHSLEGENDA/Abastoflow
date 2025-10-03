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
import { MoreHorizontal, PlusCircle, Truck } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import SupplierForm from "@/components/dashboard/SupplierForm";
import SupplierDetailsCard from "@/components/dashboard/SupplierDetailsCard";
import { Card, CardContent } from "@/components/ui/card";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<any | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<any | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);

  async function fetchSuppliers() {
    setLoading(true);
    const { data, error } = await supabase.from("suppliers").select("*").order("name");
    if (error) {
      showError("Error al cargar los proveedores: " + error.message);
    } else {
      setSuppliers(data || []);
      if (data && data.length > 0) {
        setSelectedSupplier(data[0]);
      }
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

  const handleSuccess = () => {
    fetchSuppliers();
    // Actualizar el detalle si el proveedor editado es el seleccionado
    if (supplierToEdit && selectedSupplier && supplierToEdit.id === selectedSupplier.id) {
      // Esto es un poco más complejo, por ahora solo recargamos todo
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">Cargando...</TableCell>
                </TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">No has agregado proveedores.</TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow
                    key={supplier.id}
                    onClick={() => setSelectedSupplier(supplier)}
                    className={`cursor-pointer ${selectedSupplier?.id === supplier.id ? 'bg-muted/50' : ''}`}
                  >
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.phone || "-"}</TableCell>
                    <TableCell>{supplier.email || "-"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditSupplier(supplier)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteSupplier(supplier)}>Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="lg:col-span-1">
          {selectedSupplier ? (
            <SupplierDetailsCard supplier={selectedSupplier} onEdit={handleEditSupplier} />
          ) : (
            <Card className="flex items-center justify-center h-full">
              <CardContent className="text-center text-muted-foreground p-6">
                <Truck className="mx-auto h-12 w-12 mb-4" />
                <p>Selecciona un proveedor para ver sus detalles.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <SupplierForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSuccess={handleSuccess}
        supplierToEdit={supplierToEdit}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente al proveedor "{supplierToDelete?.name}".
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