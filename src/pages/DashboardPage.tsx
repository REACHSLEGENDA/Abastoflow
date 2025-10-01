import { useAuth } from "@/contexts/AuthContext";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import LowStockProducts from "@/components/dashboard/LowStockProducts";

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