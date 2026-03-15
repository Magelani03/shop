/**
 * Node.js server entry for Render (and local runs).
 * Uses the same Hono app as Vercel (app-vercel.ts).
 * Set PORT (Render sets this), DATABASE_URL, JWT_SECRET, ALLOWED_ORIGINS.
 */
import { serve } from "@hono/node-server";
import app from "./app-vercel.js";

const port = Number(process.env.PORT) || 3000;

serve(
  { fetch: app.fetch, port },
  (info) => {
    console.log(`Server listening on http://${info.address}:${info.port}`);
  }
);
