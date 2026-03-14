/**
 * Hono app for Vercel serverless. Uses PostgreSQL via Prisma (DATABASE_URL)
 * and process.env for JWT_SECRET and ALLOWED_ORIGINS.
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { PrismaClient } from "@prisma/client";
import products from "./routes/products.js";
import auth from "./routes/auth.js";
import orders from "./routes/orders.js";
import settings from "./routes/settings.js";
import admin from "./routes/admin.js";

// Singleton for serverless (avoid connection pool exhaustion)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

type Variables = {
  prisma: PrismaClient;
  JWT_SECRET: string;
  ALLOWED_ORIGINS?: string;
};

const app = new Hono<{ Bindings: Record<string, never>; Variables: Variables }>();

// CORS first so preflight (OPTIONS) always gets headers before any other logic
const defaultOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  "https://shop-5ns.pages.dev",
];
app.use("*", async (c, next) => {
  const originsRaw = process.env.ALLOWED_ORIGINS ?? "";
  const allowedList = originsRaw
    ? originsRaw.split(",").map((o) => o.trim()).filter(Boolean)
    : [];
  const origins = allowedList.length > 0 ? allowedList : defaultOrigins;
  const originFn = (origin: string) => {
    if (!origin) return origins[0] ?? "*";
    if (origins.includes(origin)) return origin;
    // Any Cloudflare Pages origin
    if (/^https:\/\/[\w.-]+\.pages\.dev$/i.test(origin)) return origin;
    return origins[0] ?? "*";
  };
  return cors({
    origin: originFn,
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })(c, next);
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

export default app;
