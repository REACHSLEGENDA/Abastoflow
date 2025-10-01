import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentActivity() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentSales() {
      setLoading(true);
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("sale_date", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching recent sales:", error);
      } else {
        setSales(data || []);
      }
      setLoading(false);
    }

    fetchRecentSales();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas Recientes</CardTitle>
        <CardDescription>Un vistazo a las últimas 5 ventas registradas.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : sales.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No hay ventas registradas todavía.</p>
        ) : (
          <Table>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="font-medium">{sale.customer_name || "Cliente Mostrador"}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(sale.sale_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">Venta</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(sale.total_amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}