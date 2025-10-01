import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { format, subMonths, subWeeks, subDays, startOfWeek, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type TimeFrame = "daily" | "weekly" | "monthly";

export default function SalesOverTimeChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("monthly");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      let startDate: Date;
      let dataAggregator: { [key: string]: { ventas: number; compras: number } } = {};
      let dateFormat: string;

      if (timeFrame === "monthly") {
        startDate = startOfDay(subMonths(new Date(), 5));
        startDate.setDate(1);
        for (let i = 5; i >= 0; i--) {
          const month = format(subMonths(new Date(), i), "MMM", { locale: es });
          dataAggregator[month] = { ventas: 0, compras: 0 };
        }
        dateFormat = "MMM";
      } else if (timeFrame === "weekly") {
        startDate = startOfWeek(subWeeks(new Date(), 7), { locale: es });
        for (let i = 7; i >= 0; i--) {
          const weekStart = startOfWeek(subWeeks(new Date(), i), { locale: es });
          const weekLabel = format(weekStart, "dd MMM", { locale: es });
          dataAggregator[weekLabel] = { ventas: 0, compras: 0 };
        }
      } else { // daily
        startDate = startOfDay(subDays(new Date(), 13));
        for (let i = 13; i >= 0; i--) {
          const day = subDays(new Date(), i);
          const dayLabel = format(day, "dd MMM", { locale: es });
          dataAggregator[dayLabel] = { ventas: 0, compras: 0 };
        }
      }

      const { data: salesData, error: salesError } = await supabase
        .from("sales")
        .select("sale_date, total_amount")
        .gte("sale_date", startDate.toISOString());

      const { data: purchasesData, error: purchasesError } = await supabase
        .from("purchases")
        .select("purchase_date, total_cost")
        .gte("purchase_date", startDate.toISOString());

      if (salesError || purchasesError) {
        console.error("Error fetching chart data:", salesError || purchasesError);
        setLoading(false);
        return;
      }

      salesData.forEach(sale => {
        const date = new Date(sale.sale_date);
        let key: string;
        if (timeFrame === 'monthly') key = format(date, 'MMM', { locale: es });
        else if (timeFrame === 'weekly') key = format(startOfWeek(date, { locale: es }), 'dd MMM', { locale: es });
        else key = format(date, 'dd MMM', { locale: es });
        
        if (dataAggregator[key]) {
          dataAggregator[key].ventas += sale.total_amount;
        }
      });

      purchasesData.forEach(purchase => {
        const date = new Date(purchase.purchase_date);
        let key: string;
        if (timeFrame === 'monthly') key = format(date, 'MMM', { locale: es });
        else if (timeFrame === 'weekly') key = format(startOfWeek(date, { locale: es }), 'dd MMM', { locale: es });
        else key = format(date, 'dd MMM', { locale: es });

        if (dataAggregator[key]) {
          dataAggregator[key].compras += purchase.total_cost;
        }
      });

      const chartData = Object.keys(dataAggregator).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        ventas: dataAggregator[key].ventas,
        compras: dataAggregator[key].compras,
      }));

      setData(chartData);
      setLoading(false);
    }

    fetchData();
  }, [timeFrame]);

  const formatCurrency = (value: number) => `$${value.toFixed(0)}`;

  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="grid gap-2">
          <CardTitle>Visión General</CardTitle>
          <CardDescription>Comparativa de ingresos por ventas y gastos en compras.</CardDescription>
        </div>
        <ToggleGroup 
          type="single" 
          defaultValue="monthly" 
          onValueChange={(value: TimeFrame) => { if (value) setTimeFrame(value) }}
          className="bg-muted/50 rounded-md p-1"
        >
          <ToggleGroupItem value="daily" aria-label="Ver por día">Día</ToggleGroupItem>
          <ToggleGroupItem value="weekly" aria-label="Ver por semana">Semana</ToggleGroupItem>
          <ToggleGroupItem value="monthly" aria-label="Ver por mes">Mes</ToggleGroupItem>
        </ToggleGroup>
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
              <Line type="monotone" dataKey="ventas" stroke="#16a34a" activeDot={{ r: 8 }} name="Ventas" />
              <Line type="monotone" dataKey="compras" stroke="#dc2626" name="Compras" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}