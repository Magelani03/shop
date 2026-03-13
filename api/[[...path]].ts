/**
 * Vercel serverless catch-all: all /api/* requests are handled by the Hono app.
 * Backend runs on Vercel with PostgreSQL (DATABASE_URL); set JWT_SECRET and ALLOWED_ORIGINS in Vercel env.
 */
import { handle } from "@hono/node-server/vercel";
import app from "../server/app-vercel";

export default handle(app);
