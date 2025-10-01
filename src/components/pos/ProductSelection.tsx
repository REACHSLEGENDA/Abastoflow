import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PackageSearch } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductSelectionProps {
  onProductSelect: (product: any) => void;
}

export default function ProductSelection({ onProductSelect }: ProductSelectionProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sale_price, current_stock, sku, purchase_cost")
        .order("name");
      
      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full p-4">
      <Input
        placeholder="Buscar por nombre o SKU..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <ScrollArea className="flex-grow">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            <p>Cargando productos...</p>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Card key={product.id} className="flex flex-col cursor-pointer hover:border-primary" onClick={() => onProductSelect(product)}>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium line-clamp-2">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <p className="text-lg font-bold">${product.sale_price.toFixed(2)}</p>
                </CardContent>
                <CardFooter className="p-4 text-xs text-muted-foreground">
                  Stock: {product.current_stock}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center h-64 text-muted-foreground">
              <PackageSearch className="h-12 w-12 mb-4" />
              <p>No se encontraron productos.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}