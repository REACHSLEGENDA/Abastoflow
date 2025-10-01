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
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const profileSchema = z.object({
  full_name: z.string().min(1, "El nombre es requerido."),
  commerce_name: z.string().min(1, "El nombre del comercio es requerido."),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function UpdateProfileForm() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      commerce_name: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || "",
        commerce_name: profile.commerce_name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    setLoading(true);

    // 1. Actualizar la tabla de perfiles
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: values.full_name,
        commerce_name: values.commerce_name,
        phone: values.phone,
      })
      .eq("id", user.id);

    if (profileError) {
      showError(`Error al actualizar el perfil: ${profileError.message}`);
      setLoading(false);
      return;
    }

    // 2. Actualizar los metadatos del usuario para refrescar el contexto
    const { error: userError } = await supabase.auth.updateUser({
      data: {
        full_name: values.full_name,
        commerce_name: values.commerce_name,
        phone: values.phone,
      },
    });

    setLoading(false);

    if (userError) {
      showError(`Error al refrescar los datos: ${userError.message}`);
    } else {
      showSuccess("Perfil actualizado con éxito.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Perfil</CardTitle>
        <CardDescription>Actualiza los datos de tu cuenta y comercio.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="commerce_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Comercio</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}