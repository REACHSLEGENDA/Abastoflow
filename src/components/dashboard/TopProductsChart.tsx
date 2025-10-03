import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export default function TopProductsChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: saleItems, error } = await supabase
        .from("sale_items")
        .select("quantity, products(name)");

      if (error) {
        console.error("Error fetching top products:", error);
        setLoading(false);
        return;
      }

      const productSales: { [key: string]: number } = {};
      saleItems.forEach(item => {
        // The Supabase client returns the joined 'products' as an array, so we access the first element.
        if (item.products && item.products[0]?.name) {
          const productName = item.products[0].name;
          productSales[productName] = (productSales[productName] || 0) + item.quantity;
        }
      });

      const sortedProducts = Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      const chartData = sortedProducts.map(([name, vendidos]) => ({ name, vendidos }));

      setData(chartData);
      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Productos Vendidos</CardTitle>
        <CardDescription>Tus productos más populares.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16">No hay suficientes datos de ventas.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={80} stroke="#888888" fontSize={12} />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="vendidos" fill="#16a34a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}