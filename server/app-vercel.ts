/**
 * Hono app for Vercel serverless. Uses PostgreSQL via Prisma (DATABASE_URL)
 * and process.env for JWT_SECRET and ALLOWED_ORIGINS.
 */
import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import products from "./routes/products.js";
import auth from "./routes/auth.js";
import orders from "./routes/orders.js";
import settings from "./routes/settings.js";
import admin from "./routes/admin.js";
import contact from "./routes/contact.js";

// Singleton for serverless (avoid connection pool exhaustion)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

type Variables = {
  prisma: PrismaClient;
  JWT_SECRET: string;
  ALLOWED_ORIGINS?: string;
};

// Normalize path for Vercel: request may arrive as /auth/register instead of /api/auth/register
function getPath(req: Request): string {
  const url = new URL(req.url);
  const pathname = url.pathname;
  if (pathname.startsWith("/api")) return pathname;
  return "/api" + (pathname.startsWith("/") ? pathname : "/" + pathname);
}

const app = new Hono<{ Bindings: Record<string, never>; Variables: Variables }>({ getPath });

// CORS: handle preflight (OPTIONS) immediately so no other code can block or strip headers
const defaultOrigins = [
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:5173",
  "https://shop-5ns.pages.dev",
];

/** Allow phone / LAN dev URLs (e.g. http://192.168.x.x:8081) when not in production. */
function isLanOrLocalDevOrigin(origin: string): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/i.test(
    origin,
  );
}

app.use("*", async (c, next) => {
  const originsRaw = process.env.ALLOWED_ORIGINS ?? "";
  const allowedList = originsRaw
    ? originsRaw.split(",").map((o) => o.trim()).filter(Boolean)
    : [];
  const origins = allowedList.length > 0 ? allowedList : defaultOrigins;
  const originHeader = c.req.header("Origin") ?? "";
  const allowOrigin =
    !originHeader ? origins[0] ?? "*"
    : origins.includes(originHeader) ? originHeader
    : /^https:\/\/[\w.-]+\.pages\.dev$/i.test(originHeader) ? originHeader
    : isLanOrLocalDevOrigin(originHeader) ? originHeader
    : origins[0] ?? "*";

  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, HEAD, PUT, POST, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };

  if (c.req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  await next();
  Object.entries(corsHeaders).forEach(([k, v]) => c.header(k, v));
});

app.use("*", async (c, next) => {
  c.set("prisma", prisma);
  c.set("JWT_SECRET", process.env.JWT_SECRET ?? "");
  c.set("ALLOWED_ORIGINS", process.env.ALLOWED_ORIGINS ?? "");
  await next();
});

app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.route("/api/products", products);
app.route("/api/auth", auth);
app.route("/api/orders", orders);
app.route("/api/settings", settings);
app.route("/api/admin", admin);
app.route("/api/contact", contact);

export default app;
