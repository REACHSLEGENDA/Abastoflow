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
import { showError, showSuccess } from "@/utils/toast";
import { useEffect, useState } from "react";
import { CalendarIcon, Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const purchaseItemSchema = z.object({
  product_id: z.string().uuid("Producto inválido."),
  product_name: z.string(),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a 0."),
  cost_per_item: z.coerce.number().min(0, "El costo no puede ser negativo."),
});

const purchaseSchema = z.object({
  supplier_name: z.string().optional(),
  purchase_date: z.date(),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, "Debes agregar al menos un producto."),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

interface PurchaseFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess: () => void;
}

export default function PurchaseForm({ isOpen, setIsOpen, onSuccess }: PurchaseFormProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [openProductSearch, setOpenProductSearch] = useState(false);

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      purchase_date: new Date(),
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from("products").select("id, name, sku");
      if (error) {
        showError("Error al cargar productos para la búsqueda.");
      } else {
        setProducts(data || []);
      }
    }
    fetchProducts();
  }, []);

  const items = form.watch("items");
  const totalCost = items.reduce((acc, item) => acc + (item.quantity || 0) * (item.cost_per_item || 0), 0);

  const onSubmit = async (values: PurchaseFormValues) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError("No estás autenticado.");
      return;
    }

    // 1. Insertar la compra principal
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        user_id: user.id,
        supplier_name: values.supplier_name,
        purchase_date: values.purchase_date.toISOString(),
        notes: values.notes,
        total_cost: totalCost,
      })
      .select()
      .single();

    if (purchaseError) {
      showError(`Error al crear la compra: ${purchaseError.message}`);
      return;
    }

    // 2. Insertar los artículos de la compra
    const purchaseItems = values.items.map(item => ({
      purchase_id: purchase.id,
      product_id: item.product_id,
      quantity: item.quantity,
      cost_per_item: item.cost_per_item,
    }));

    const { error: itemsError } = await supabase.from("purchase_items").insert(purchaseItems);

    if (itemsError) {
      showError(`Error al agregar los productos a la compra: ${itemsError.message}`);
      // Opcional: eliminar la compra creada si fallan los artículos
      await supabase.from("purchases").delete().eq("id", purchase.id);
      return;
    }

    showSuccess("Compra registrada con éxito. El stock ha sido actualizado.");
    onSuccess();
    setIsOpen(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Registrar Nueva Compra</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Proveedor (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Coca-Cola FEMSA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purchase_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Compra</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Elige una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                      <TableHead>Costo Unitario</TableHead>
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
                            render={({ field }) => (
                              <Input type="number" min="1" {...field} className="w-24" />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.cost_per_item`}
                            render={({ field }) => (
                              <Input type="number" min="0" step="0.01" {...field} className="w-28" />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          ${((items[index]?.quantity || 0) * (items[index]?.cost_per_item || 0)).toFixed(2)}
                        </TableCell>
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
              <FormMessage>{form.formState.errors.items?.message}</FormMessage>
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
                      {products.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={product.name}
                          onSelect={() => {
                            append({
                              product_id: product.id,
                              product_name: product.name,
                              quantity: 1,
                              cost_per_item: 0,
                            });
                            setOpenProductSearch(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", items.some(item => item.product_id === product.id) ? "opacity-100" : "opacity-0")} />
                          {product.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="text-right text-lg font-bold">
              Total: ${totalCost.toFixed(2)}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Anotaciones sobre la compra, proveedor, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Guardar Compra</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}