import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="Fuelo"
            width={72}
            height={72}
            className="rounded-3xl shadow-lg"
            priority
          />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Fuelo</h1>
          <p className="text-sm text-muted-foreground">
            Gestión inteligente de combustible
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
