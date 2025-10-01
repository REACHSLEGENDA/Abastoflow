import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { DateRange } from "react-day-picker";

interface TopProfitableProductsChartProps {
  dateRange?: DateRange;
}

export default function TopProfitableProductsChart({ dateRange }: TopProfitableProductsChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      if (!user || !dateRange?.from || !dateRange?.to) return;
      setLoading(true);
      
      const { data: chartData, error } = await supabase.rpc('get_top_profitable_products_by_date', { 
        user_uuid: user.id,
        start_date: dateRange.from.toISOString(),
        end_date: dateRange.to.toISOString(),
      });

      if (error) {
        console.error("Error fetching top profitable products:", error);
        setLoading(false);
        return;
      }

      setData(chartData || []);
      setLoading(false);
    }

    fetchData();
  }, [user, dateRange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Productos Más Rentables</CardTitle>
        <CardDescription>Productos que generan mayor ganancia en el período.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16">No hay suficientes datos para mostrar.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="product_name" width={100} stroke="#888888" fontSize={12} />
              <Tooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ganancia']} />
              <Bar dataKey="total_profit" name="Ganancia" fill="#16a34a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}