export const metadata = { title: "Sin conexión — Fuelo" };

export default function OfflinePage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-xl font-semibold mb-2">Estás sin conexión</h1>
      <p className="text-muted-foreground max-w-xs">
        No pudimos cargar esta página. Tus cargas guardadas sin conexión se
        sincronizarán cuando vuelvas a tener internet.
      </p>
    </div>
  );
}
