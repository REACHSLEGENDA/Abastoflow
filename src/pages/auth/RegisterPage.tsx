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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900 py-12">
      <Card className="w-full max-w-md bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm shadow-2xl rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Crea tu cuenta en AbastoFlow</CardTitle>
          <CardDescription>
            Tu cuenta será revisada por un administrador antes de ser activada.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input id="nombre" placeholder="Juan Pérez" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comercio">Nombre del Comercio</Label>
              <Input id="comercio" placeholder="Abarrotes Don Juan" required />
            </div>
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
          <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold shadow-lg">Crear Cuenta</Button>
          <p className="mt-4 text-xs text-center text-gray-700 dark:text-gray-300">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className=" text-blue-600 hover:underline font-semibold">
              Inicia Sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}