import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserNav } from "@/components/layout/UserNav";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, DollarSign, Home, Package, Settings, ShoppingCart, Truck, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = () => (
  <div className="hidden border-r bg-muted/40 md:block">
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span className="">AbastoFlow</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
          >
            <Home className="h-4 w-4" />
            Inicio
          </Link>
          <Link
            to="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <ShoppingCart className="h-4 w-4" />
            Ventas
          </Link>
          <Link
            to="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <Package className="h-4 w-4" />
            Inventario
          </Link>
          <Link
            to="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <Truck className="h-4 w-4" />
            Proveedores
          </Link>
          <Link
            to="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <Users className="h-4 w-4" />
            Clientes
          </Link>
        </nav>
      </div>
    </div>
  </div>
);

const Header = () => (
  <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
    {/* Aquí iría el menú para móvil si fuera necesario */}
    <div className="w-full flex-1">
      {/* Podríamos añadir una barra de búsqueda aquí */}
    </div>
    <UserNav />
  </header>
);

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">¡Bienvenido, {profile?.full_name || 'usuario'}!</h1>
          </div>
          <div
            className="flex flex-1 items-start justify-center rounded-lg border border-dashed shadow-sm p-4"
          >
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 w-full">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ventas Totales
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% desde el mes pasado
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Nuevos Clientes
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+23</div>
                  <p className="text-xs text-muted-foreground">
                    +180.1% desde el mes pasado
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ventas de Hoy</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+1,250</div>
                  <p className="text-xs text-muted-foreground">
                    +19% desde ayer
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Productos Bajos en Stock
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    3 necesitan atención urgente
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}