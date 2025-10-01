import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";

const COLORS = ["#16a34a", "#3b82f6", "#f97316"];

export default function PaymentMethodChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: salesData, error } = await supabase.from("sales").select("payment_method");

      if (error) {
        console.error("Error fetching payment methods:", error);
        setLoading(false);
        return;
      }

      const counts = salesData.reduce((acc, sale) => {
        acc[sale.payment_method] = (acc[sale.payment_method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const chartData = Object.keys(counts).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: counts[key],
      }));

      setData(chartData);
      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pago</CardTitle>
        <CardDescription>Distribución de las ventas por método de pago.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16">No hay datos de ventas para mostrar.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}