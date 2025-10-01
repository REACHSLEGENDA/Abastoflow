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
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { useState } from "react";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";

const registerSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido."),
  comercio: z.string().min(1, "El nombre del comercio es requerido."),
  email: z.string().email("Correo electrónico inválido."),
  telefono: z.string().min(1, "El teléfono es requerido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: "",
      comercio: "",
      email: "",
      telefono: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.nombre,
          commerce_name: values.comercio,
          phone: values.telefono,
        },
      },
    });

    setLoading(false);

    if (error) {
      showError(error.message);
    } else {
      showSuccess("¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.");
      navigate("/login");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-blue-400 dark:from-blue-900 dark:to-indigo-950 py-12">
      <Card className="w-full max-w-md bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm shadow-2xl rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Crea tu cuenta en AbastoFlow</CardTitle>
          <CardDescription>
            Tu cuenta será revisada por un administrador antes de ser activada.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="nombre">Nombre Completo</Label>
                      <FormControl>
                        <Input id="nombre" placeholder="Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="comercio"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="comercio">Nombre del Comercio</Label>
                      <FormControl>
                        <Input id="comercio" placeholder="Abarrotes Don Juan" {...field} />
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
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <FormControl>
                      <Input id="email" type="email" placeholder="jefe@tienda.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <FormControl>
                      <Input id="telefono" type="tel" placeholder="55 1234 5678" {...field} />
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
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold shadow-lg" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
              <p className="mt-4 text-xs text-center text-gray-700 dark:text-gray-300">
                ¿Ya tienes una cuenta?{" "}
                <Link to="/login" className=" text-blue-600 hover:underline font-semibold">
                  Inicia Sesión
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}