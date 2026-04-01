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

/** Used for HS256 signing. jsonwebtoken v9 rejects empty secrets — ensure .env has JWT_SECRET in production. */
const DEV_JWT_FALLBACK = "dev-only-jwt-secret-min-32-chars-change-for-prod";

export function jwtSecretForSigning(c: Context): { ok: true; secret: string } | { ok: false; error: string } {
  const s = getJwtSecret(c).trim();
  if (s.length >= 8) {
    return { ok: true, secret: s };
  }
  if (process.env.NODE_ENV !== "production") {
    return { ok: true, secret: DEV_JWT_FALLBACK };
  }
  return {
    ok: false,
    error:
      "Server misconfiguration: set JWT_SECRET in the environment (at least 8 characters).",
  };
}
