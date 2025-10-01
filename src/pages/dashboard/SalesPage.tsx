export default function SalesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Gestión de Ventas</h1>
      <p className="text-muted-foreground">Aquí podrás registrar y consultar tus ventas.</p>
      <div className="mt-8 flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[400px]">
        <div className="flex flex-col items-center gap-1 text-center p-8">
          <h3 className="text-2xl font-bold tracking-tight">
            Próximamente
          </h3>
          <p className="text-sm text-muted-foreground">
            La funcionalidad de gestión de ventas está en construcción.
          </p>
        </div>
      </div>
    </div>
  );
}