import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Wallet, Percent } from "lucide-react";
import { DateRange } from "react-day-picker";

interface ProfitStatsProps {
  dateRange?: DateRange;
}

export default function ProfitStats({ dateRange }: ProfitStatsProps) {
  const [stats, setStats] = useState({
    totalProfit: 0,
    avgMargin: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!dateRange?.from || !dateRange?.to) return;
      setLoading(true);

      const query = supabase
        .from("sales")
        .select("total_amount, total_profit")
        .gte("sale_date", dateRange.from.toISOString())
        .lte("sale_date", dateRange.to.toISOString());

      const { data: sales, error } = await query;
      
      if (error) {
        console.error("Error fetching profit stats:", error);
        setLoading(false);
        return;
      }

      const totalProfit = sales.reduce((acc, sale) => acc + (sale.total_profit || 0), 0);
      const totalRevenue = sales.reduce((acc, sale) => acc + (sale.total_amount || 0), 0);
      const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      setStats({
        totalProfit,
        avgMargin,
      });
      setLoading(false);
    }

    fetchStats();
  }, [dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganancia Total del Período</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalProfit)}</div>
          <p className="text-xs text-muted-foreground">Ganancia neta en el rango seleccionado.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Margen de Ganancia Promedio</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgMargin.toFixed(2)}%</div>
          <p className="text-xs text-muted-foreground">Promedio en el rango seleccionado.</p>
        </CardContent>
      </Card>
    </div>
  );
}