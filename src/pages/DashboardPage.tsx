import { useAuth } from "@/contexts/AuthContext";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import LowStockProducts from "@/components/dashboard/LowStockProducts";
import SalesOverTimeChart from "@/components/dashboard/SalesOverTimeChart";
import PaymentMethodChart from "@/components/dashboard/PaymentMethodChart";
import TopProductsChart from "@/components/dashboard/TopProductsChart";

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <>
      <div className="flex items-center mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">¡Bienvenido, {profile?.full_name || 'usuario'}!</h1>
      </div>
      
      <div className="flex flex-1 flex-col gap-4 md:gap-8">
        <DashboardStats />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <SalesOverTimeChart />
          <div className="space-y-4">
            <PaymentMethodChart />
            <TopProductsChart />
          </div>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RecentActivity />
          </div>
          <div>
            <LowStockProducts />
          </div>
        </div>
      </div>
    </>
  );
}