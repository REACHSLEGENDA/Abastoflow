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
  DialogDescription,
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
import { showError, showSuccess } from "@/utils/toast";
import { useAuth } from "@/contexts/AuthContext";

const requestSchema = z.object({
  worker_full_name: z.string().min(1, "El nombre es requerido."),
  worker_email: z.string().email("Correo electrónico inválido."),
  worker_temp_password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface WorkerRequestFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess: () => void;
}

export default function WorkerRequestForm({ isOpen, setIsOpen, onSuccess }: WorkerRequestFormProps) {
  const { user } = useAuth();
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      worker_full_name: "",
      worker_email: "",
      worker_temp_password: "",
    },
  });

  const onSubmit = async (values: RequestFormValues) => {
    if (!user) {
      showError("No estás autenticado.");
      return;
    }

    const { error } = await supabase.from("worker_requests").insert({
      jefe_id: user.id,
      ...values,
    });

    if (error) {
      showError(`Error al enviar la solicitud: ${error.message}`);
    } else {
      showSuccess("Solicitud enviada con éxito. Un administrador la revisará.");
      onSuccess();
      setIsOpen(false);
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Solicitar Nuevo Cajero</DialogTitle>
          <DialogDescription>
            Completa los datos del nuevo trabajador. La solicitud será revisada por un administrador.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="worker_full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: María Rodriguez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="worker_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ej: maria@correo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="worker_temp_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña Temporal</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Enviar Solicitud</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}