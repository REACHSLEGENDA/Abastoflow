import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import ProductForm from "@/components/dashboard/ProductForm";
import CategoryForm from "@/components/dashboard/CategoryForm";
import { Badge } from "@/components/ui/badge";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any | null>(null);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*, category:categories(name)").order("name");
    if (error) {
      showError("Error al cargar los productos: " + error.message);
    } else {
      setProducts(data || []);
      const grouped = (data || []).reduce((acc, product) => {
        const categoryName = product.category?.name || 'Sin Categoría';
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(product);
        return acc;
      }, {} as Record<string, any[]>);
      setGroupedProducts(grouped);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setProductToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setProductToEdit(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (product: any) => {
    setProductToDelete(product);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    const { error } = await supabase.from("products").delete().eq("id", productToDelete.id);
    if (error) {
      showError("Error al eliminar el producto: " + error.message);
    } else {
      showSuccess("Producto eliminado con éxito.");
      fetchProducts();
    }
    setIsAlertOpen(false);
    setProductToDelete(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Inventario</h1>
          <p className="text-muted-foreground">Controla tu stock de productos por categorías.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCategoryFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Categoría
          </Button>
          <Button onClick={handleAddProduct}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Producto
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Cargando productos...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-16 border rounded-lg">
          <p>No has agregado ningún producto todavía.</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full" defaultValue={Object.keys(groupedProducts)[0]}>
          {Object.entries(groupedProducts).map(([category, productsInCategory]) => (
            <AccordionItem value={category} key={category}>
              <AccordionTrigger className="text-lg font-medium">
                <div className="flex items-center gap-3">
                  {category}
                  <Badge variant="secondary">{productsInCategory.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="rounded-lg border shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Precio Venta</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsInCategory.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.sku || "-"}</TableCell>
                          <TableCell className="text-right">${product.sale_price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{product.current_stock}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menú</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteProduct(product)}
                                >
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <ProductForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSuccess={fetchProducts}
        productToEdit={productToEdit}
      />

      <CategoryForm
        isOpen={isCategoryFormOpen}
        setIsOpen={setIsCategoryFormOpen}
        onSuccess={fetchProducts}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el producto
              "{productToDelete?.name}" de tu inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}