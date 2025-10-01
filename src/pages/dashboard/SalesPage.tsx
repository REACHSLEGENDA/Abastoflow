import { useState, useEffect } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ProductSelection from "@/components/pos/ProductSelection";
import CurrentSale from "@/components/pos/CurrentSale";
import { showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price_per_item: number;
  cost_per_item: number;
  available_stock: number;
}

export default function SalesPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  async function fetchSalesHistory() {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("sale_date", { ascending: false });

    if (error) {
      showError("Error al cargar el historial de ventas: " + error.message);
    } else {
      setSalesHistory(data || []);
    }
    setLoadingHistory(false);
  }

  useEffect(() => {
    fetchSalesHistory();
  }, []);

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product_id === product.id);
      if (existingItem) {
        if (existingItem.quantity < existingItem.available_stock) {
          return prevCart.map((item) =>
            item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          showError("No hay más stock disponible para este producto.");
          return prevCart;
        }
      } else {
        if (product.current_stock > 0) {
          return [
            ...prevCart,
            {
              product_id: product.id,
              product_name: product.name,
              quantity: 1,
              price_per_item: product.sale_price,
              cost_per_item: product.purchase_cost || 0,
              available_stock: product.current_stock,
            },
          ];
        } else {
          showError("Este producto no tiene stock disponible.");
          return prevCart;
        }
      }
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product_id === productId) {
          if (newQuantity > 0 && newQuantity <= item.available_stock) {
            return { ...item, quantity: newQuantity };
          } else if (newQuantity > item.available_stock) {
            showError("No puedes vender más de lo que hay en stock.");
            return item;
          }
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleSaleSuccess = () => {
    clearCart();
    fetchSalesHistory();
  };

  return (
    <Tabs defaultValue="pos" className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Ventas</h1>
          <p className="text-muted-foreground">Registra ventas y consulta el historial.</p>
        </div>
        <TabsList>
          <TabsTrigger value="pos">Punto de Venta</TabsTrigger>
          <TabsTrigger value="history">Historial de Ventas</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="pos" className="flex-grow">
        <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-150px)] rounded-lg border">
          <ResizablePanel defaultSize={60}>
            <ProductSelection onProductSelect={addToCart} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={40}>
            <CurrentSale
              cart={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
              onClearCart={clearCart}
              onSaleSuccess={handleSaleSuccess}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </TabsContent>

      <TabsContent value="history" className="flex-grow">
        <div className="rounded-lg border shadow-sm h-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Método de Pago</TableHead>
                <TableHead className="text-right">Monto Total</TableHead>
                <TableHead className="text-right">Ganancia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingHistory ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Cargando historial...
                  </TableCell>
                </TableRow>
              ) : salesHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No hay ventas registradas todavía.
                  </TableCell>
                </TableRow>
              ) : (
                salesHistory.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {new Date(sale.sale_date).toLocaleString('es-MX')}
                    </TableCell>
                    <TableCell className="font-medium">{sale.customer_name || "Mostrador"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{sale.payment_method}</Badge>
                    </TableCell>
                    <TableCell className="text-right">${(sale.total_amount || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(sale.total_profit || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
}