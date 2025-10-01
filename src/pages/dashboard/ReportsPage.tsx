import ProfitStats from "@/components/dashboard/ProfitStats";
import TopProfitableProductsChart from "@/components/dashboard/TopProfitableProductsChart";

export default function ReportsPage() {
  return (
    <>
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">Reportes de Rendimiento</h1>
      </div>
      
      <div className="flex flex-1 flex-col gap-4 md:gap-8">
        <ProfitStats />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
          <TopProfitableProductsChart />
          {/* Aquí se podrían añadir más gráficos en el futuro */}
        </div>
      </div>
    </>
  );
}