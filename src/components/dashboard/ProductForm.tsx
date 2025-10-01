import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { showError, showSuccess } from "@/utils/toast";
import { useEffect } from "react";

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  sku: z.string().optional(),
  description: z.string().optional(),
  sale_price: z.coerce.number().min(0, "El precio debe ser positivo."),
  purchase_cost: z.coerce.number().min(0, "El costo debe ser positivo.").optional(),
  current_stock: z.coerce.number().int("El stock debe ser un número entero.").min(0, "El stock no puede ser negativo."),
  min_stock_alert: z.coerce.number().int("La alerta debe ser un número entero.").min(0, "La alerta no puede ser negativa.").optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess: () => void;
  productToEdit?: any;
}

export default function ProductForm({ isOpen, setIsOpen, onSuccess, productToEdit }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      sale_price: 0,
      purchase_cost: 0,
      current_stock: 0,
      min_stock_alert: 0,
    },
  });

  const isEditing = !!productToEdit;

  useEffect(() => {
    if (isEditing) {
      form.reset(productToEdit);
    } else {
      form.reset({
        name: "",
        sku: "",
        description: "",
        sale_price: 0,
        purchase_cost: 0,
        current_stock: 0,
        min_stock_alert: 0,
      });
    }
  }, [productToEdit, form, isEditing]);

  const onSubmit = async (values: ProductFormValues) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError("No estás autenticado.");
      return;
    }

    const productData = { ...values, user_id: user.id, updated_at: new Date().toISOString() };

    let error;
    if (isEditing) {
      const { error: updateError } = await supabase.from("products").update(productData).eq("id", productToEdit.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("products").insert(productData);
      error = insertError;
    }

    if (error) {
      showError(`Error al guardar el producto: ${error.message}`);
    } else {
      showSuccess(`Producto ${isEditing ? 'actualizado' : 'creado'} con éxito.`);
      onSuccess();
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Producto" : "Agregar Nuevo Producto"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Coca-Cola 600ml" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripción detallada del producto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU / Código de Barras</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 7501055300079" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="current_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Actual</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sale_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de Venta</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purchase_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo de Compra (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="min_stock_alert"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alerta de Stock Mínimo (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancelar</Button>
              </DialogClose>
              <Button type="submit">{isEditing ? "Guardar Cambios" : "Crear Producto"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}