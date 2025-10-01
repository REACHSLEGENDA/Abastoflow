import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, XCircle } from "lucide-react";
import { CartItem } from "@/pages/dashboard/SalesPage";
import { useState } from "react";
import CheckoutDialog from "./CheckoutDialog";

interface CurrentSaleProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onSaleSuccess: () => void;
}

export default function CurrentSale({ cart, onUpdateQuantity, onRemoveFromCart, onClearCart, onSaleSuccess }: CurrentSaleProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const total = cart.reduce((acc, item) => acc + item.quantity * item.price_per_item, 0);

  return (
    <div className="flex flex-col h-full bg-muted/20 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Venta Actual</h2>
        <Button variant="ghost" size="sm" onClick={onClearCart} disabled={cart.length === 0}>
          <XCircle className="h-4 w-4 mr-2" />
          Limpiar
        </Button>
      </div>
      <ScrollArea className="flex-grow rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="w-[80px]">Cant.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cart.length > 0 ? (
              cart.map((item) => (
                <TableRow key={item.product_id}>
                  <TableCell className="text-sm font-medium">{item.product_name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(item.product_id, parseInt(e.target.value) || 0)}
                      className="h-8 w-16 text-center"
                      min="1"
                      max={item.available_stock}
                    />
                  </TableCell>
                  <TableCell className="text-right">${(item.quantity * item.price_per_item).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemoveFromCart(item.product_id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Agrega productos para iniciar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center text-xl font-bold mb-4">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <Button className="w-full" size="lg" disabled={cart.length === 0} onClick={() => setIsCheckoutOpen(true)}>
          Cobrar
        </Button>
      </div>
      <CheckoutDialog
        isOpen={isCheckoutOpen}
        setIsOpen={setIsCheckoutOpen}
        cart={cart}
        total={total}
        onSuccess={onSaleSuccess}
      />
    </div>
  );
}