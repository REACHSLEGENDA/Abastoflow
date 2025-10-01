import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { format, eachDayOfInterval, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";

interface ProfitOverTimeChartProps {
  dateRange?: DateRange;
}

export default function ProfitOverTimeChart({ dateRange }: ProfitOverTimeChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!dateRange?.from || !dateRange?.to) return;

      setLoading(true);

      const { data: salesData, error } = await supabase
        .from("sales")
        .select("sale_date, total_profit")
        .gte("sale_date", dateRange.from.toISOString())
        .lte("sale_date", dateRange.to.toISOString())
        .order("sale_date");

      if (error) {
        console.error("Error fetching profit data:", error);
        setLoading(false);
        return;
      }

      const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
      const dateFormat = differenceInDays(dateRange.to, dateRange.from) > 31 ? "MMM yyyy" : "dd MMM";

      const aggregatedData = days.reduce((acc, day) => {
        const formattedDate = format(day, dateFormat, { locale: es });
        acc[formattedDate] = { name: formattedDate, ganancia: 0 };
        return acc;
      }, {} as Record<string, { name: string; ganancia: number }>);

      salesData.forEach(sale => {
        const formattedDate = format(new Date(sale.sale_date), dateFormat, { locale: es });
        if (aggregatedData[formattedDate]) {
          aggregatedData[formattedDate].ganancia += sale.total_profit || 0;
        }
      });

      setData(Object.values(aggregatedData));
      setLoading(false);
    }

    fetchData();
  }, [dateRange]);

  const formatCurrency = (value: number) => `$${value.toFixed(0)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución de Ganancias</CardTitle>
        <CardDescription>Ganancia neta generada en el período seleccionado.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : !data || data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No hay datos para el período seleccionado.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => [formatCurrency(value), "Ganancia"]} />
              <Legend />
              <Line type="monotone" dataKey="ganancia" stroke="#16a34a" activeDot={{ r: 8 }} name="Ganancia" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}