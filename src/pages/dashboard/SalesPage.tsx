import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import ProductSelection from "@/components/pos/ProductSelection";
import CurrentSale from "@/components/pos/CurrentSale";
import { showError } from "@/utils/toast";

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

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
       <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Punto de Venta</h1>
          <p className="text-muted-foreground">Registra ventas de forma rápida y eficiente.</p>
        </div>
      </div>
      <ResizablePanelGroup direction="horizontal" className="flex-grow rounded-lg border">
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
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}