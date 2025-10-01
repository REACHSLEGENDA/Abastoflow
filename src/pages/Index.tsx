import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8">
        <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">Bienvenido a tu Tienda</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          La herramienta interna para gestionar tu negocio.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/registro">Registrarse</Link>
          </Button>
        </div>
      </div>
      <div className="absolute bottom-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;