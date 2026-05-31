"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CloudOff, RefreshCw, Cloud } from "lucide-react";
import { toast } from "sonner";
import { flushOutbox, outboxCount } from "@/lib/offline/sync";
import { cn } from "@/lib/utils";

export function SyncIndicator() {
  const qc = useQueryClient();
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    outboxCount().then(setPending).catch(() => {});

    async function sync() {
      setSyncing(true);
      try {
        const synced = await flushOutbox();
        if (synced > 0) {
          await qc.invalidateQueries({ queryKey: ["fuel-logs"] });
          toast.success(
            synced === 1
              ? "1 carga sincronizada"
              : `${synced} cargas sincronizadas`,
          );
        }
      } finally {
        setSyncing(false);
        outboxCount().then(setPending).catch(() => {});
      }
    }

    function handleOnline() {
      setOnline(true);
      sync();
    }
    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    if (navigator.onLine) sync();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [qc]);

  if (online && pending === 0 && !syncing) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[var(--radius)] px-3 py-1.5 text-xs font-medium",
        online
          ? "bg-accent/15 text-accent"
          : "bg-destructive/15 text-destructive",
      )}
    >
      {!online ? (
        <>
          <CloudOff className="size-3.5" />
          Sin conexión
          {pending > 0 && ` · ${pending} pendiente${pending === 1 ? "" : "s"}`}
        </>
      ) : syncing ? (
        <>
          <RefreshCw className="size-3.5 animate-spin" />
          Sincronizando…
        </>
      ) : (
        <>
          <Cloud className="size-3.5" />
          {pending} pendiente{pending === 1 ? "" : "s"}
        </>
      )}
    </div>
  );
}
