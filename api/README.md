# API (Vercel)

The backend is served from this folder when you deploy to **Vercel**.

- **`api/[[...path]].ts`** — Catch-all that runs the Hono app (`server/app-vercel.ts`). All `/api/*` requests (e.g. `/api/health`, `/api/products`, `/api/auth/login`) are handled here.
- **Database:** PostgreSQL. Set `DATABASE_URL` in Vercel to your Postgres connection string (Vercel Postgres, Neon, Supabase, etc.).
- **Secrets:** In Vercel project settings, set `JWT_SECRET` and `ALLOWED_ORIGINS` (see [DEPLOY_CHECKLIST.md](../DEPLOY_CHECKLIST.md)).

Frontend on Cloudflare Pages should set `VITE_API_ORIGIN` to your Vercel URL (e.g. `https://your-project.vercel.app`).
