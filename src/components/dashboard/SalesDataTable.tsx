import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";

interface SalesDataTableProps {
  dateRange?: DateRange;
}

export default function SalesDataTable({ dateRange }: SalesDataTableProps) {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSales() {
      if (!dateRange?.from || !dateRange?.to) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .gte("sale_date", dateRange.from.toISOString())
        .lte("sale_date", dateRange.to.toISOString())
        .order("sale_date", { ascending: false });

      if (error) {
        console.error("Error fetching sales data:", error);
      } else {
        setSales(data || []);
      }
      setLoading(false);
    }

    fetchSales();
  }, [dateRange]);

  const formatCurrency = (amount: number) => `$${(amount || 0).toFixed(2)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desglose de Ventas</CardTitle>
        <CardDescription>
          Ventas individuales registradas en el período seleccionado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Monto Total</TableHead>
                <TableHead className="text-right">Ganancia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Cargando datos...
                  </TableCell>
                </TableRow>
              ) : sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No se encontraron ventas en este período.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {sale.customer_name || "Mostrador"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(sale.total_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={sale.total_profit > 0 ? "default" : "destructive"}>
                        {formatCurrency(sale.total_profit)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}