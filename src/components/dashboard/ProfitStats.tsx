import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Wallet, Percent } from "lucide-react";

export default function ProfitStats() {
  const [stats, setStats] = useState({
    totalProfit: 0,
    todayProfit: 0,
    avgMargin: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: allSales, error: totalProfitError } = await supabase
        .from("sales")
        .select("total_amount, total_profit");

      const { data: todaySales, error: todayProfitError } = await supabase
        .from("sales")
        .select("total_profit")
        .gte("sale_date", today.toISOString())
        .lt("sale_date", tomorrow.toISOString());
      
      if (totalProfitError || todayProfitError) {
        console.error("Error fetching profit stats:", totalProfitError || todayProfitError);
        setLoading(false);
        return;
      }

      const totalProfit = allSales.reduce((acc, sale) => acc + (sale.total_profit || 0), 0);
      const totalRevenue = allSales.reduce((acc, sale) => acc + (sale.total_amount || 0), 0);
      const todayProfit = todaySales.reduce((acc, sale) => acc + (sale.total_profit || 0), 0);
      const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      setStats({
        totalProfit,
        todayProfit,
        avgMargin,
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
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-1" />
            </CardContent>
          </Card>>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganancia Total</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalProfit)}</div>
          <p className="text-xs text-muted-foreground">Ganancia neta de todas las ventas.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganancia de Hoy</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.todayProfit)}</div>
          <p className="text-xs text-muted-foreground">Ganancia neta generada hoy.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Margen de Ganancia Promedio</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgMargin.toFixed(2)}%</div>
          <p className="text-xs text-muted-foreground">Promedio de todas las ventas.</p>
        </CardContent>
      </Card>
    </div>
  );
}