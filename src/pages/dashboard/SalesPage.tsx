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
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import { showError } from "@/utils/toast";
import SaleForm from "@/components/dashboard/SaleForm";

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  async function fetchSales() {
    setLoading(true);
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("sale_date", { ascending: false });

    if (error) {
      showError("Error al cargar las ventas: " + error.message);
    } else {
      setSales(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchSales();
  }, []);

  const handleAddSale = () => {
    setIsFormOpen(true);
  };

  const getPaymentMethodVariant = (method: string) => {
    switch (method) {
      case 'tarjeta':
        return 'secondary';
      case 'transferencia':
        return 'outline';
      default:
        return 'default';
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Ventas</h1>
          <p className="text-muted-foreground">Aquí podrás registrar y consultar tus ventas.</p>
        </div>
        <Button onClick={handleAddSale}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Venta
        </Button>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Método de Pago</TableHead>
              <TableHead className="text-right">Monto Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Cargando ventas...
                </TableCell>
              </TableRow>
            ) : sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No has registrado ninguna venta todavía.
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    {new Date(sale.sale_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">{sale.customer_name || "Mostrador"}</TableCell>
                  <TableCell>
                    <Badge variant={getPaymentMethodVariant(sale.payment_method)}>
                      {sale.payment_method.charAt(0).toUpperCase() + sale.payment_method.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${parseFloat(sale.total_amount).toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SaleForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSuccess={fetchSales}
      />
    </div>
  );
}