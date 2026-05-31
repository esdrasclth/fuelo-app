"use client";

import { useSession, signOut } from "next-auth/react";
import { Download, LogOut, User, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div>
      <PageHeader title="Ajustes" subtitle="Tu cuenta y tus datos" />

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                <User className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {session?.user?.name ?? "Conductor"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="size-4 text-primary" />
              <h2 className="font-semibold">Exportar datos</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Descarga todas tus cargas de combustible en formato CSV (compatible
              con Excel y Google Sheets).
            </p>
            <a
              href="/api/export"
              download
              className={buttonVariants({ variant: "secondary" })}
            >
              <Download className="size-4" /> Descargar CSV
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="size-4" /> Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
