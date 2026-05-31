"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, X, LogOut } from "lucide-react";
import { navItems, primaryNavHrefs } from "@/lib/nav";
import { SyncIndicator } from "@/components/sync-indicator";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string | null;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const primary = navItems.filter((i) => primaryNavHrefs.includes(i.href));

  return (
    <div className="min-h-dvh md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-card md:sticky md:top-0 md:h-dvh">
        <div className="flex items-center gap-2.5 px-5 h-16">
          <Image src="/logo.png" alt="Fuelo" width={30} height={30} className="rounded-lg" />
          <span className="font-bold text-xl tracking-tight">Fuelo</span>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-ink-black text-crystal-canvas font-semibold"
                    : "text-muted-foreground font-medium hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pt-3">
          <SyncIndicator />
        </div>
        <div className="p-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-[18px]" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Fuelo" width={26} height={26} className="rounded-lg" />
            <span className="font-bold text-lg tracking-tight">Fuelo</span>
          </div>
          <div className="flex items-center gap-2">
            <SyncIndicator />
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className="p-2 -mr-2"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 pb-24 md:pb-8 md:px-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card/90 backdrop-blur-md border-t border-border grid grid-cols-5 h-16 pb-[env(safe-area-inset-bottom)]">
        {primary.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-full px-4 py-1 transition-colors",
                  active && "bg-ink-black text-crystal-canvas",
                )}
              >
                <Icon className="size-5" />
              </span>
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => setMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground"
        >
          <span className="flex items-center justify-center rounded-full px-4 py-1">
            <Menu className="size-5" />
          </span>
          Menú
        </button>
      </nav>

      {/* Mobile menu sheet */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-ink-black/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-card border-l border-border p-4 flex flex-col rounded-l-3xl">
            <div className="flex items-center justify-between mb-4 pt-[env(safe-area-inset-top)]">
              <span className="font-semibold text-lg">{userName ?? "Menú"}</span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar"
                className="p-2 -mr-2 rounded-full hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium",
                      active
                        ? "bg-ink-black text-crystal-canvas"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="size-[18px]" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-destructive hover:bg-muted"
            >
              <LogOut className="size-4.5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
