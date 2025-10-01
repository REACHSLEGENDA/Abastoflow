import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { showError, showSuccess } from "@/utils/toast";
import { useState } from "react";

const passwordSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function UpdatePasswordForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });
    setLoading(false);

    if (error) {
      showError(`Error al cambiar la contraseña: ${error.message}`);
    } else {
      showSuccess("Contraseña actualizada con éxito.");
      form.reset();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar Contraseña</CardTitle>
        <CardDescription>
          Elige una nueva contraseña segura para tu cuenta.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar Contraseña"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}