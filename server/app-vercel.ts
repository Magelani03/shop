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
import { getAllowedOrigins } from "./env.js";

type Variables = {
  prisma: PrismaClient;
  JWT_SECRET: string;
  ALLOWED_ORIGINS?: string;
};

const app = new Hono<{ Bindings: Record<string, never>; Variables: Variables }>();

// Prisma with DATABASE_URL (PostgreSQL on Vercel)
app.use("*", async (c, next) => {
  const prisma = new PrismaClient();
  c.set("prisma", prisma);
  c.set("JWT_SECRET", process.env.JWT_SECRET ?? "");
  c.set("ALLOWED_ORIGINS", process.env.ALLOWED_ORIGINS ?? "");
  await next();
});

app.use("*", async (c, next) => {
  const originsRaw = getAllowedOrigins(c);
  const origins = originsRaw?.split(",") || ["http://localhost:8080", "http://localhost:5173"];
  return cors({ origin: origins })(c, next);
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
