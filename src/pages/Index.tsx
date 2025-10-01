import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900">
      <div className="text-center p-8">
        <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">Bienvenido a AbastoFlow</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          La herramienta interna para gestionar tu negocio de abarrotes.
        </p>
        <div className="space-x-4">
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold shadow-lg">
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
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