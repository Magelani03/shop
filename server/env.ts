/**
 * Helpers to read JWT_SECRET and ALLOWED_ORIGINS from Hono context.
 * On Vercel they are set as variables (c.get); supports any context shape.
 */
import type { Context } from "hono";

export function getJwtSecret(c: Context): string {
  const env = c.env as { JWT_SECRET?: string } | undefined;
  const fromVar = typeof c.get === "function" ? (c.get as (k: string) => string)("JWT_SECRET") : undefined;
  return env?.JWT_SECRET ?? fromVar ?? "";
}

export function getAllowedOrigins(c: Context): string | undefined {
  const env = c.env as { ALLOWED_ORIGINS?: string } | undefined;
  const fromVar = typeof c.get === "function" ? (c.get as (k: string) => string)("ALLOWED_ORIGINS") : undefined;
  return env?.ALLOWED_ORIGINS ?? fromVar;
}
