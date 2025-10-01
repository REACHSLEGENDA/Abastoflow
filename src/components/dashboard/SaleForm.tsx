import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showError, showSuccess } from "@/utils/toast";
import { useEffect, useState } from "react";
import { CalendarIcon, Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const saleItemSchema = z.object({
  product_id: z.string().uuid(),
  product_name: z.string(),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a 0."),
  price_per_item: z.coerce.number().min(0, "El precio no puede ser negativo."),
  cost_per_item: z.coerce.number().min(0),
  available_stock: z.number().int(),
}).refine(data => data.quantity <= data.available_stock, {
  message: "No hay suficiente stock.",
  path: ["quantity"],
});

const saleSchema = z.object({
  customer_name: z.string().optional(),
  sale_date: z.date(),
  payment_method: z.enum(["efectivo", "tarjeta", "transferencia"], {
    required_error: "Debes seleccionar un método de pago.",
  }),
  notes: z.string().optional(),
  items: z.array(saleItemSchema).min(1, "Debes agregar al menos un producto."),
});

type SaleFormValues = z.infer<typeof saleSchema>;

interface SaleFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess: () => void;
}

export default function SaleForm({ isOpen, setIsOpen, onSuccess }: SaleFormProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [openProductSearch, setOpenProductSearch] = useState(false);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      sale_date: new Date(),
      payment_method: "efectivo",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from("products").select("id, name, sale_price, purchase_cost, current_stock");
      if (error) {
        showError("Error al cargar productos para la búsqueda.");
      } else {
        setProducts(data || []);
      }
    }
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const items = form.watch("items");
  const totalAmount = items.reduce((acc, item) => acc + (item.quantity || 0) * (item.price_per_item || 0), 0);

  const onSubmit = async (values: SaleFormValues) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError("No estás autenticado.");
      return;
    }

    const totalProfit = values.items.reduce((acc, item) => {
      const profitPerItem = (item.price_per_item || 0) - (item.cost_per_item || 0);
      return acc + (profitPerItem * (item.quantity || 0));
    }, 0);

    // 1. Insertar la venta principal
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        user_id: user.id,
        customer_name: values.customer_name,
        sale_date: values.sale_date.toISOString(),
        notes: values.notes,
        total_amount: totalAmount,
        total_profit: totalProfit,
        payment_method: values.payment_method,
      })
      .select()
      .single();

    if (saleError) {
      showError(`Error al crear la venta: ${saleError.message}`);
      return;
    }

    // 2. Insertar los artículos de la venta
    const saleItems = values.items.map(item => ({
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_per_item: item.price_per_item,
      cost_per_item: item.cost_per_item,
    }));

    const { error: itemsError } = await supabase.from("sale_items").insert(saleItems);

    if (itemsError) {
      showError(`Error al agregar los productos a la venta: ${itemsError.message}`);
      await supabase.from("sales").delete().eq("id", sale.id);
      return;
    }

    showSuccess("Venta registrada con éxito. El stock ha sido actualizado.");
    onSuccess();
    setIsOpen(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Registrar Nueva Venta</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Cliente (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Cliente Mostrador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sale_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Venta</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pago</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormLabel>Productos</FormLabel>
              <div className="rounded-md border mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Unitario</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>{field.product_name}</TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field: quantityField }) => (
                              <FormItem>
                                <FormControl>
                                  <Input type="number" min="1" {...quantityField} className="w-24" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.price_per_item`}
                            render={({ field }) => <Input type="number" min="0" step="0.01" {...field} className="w-28" />}
                          />
                        </TableCell>
                        <TableCell>${((items[index]?.quantity || 0) * (items[index]?.price_per_item || 0)).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <FormMessage>{form.formState.errors.items?.root?.message}</FormMessage>
            </div>

            <Popover open={openProductSearch} onOpenChange={setOpenProductSearch}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openProductSearch} className="w-[300px] justify-between">
                  Agregar Producto...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar producto..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron productos.</CommandEmpty>
                    <CommandGroup>
                      {products.filter(p => p.current_stock > 0).map((product) => (
                        <CommandItem
                          key={product.id}
                          value={product.name}
                          onSelect={() => {
                            append({
                              product_id: product.id,
                              product_name: product.name,
                              quantity: 1,
                              price_per_item: product.sale_price,
                              cost_per_item: product.purchase_cost || 0,
                              available_stock: product.current_stock,
                            });
                            setOpenProductSearch(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", items.some(item => item.product_id === product.id) ? "opacity-100" : "opacity-0")} />
                          {product.name} ({product.current_stock} disp.)
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="text-right text-lg font-bold">
              Total: ${totalAmount.toFixed(2)}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Anotaciones sobre la venta, cliente, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Guardar Venta</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}