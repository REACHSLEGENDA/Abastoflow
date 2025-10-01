import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { useState } from "react";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido."),
  password: z.string().min(1, "La contraseña es requerida."),
});

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (authError) {
      setLoading(false);
      showError(authError.message);
      return;
    }

    if (authData.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        setLoading(false);
        showError("No se pudo verificar el rol del usuario.");
        await supabase.auth.signOut();
        return;
      }

      if (profile.role === 'admin') {
        showSuccess("¡Bienvenido, administrador!");
        navigate("/admin/dashboard");
      } else {
        showError("Acceso denegado. No tienes permisos de administrador.");
        await supabase.auth.signOut();
      }
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Card className="w-full max-w-sm bg-gray-950/90 backdrop-blur-sm shadow-2xl rounded-2xl border-blue-500/20">
        <CardHeader className="text-center">
          <img src="/logo.png" alt="AbastoFlow" className="w-32 mx-auto mb-4" />
          <CardTitle className="text-2xl">Portal de Administrador</CardTitle>
          <CardDescription>
            Ingresa tus credenciales de administrador.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <FormControl>
                      <Input id="email" type="email" placeholder="admin@abastoflow.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="password">Contraseña</Label>
                    <FormControl>
                      <Input id="password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold" disabled={loading}>
                {loading ? "Verificando..." : "Acceder"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}