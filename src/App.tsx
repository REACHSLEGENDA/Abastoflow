import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import PendingApprovalPage from "./pages/auth/PendingApprovalPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminRoute from "./components/auth/AdminRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import SalesPage from "./pages/dashboard/SalesPage";
import InventoryPage from "./pages/dashboard/InventoryPage";
import SuppliersPage from "./pages/dashboard/SuppliersPage";
import PurchasesPage from "./pages/dashboard/PurchasesPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import { ThemeProvider } from "./components/theme-provider";
import SettingsPage from "./pages/dashboard/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/registro" element={<PublicRoute><RegisterPage /></PublicRoute>} />
              
              {/* Rutas de Autenticación de Usuario */}
              <Route path="/pending-approval" element={<PendingApprovalPage />} />
              
              {/* Rutas del Dashboard (Protegidas y con Layout) */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="ventas" element={<SalesPage />} />
                <Route path="compras" element={<PurchasesPage />} />
                <Route path="inventario" element={<InventoryPage />} />
                <Route path="proveedores" element={<SuppliersPage />} />
                <Route path="reportes" element={<ReportsPage />} />
                <Route path="perfil" element={<ProfilePage />} />
                <Route path="ajustes" element={<SettingsPage />} />
              </Route>

              {/* Rutas de Administración */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;