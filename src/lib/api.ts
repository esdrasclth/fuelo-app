import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { UnauthorizedError } from "@/lib/session";

/** Wraps a route handler, mapping common errors to JSON responses. */
export function route<T>(fn: () => Promise<T>) {
  return fn()
    .then((data) => NextResponse.json(data))
    .catch((err) => {
      if (err instanceof UnauthorizedError) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: err.issues[0]?.message ?? "Datos inválidos" },
          { status: 400 },
        );
      }
      console.error(err);
      return NextResponse.json(
        { error: "Error del servidor" },
        { status: 500 },
      );
    });
}

export async function parseBody(req: Request) {
  return req.json().catch(() => ({}));
}
