/**
 * Cloudflare Worker entry (optional). The API is now deployed on Vercel.
 * This stub is kept so wrangler can still build; it returns a redirect message.
 * For the full API, use the Vercel app (server/app-vercel.ts) and api/[[...path]].ts.
 */
import { Hono } from "hono";

const app = new Hono();

app.all("*", (c) => {
  return c.json(
    {
      message: "API is hosted on Vercel. Point your frontend VITE_API_ORIGIN to your Vercel deployment URL (e.g. https://your-project.vercel.app).",
      docs: "See DEPLOY_CHECKLIST.md and TECH_STACK.md",
    },
    200,
    { "Content-Type": "application/json" }
  );
});

export default app;
