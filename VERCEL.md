# Setting up on Vercel

This project is already configured for Vercel. One deploy gives you both the **frontend** (from `dist/`) and the **API** (from `api/`).

---

## 1. Connect the repo

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. Click **Add New** → **Project**.
3. **Import** your Git repository (e.g. the `shop` repo).
4. Leave **Framework Preset** as **Vite** (or let Vercel detect it).
5. **Root Directory:** leave as `.` (repo root).
6. **Build and Output Settings** (usually auto-filled from `vercel.json`):
   - **Build Command:** `npm run build` (runs `prisma generate && vite build`)
   - **Output Directory:** `dist`
7. Click **Deploy** once to create the project (it may build the frontend only at first).

---

## 2. Add environment variables

In the project on Vercel:

1. Open the project → **Settings** → **Environment Variables**.
2. Add these (for **Production**, and **Preview** if you use preview URLs):

| Name | Value | Notes |
|------|--------|--------|
| `DATABASE_URL` | Your Postgres connection string | From Neon, Supabase, or Vercel Postgres |
| `JWT_SECRET` | A long random string | e.g. generate with `openssl rand -base64 32` |
| `ALLOWED_ORIGINS` | Your frontend URL(s) | e.g. `https://shop-5ns.pages.dev` or `https://your-app.vercel.app` (comma-separated if multiple) |
| `ADMIN_WHATSAPP` | Optional | e.g. `+1234567890` for order notifications |

3. **Save.** Redeploy so the new variables are used (Deployments → ⋮ on latest → **Redeploy**).

---

## 3. Database (if not done yet)

- Create a Postgres DB (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), or Vercel Postgres).
- Put the connection URL in `DATABASE_URL` on Vercel.
- Apply schema and seed **once** (from your machine or CI):

  ```powershell
  $env:DATABASE_URL = "postgresql://..."
  npx prisma db push
  npx prisma db seed
  ```

  Or run the SQL in `prisma/init-neon.sql` in your DB’s SQL editor, then run the seed from an environment that can reach the DB.

---

## 4. What runs on Vercel

- **Static site:** Everything in `dist/` is served at the root (e.g. `https://your-project.vercel.app/`).
- **API:** The `api/` folder is deployed as serverless functions. All requests to `/api/*` (e.g. `/api/health`, `/api/auth/login`, `/api/products`) are handled by the Hono app in `server/app-vercel.ts`.

So one Vercel project = **frontend + API** at the same domain.

---

## 5. Frontend pointing at this API

If the frontend is on **another host** (e.g. Cloudflare Pages):

- Set that host’s env var **`VITE_API_ORIGIN`** to your Vercel URL:  
  `https://your-project.vercel.app` (no trailing slash, no `/api`).

If the frontend is **on the same Vercel project** (same domain):

- The app can use relative URLs or `VITE_API_ORIGIN` = `https://your-project.vercel.app`. Add that URL to **ALLOWED_ORIGINS** so CORS allows it.

---

## 6. Check it works

- **Frontend:** Open `https://your-project.vercel.app`
- **API health:** Open `https://your-project.vercel.app/api/health` — you should see `{"status":"ok",...}`

---

## Troubleshooting

- **500 on POST /api/...**  
  `NODEJS_HELPERS=0` is already in `vercel.json`. If you overrode the build or env, ensure that variable is still set.

- **CORS errors from your frontend**  
  Add the frontend origin (e.g. `https://shop-5ns.pages.dev`) to **ALLOWED_ORIGINS** in Vercel. The repo also has CORS headers in `vercel.json` for `/api/*`.

- **“Table does not exist” / Prisma errors**  
  Run `prisma db push` (and optionally `prisma db seed`) against the same `DATABASE_URL` you set on Vercel, or apply `prisma/init-neon.sql` in your DB and seed.

More detail: [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md).
