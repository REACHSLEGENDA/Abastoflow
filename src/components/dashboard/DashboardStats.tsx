import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Package, ShoppingCart } from "lucide-react";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalSales: 0,
    todaySales: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: totalSalesData, error: totalSalesError } = await supabase
        .from("sales")
        .select("total_amount");

      const { data: todaySalesData, error: todaySalesError } = await supabase
        .from("sales")
        .select("total_amount")
        .gte("sale_date", today.toISOString())
        .lt("sale_date", tomorrow.toISOString());
      
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("current_stock, min_stock_alert");

      if (totalSalesError || todaySalesError || productsError) {
        console.error("Error fetching stats:", totalSalesError || todaySalesError || productsError);
        setLoading(false);
        return;
      }

      const totalSales = totalSalesData.reduce((acc, sale) => acc + sale.total_amount, 0);
      const todaySales = todaySalesData.reduce((acc, sale) => acc + sale.total_amount, 0);
      const lowStockCount = productsData.filter(p => p.min_stock_alert > 0 && p.current_stock <= p.min_stock_alert).length;

      setStats({
        totalSales,
        todaySales,
        lowStockCount,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas de Hoy</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Bajos en Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
          <p className="text-xs text-muted-foreground">Historial completo de ventas.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventas de Hoy</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.todaySales)}</div>
          <p className="text-xs text-muted-foreground">Ingresos generados hoy.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productos Bajos en Stock</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.lowStockCount}</div>
          <p className="text-xs text-muted-foreground">Productos que necesitan reabastecimiento.</p>
        </CardContent>
      </Card>
    </div>
  );
}