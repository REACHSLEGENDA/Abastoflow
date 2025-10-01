import { useState } from "react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import ProfitStats from "@/components/dashboard/ProfitStats";
import TopProfitableProductsChart from "@/components/dashboard/TopProfitableProductsChart";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import ProfitOverTimeChart from "@/components/dashboard/ProfitOverTimeChart";
import SalesDataTable from "@/components/dashboard/SalesDataTable";

export default function ReportsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Reportes de Rendimiento</h1>
        <DateRangePicker date={date} setDate={setDate} />
      </div>
      
      <div className="flex flex-1 flex-col gap-4 md:gap-8">
        <ProfitStats dateRange={date} />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ProfitOverTimeChart dateRange={date} />
          </div>
          <div className="lg:col-span-2">
            <TopProfitableProductsChart dateRange={date} />
          </div>
        </div>
        <SalesDataTable dateRange={date} />
      </div>
    </>
  );
}