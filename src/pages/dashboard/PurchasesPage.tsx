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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileText, PlusCircle } from "lucide-react";
import { showError } from "@/utils/toast";
import PurchaseForm from "@/components/dashboard/PurchaseForm";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<any | null>(null);

  async function fetchPurchases() {
    setLoading(true);
    const { data, error } = await supabase
      .from("purchases")
      .select("*")
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

  const handleAddPurchase = () => {
    setIsFormOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Compras</h1>
          <p className="text-muted-foreground">Registra las compras de tus proveedores.</p>
        </div>
        <Button onClick={handleAddPurchase}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Compra
        </Button>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead className="text-right">Costo Total</TableHead>
              <TableHead className="w-[100px] text-center">Notas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Cargando compras...
                </TableCell>
              </TableRow>
            ) : purchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No has registrado ninguna compra todavía.
                </TableCell>
              </TableRow>
            ) : (
              purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">{purchase.supplier_name || "N/A"}</TableCell>
                  <TableCell className="text-right">${parseFloat(purchase.total_cost).toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    {purchase.notes && (
                      <Button variant="ghost" size="icon" onClick={() => setViewingPurchase(purchase)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PurchaseForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSuccess={fetchPurchases}
      />

      <Dialog open={!!viewingPurchase} onOpenChange={(isOpen) => !isOpen && setViewingPurchase(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notas de la Compra</DialogTitle>
            <DialogDescription>
              Realizada el {viewingPurchase ? new Date(viewingPurchase.purchase_date).toLocaleDateString() : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 whitespace-pre-wrap">
            {viewingPurchase?.notes}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}