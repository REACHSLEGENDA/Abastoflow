import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingCart } from "lucide-react";

export default function PurchasesStats() {
  const [stats, setStats] = useState({ totalCost: 0, purchaseCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const { data, error } = await supabase.from("purchases").select("total_cost");
      
      if (error) {
        console.error("Error fetching purchase stats:", error);
      } else {
        const totalCost = data.reduce((acc, p) => acc + p.total_cost, 0);
        setStats({ totalCost, purchaseCount: data.length });
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Costo Total de Compras</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</div>
          <p className="text-xs text-muted-foreground">Inversión total en inventario.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Número de Compras</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.purchaseCount}</div>
          <p className="text-xs text-muted-foreground">Total de órdenes de compra registradas.</p>
        </CardContent>
      </Card>
    </div>
  );
}