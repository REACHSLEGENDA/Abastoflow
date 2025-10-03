import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Mail, MapPin, Phone, User } from "lucide-react";

interface SupplierDetailsCardProps {
  supplier: any;
  onEdit: (supplier: any) => void;
}

export default function SupplierDetailsCard({ supplier, onEdit }: SupplierDetailsCardProps) {
  if (!supplier) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{supplier.name}</CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{supplier.contact_name || "Sin contacto"}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-muted-foreground mt-1" />
          <div>
            <p className="font-medium">Teléfono</p>
            <p className="text-muted-foreground">{supplier.phone || "No especificado"}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-muted-foreground mt-1" />
          <div>
            <p className="font-medium">Correo Electrónico</p>
            <p className="text-muted-foreground">{supplier.email || "No especificado"}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
          <div>
            <p className="font-medium">Dirección</p>
            <p className="text-muted-foreground">{supplier.address || "No especificada"}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-muted-foreground mt-1" />
          <div>
            <p className="font-medium">Notas</p>
            <p className="text-muted-foreground whitespace-pre-wrap">{supplier.notes || "Sin notas"}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button onClick={() => onEdit(supplier)}>Editar Proveedor</Button>
      </CardFooter>
    </Card>
  );
}