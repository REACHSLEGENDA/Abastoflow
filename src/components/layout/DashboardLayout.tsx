import { Link, NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
import { Home, ShoppingCart, Truck, Receipt, BarChart3 } from "lucide-react";
import { UserNav } from "@/components/layout/UserNav";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const { profile } = useAuth();
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
      isActive && "bg-muted text-primary"
    );

  const isOwner = profile?.role === 'aprobado';
  const isCashier = profile?.role === 'cajero';

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <img src="/logo.png" alt="AbastoFlow Logo" className="h-8 w-auto" />
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {isOwner && (
              <NavLink to="/dashboard" end className={navLinkClass}>
                <Home className="h-4 w-4" />
                Inicio
              </NavLink>
            )}
            <NavLink to="/dashboard/ventas" className={navLinkClass}>
              <ShoppingCart className="h-4 w-4" />
              Ventas
            </NavLink>
            {isOwner && (
              <>
                <NavLink to="/dashboard/compras" className={navLinkClass}>
                  <Receipt className="h-4 w-4" />
                  Compras
                </NavLink>
                <NavLink to="/dashboard/inventario" className={navLinkClass}>
                  <Home className="h-4 w-4" />
                  Inventario
                </NavLink>
                <NavLink to="/dashboard/proveedores" className={navLinkClass}>
                  <Truck className="h-4 w-4" />
                  Proveedores
                </NavLink>
                <NavLink to="/dashboard/reportes" className={navLinkClass}>
                  <BarChart3 className="h-4 w-4" />
                  Reportes
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

const Header = () => (
  <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
    <div className="w-full flex-1">
      {/* Aquí se podría añadir una barra de búsqueda en el futuro */}
    </div>
    <UserNav />
  </header>
);

export default function DashboardLayout() {
  const { profile } = useAuth();
  const location = useLocation();

  const allowedCashierRoutes = [
    '/dashboard/ventas',
    '/dashboard/perfil',
    '/dashboard/ajustes'
  ];

  if (profile?.role === 'cajero' && !allowedCashierRoutes.includes(location.pathname)) {
    // Si es cajero y está en una ruta no permitida (como el index /dashboard), lo redirigimos
    return <Navigate to="/dashboard/ventas" replace />;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}