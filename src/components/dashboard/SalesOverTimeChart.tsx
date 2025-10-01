import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { format, subMonths } from "date-fns";
import { es } from "date-fns/locale";

export default function SalesOverTimeChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const sixMonthsAgo = subMonths(new Date(), 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      const { data: salesData, error: salesError } = await supabase
        .from("sales")
        .select("sale_date, total_amount")
        .gte("sale_date", sixMonthsAgo.toISOString());

      const { data: purchasesData, error: purchasesError } = await supabase
        .from("purchases")
        .select("purchase_date, total_cost")
        .gte("purchase_date", sixMonthsAgo.toISOString());

      if (salesError || purchasesError) {
        console.error("Error fetching chart data:", salesError || purchasesError);
        setLoading(false);
        return;
      }

      const monthlyData: { [key: string]: { ventas: number; compras: number } } = {};

      for (let i = 5; i >= 0; i--) {
        const month = format(subMonths(new Date(), i), "MMM", { locale: es });
        monthlyData[month] = { ventas: 0, compras: 0 };
      }

      salesData.forEach(sale => {
        const month = format(new Date(sale.sale_date), "MMM", { locale: es });
        if (monthlyData[month]) {
          monthlyData[month].ventas += sale.total_amount;
        }
      });

      purchasesData.forEach(purchase => {
        const month = format(new Date(purchase.purchase_date), "MMM", { locale: es });
        if (monthlyData[month]) {
          monthlyData[month].compras += purchase.total_cost;
        }
      });

      const chartData = Object.keys(monthlyData).map(month => ({
        name: month.charAt(0).toUpperCase() + month.slice(1),
        ventas: monthlyData[month].ventas,
        compras: monthlyData[month].compras,
      }));

      setData(chartData);
      setLoading(false);
    }

    fetchData();
  }, []);

  const formatCurrency = (value: number) => `$${value.toFixed(0)}`;

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Visión General de los Últimos 6 Meses</CardTitle>
        <CardDescription>Comparativa de ingresos por ventas y gastos en compras.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="ventas" stroke="#16a34a" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="compras" stroke="#dc2626" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}