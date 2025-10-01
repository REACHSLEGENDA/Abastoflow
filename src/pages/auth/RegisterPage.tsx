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
import { Link } from "react-router-dom";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Crear Cuenta de Jefe</CardTitle>
          <CardDescription>
            Completa el formulario para registrar tu tienda. Tu cuenta será revisada por un administrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre Completo</Label>
            <Input id="nombre" placeholder="Juan Pérez" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comercio">Nombre del Comercio</Label>
            <Input id="comercio" placeholder="Abarrotes Don Juan" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" placeholder="jefe@tienda.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" type="tel" placeholder="55 1234 5678" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button className="w-full">Crear Cuenta</Button>
          <p className="mt-4 text-xs text-center text-gray-700">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className=" text-blue-600 hover:underline">
              Inicia Sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}