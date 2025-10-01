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

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900">
      <Card className="w-full max-w-sm bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm shadow-2xl rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bienvenido a AbastoFlow</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" placeholder="jefe@tienda.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold shadow-lg">Acceder</Button>
          <p className="mt-4 text-xs text-center text-gray-700 dark:text-gray-300">
            ¿No tienes una cuenta?{" "}
            <Link to="/registro" className=" text-blue-600 hover:underline font-semibold">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}