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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import PurchaseForm from "@/components/dashboard/PurchaseForm";
import PurchasesStats from "@/components/dashboard/PurchasesStats";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<any | null>(null);

  async function fetchPurchases() {
    setLoading(true);
    const { data, error } = await supabase
      .from("purchases")
      .select("*, purchase_items(*, products(name))")
      .order("purchase_date", { ascending: false });

    if (error) {
      showError("Error al cargar las compras: " + error.message);
    } else {
      setPurchases(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPurchases();
  }, []);

  const confirmDelete = async () => {
    if (!purchaseToDelete) return;
    const { error } = await supabase.from("purchases").delete().eq("id", purchaseToDelete.id);
    if (error) {
      showError("Error al eliminar la compra: " + error.message);
    } else {
      showSuccess("Compra eliminada con éxito. El stock ha sido ajustado.");
      fetchPurchases();
    }
    setPurchaseToDelete(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Compras</h1>
          <p className="text-muted-foreground">Registra y consulta las compras de tus proveedores.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Compra
        </Button>
      </div>

      <div className="space-y-6">
        <PurchasesStats />

        <div>
          {loading ? (
            <div className="text-center py-16 border rounded-lg">Cargando compras...</div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-16 border rounded-lg">
              <p>No has registrado ninguna compra todavía.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {purchases.map((purchase) => (
                <AccordionItem value={purchase.id} key={purchase.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="w-full grid grid-cols-3 md:grid-cols-4 items-center text-sm text-left">
                      <span>{new Date(purchase.purchase_date).toLocaleDateString()}</span>
                      <span className="font-medium hidden md:block">{purchase.supplier_name || "N/A"}</span>
                      <span>{purchase.purchase_items.length} productos</span>
                      <div className="flex items-center justify-end gap-4">
                        <span className="font-semibold">${parseFloat(purchase.total_cost).toFixed(2)}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); setPurchaseToDelete(purchase); }}>
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-4 py-2 bg-muted/50 rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-center">Cantidad</TableHead>
                            <TableHead className="text-right">Costo Unitario</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {purchase.purchase_items.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.products?.name || "Producto eliminado"}</TableCell>
                              <TableCell className="text-center">{item.quantity}</TableCell>
                              <TableCell className="text-right">${item.cost_per_item.toFixed(2)}</TableCell>
                              <TableCell className="text-right">${(item.quantity * item.cost_per_item).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {purchase.notes && (
                        <div className="mt-4 pt-2 border-t">
                          <h4 className="font-semibold text-sm">Notas:</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{purchase.notes}</p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>

      <PurchaseForm isOpen={isFormOpen} setIsOpen={setIsFormOpen} onSuccess={fetchPurchases} />

      <AlertDialog open={!!purchaseToDelete} onOpenChange={() => setPurchaseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar esta compra?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. Se eliminará el registro de la compra y el stock de los productos involucrados será ajustado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Sí, eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}