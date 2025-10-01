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

const supplierSchema = z.object({
  name: z.string().min(1, "El nombre del proveedor es requerido."),
  contact_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Correo electrónico inválido.").optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess: () => void;
  supplierToEdit?: any;
}

export default function SupplierForm({ isOpen, setIsOpen, onSuccess, supplierToEdit }: SupplierFormProps) {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contact_name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    },
  });

  const isEditing = !!supplierToEdit;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        form.reset(supplierToEdit);
      } else {
        form.reset({
          name: "",
          contact_name: "",
          phone: "",
          email: "",
          address: "",
          notes: "",
        });
      }
    }
  }, [supplierToEdit, form, isEditing, isOpen]);

  const onSubmit = async (values: SupplierFormValues) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError("No estás autenticado.");
      return;
    }

    const supplierData = { ...values, user_id: user.id, updated_at: new Date().toISOString() };

    let error;
    if (isEditing) {
      const { error: updateError } = await supabase.from("suppliers").update(supplierData).eq("id", supplierToEdit.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("suppliers").insert(supplierData);
      error = insertError;
    }

    if (error) {
      showError(`Error al guardar el proveedor: ${error.message}`);
    } else {
      showSuccess(`Proveedor ${isEditing ? 'actualizado' : 'creado'} con éxito.`);
      onSuccess();
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Proveedor" : "Agregar Nuevo Proveedor"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Proveedor</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Coca-Cola FEMSA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Contacto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 55 1234 5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Ej: contacto@proveedor.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Dirección completa del proveedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Anotaciones adicionales, días de visita, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancelar</Button>
              </DialogClose>
              <Button type="submit">{isEditing ? "Guardar Cambios" : "Crear Proveedor"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}