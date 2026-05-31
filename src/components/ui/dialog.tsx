"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-ink-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-lg bg-card border border-border sm:rounded-[var(--radius-card)] rounded-t-3xl max-h-[92dvh] overflow-y-auto shadow-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="sticky top-0 flex items-center justify-between px-5 h-14 border-b border-border bg-card z-10">
          <h2 className="font-semibold text-lg">{title}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="p-2 -mr-2">
            <X className="size-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
