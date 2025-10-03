import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export default function LowStockProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLowStockProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, current_stock, min_stock_alert")
        .gt("min_stock_alert", 0)
        .order("current_stock", { ascending: true });

      if (error) {
        console.error("Error fetching low stock products:", error);
        setProducts([]);
      } else {
        const lowStock = data.filter(p => p.current_stock <= p.min_stock_alert);
        setProducts(lowStock.slice(0, 5)); // Show top 5
      }
      setLoading(false);
    }

    fetchLowStockProducts();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Alertas de Stock Bajo</CardTitle>
          <CardDescription>Productos que requieren tu atención inmediata.</CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link to="/dashboard/inventario?view=low-stock">
            Ver Todos
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">¡Todo en orden! No hay productos con stock bajo.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Stock Actual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={product.current_stock === 0 ? "destructive" : "secondary"}>
                      {product.current_stock} / {product.min_stock_alert}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}