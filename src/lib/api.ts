import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth/session";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function fail(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: { message, details } }, { status });
}

/** Uniform error translation for route handlers. */
export function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return fail(error.status, error.message);
  }
  if (error instanceof ZodError) {
    return fail(422, "Validation failed", error.flatten());
  }
  console.error("[api] unhandled error:", error);
  const message = error instanceof Error ? error.message : "Internal server error";
  return fail(500, message);
}
