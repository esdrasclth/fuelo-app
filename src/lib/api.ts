import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "@/lib/errors";

/** Wraps a route handler, mapping common errors to JSON responses. */
export function route<T>(fn: () => Promise<T>) {
  return fn()
    .then((data) => NextResponse.json(data))
    .catch((err) => {
      if (err instanceof HttpError) {
        return NextResponse.json(
          { error: err.message },
          { status: err.status },
        );
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
