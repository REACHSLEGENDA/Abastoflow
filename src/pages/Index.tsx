import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 overflow-hidden">
      <div className="text-center p-8 flex flex-col items-center">
        <img 
          src="/logo.png" 
          alt="AbastoFlow Logo" 
          className="w-full max-w-md mb-8 animate-fade-in-up"
        />
        <p
          className="text-xl text-gray-300 mb-8 animate-fade-in-up"
          style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
        >
          La herramienta interna para gestionar tu negocio de abarrotes.
        </p>
        <div
          className="space-x-4 animate-fade-in-up"
          style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
        >
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold shadow-lg"
          >
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