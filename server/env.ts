/**
 * Helpers to read env from either Cloudflare (c.env) or Vercel/Node (c.get variables).
 * Use these in routes so the same code works on Workers and Vercel.
 */
import type { Context } from "hono";

type EnvLike = { JWT_SECRET?: string; ALLOWED_ORIGINS?: string };
type VarLike = { JWT_SECRET?: string; ALLOWED_ORIGINS?: string };

export function getJwtSecret(c: Context<{ Bindings?: EnvLike; Variables?: VarLike }>): string {
  const fromEnv = (c.env as EnvLike)?.JWT_SECRET;
  const fromVar = (c.get as (k: string) => string)?.("JWT_SECRET");
  return fromEnv ?? fromVar ?? "";
}

export function getAllowedOrigins(c: Context<{ Bindings?: EnvLike; Variables?: VarLike }>): string | undefined {
  const fromEnv = (c.env as EnvLike)?.ALLOWED_ORIGINS;
  const fromVar = (c.get as (k: string) => string)?.("ALLOWED_ORIGINS");
  return fromEnv ?? fromVar;
}
