import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { useState } from "react";
import { CartItem } from "@/pages/dashboard/SalesPage";

interface CheckoutDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  cart: CartItem[];
  total: number;
  onSuccess: () => void;
}

export default function CheckoutDialog({ isOpen, setIsOpen, cart, total, onSuccess }: CheckoutDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [amountReceived, setAmountReceived] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);

  const change = amountReceived > total ? amountReceived - total : 0;

  const handleCheckout = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError("No estás autenticado.");
      setLoading(false);
      return;
    }

    const totalProfit = cart.reduce((acc, item) => {
      const profitPerItem = (item.price_per_item || 0) - (item.cost_per_item || 0);
      return acc + (profitPerItem * (item.quantity || 0));
    }, 0);

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        user_id: user.id,
        customer_name: customerName || "Mostrador",
        sale_date: new Date().toISOString(),
        total_amount: total,
        total_profit: totalProfit,
        payment_method: paymentMethod,
      })
      .select()
      .single();

    if (saleError) {
      showError(`Error al crear la venta: ${saleError.message}`);
      setLoading(false);
      return;
    }

    const saleItems = cart.map(item => ({
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_per_item: item.price_per_item,
      cost_per_item: item.cost_per_item,
    }));

    const { error: itemsError } = await supabase.from("sale_items").insert(saleItems);

    if (itemsError) {
      showError(`Error al agregar los productos: ${itemsError.message}`);
      await supabase.from("sales").delete().eq("id", sale.id);
      setLoading(false);
      return;
    }

    showSuccess("Venta registrada con éxito.");
    onSuccess();
    setIsOpen(false);
    setAmountReceived(0);
    setCustomerName("");
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar Venta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center">
            <Label>Total a Pagar</Label>
            <p className="text-4xl font-bold">${total.toFixed(2)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentMethod">Método de Pago</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amountReceived">Monto Recibido</Label>
              <Input
                id="amountReceived"
                type="number"
                value={amountReceived || ""}
                onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                placeholder={total.toFixed(2)}
                disabled={paymentMethod !== 'efectivo'}
              />
            </div>
          </div>
          {paymentMethod === 'efectivo' && (
            <div className="text-center">
              <Label>Cambio</Label>
              <p className="text-2xl font-semibold text-green-600">${change.toFixed(2)}</p>
            </div>
          )}
          <div>
            <Label htmlFor="customerName">Nombre del Cliente (Opcional)</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Cliente Mostrador"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleCheckout} disabled={loading}>
            {loading ? "Procesando..." : "Confirmar Venta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}