# Deploy checklist — Backend on Vercel, Frontend on Cloudflare Pages

- **API (backend):** Vercel serverless + PostgreSQL  
- **Frontend:** Cloudflare Pages  
- **Database:** PostgreSQL (e.g. Vercel Postgres, Neon, Supabase)

---

## One-time setup

### 1. Database (PostgreSQL)

Create a Postgres database and get its connection URL:

- **Vercel Postgres:** [Vercel Dashboard](https://vercel.com/dashboard) → Storage → Create Database → Postgres → copy `POSTGRES_URL` (or `DATABASE_URL`).
- Or use [Neon](https://neon.tech) / [Supabase](https://supabase.com) and copy the connection string.

Set this as `DATABASE_URL` in your Vercel project (see step 3).

### 2. Run migrations and seed (local, with your DB URL)

```powershell
cd c:\Users\shish\shop
$env:DATABASE_URL = "postgresql://user:password@host:5432/dbname?sslmode=require"
npx prisma migrate dev --name init
npx prisma db seed
```

Or run migrations on the hosted DB (e.g. Neon SQL editor or `prisma migrate deploy` with `DATABASE_URL` set).

### 3. Deploy API to Vercel

- Connect the repo to Vercel ([vercel.com](https://vercel.com) → Add New Project).
- In the project **Settings → Environment variables**, add:

| Name             | Value                    | Environment |
|------------------|--------------------------|-------------|
| `DATABASE_URL`   | Your Postgres URL        | All         |
| `JWT_SECRET`     | Strong random secret     | All         |
| `ALLOWED_ORIGINS`| Your frontend URL(s), comma-separated (e.g. `https://shop.pages.dev`) | Production (and Preview if needed) |
| `ADMIN_WHATSAPP` | Optional, e.g. `+1234567890` | All   |

- Deploy. Your API will be at `https://your-project.vercel.app/api` (e.g. `https://your-project.vercel.app/api/health`).

**Note:** Set `NODEJS_HELPERS=0` in Vercel if you see 500 errors on POST requests (see [Vercel / Hono docs](https://hono.dev/docs/getting-started/vercel)). It’s already in `vercel.json` for this project.

### 4. Frontend on Cloudflare Pages

- **Cloudflare:** Workers & Pages → Create → Pages → Connect to Git (or Direct Upload). Project name e.g. `shop`.
- In the Pages project **Settings → Build configuration**:
  - **Build command:** `npm run build` (or `npm ci && npm run build`).
  - **Build output directory:** `dist`.
- **Environment variables** (Production):
  - `VITE_API_ORIGIN` = your **Vercel** API URL, e.g. `https://your-project.vercel.app`  
    (no `/api` at the end — the app adds `/api` to paths).

---

## Deploy (every time)

**API (Vercel)**  
Push to the branch connected to Vercel, or run `vercel --prod` from the project root.

**Frontend (Cloudflare Pages)**  
Push to the branch connected to Pages, or build and upload:

```powershell
$env:VITE_API_ORIGIN = "https://your-project.vercel.app"
npm run build
npx wrangler pages deploy ./dist --project-name=shop
```

---

## After first deploy

- **Frontend:** `https://shop.pages.dev` (or your custom domain).
- **API:** `https://your-project.vercel.app/api` (or your Vercel URL).
- Ensure `ALLOWED_ORIGINS` in Vercel includes your frontend URL so CORS works.

---

## Local development

- **API:** Run the Vercel dev server (uses the same Hono app and `api/`):

  ```powershell
  npx vercel dev
  ```

  Set `.env` or `.env.local` with `DATABASE_URL`, `JWT_SECRET`, and optionally `ALLOWED_ORIGINS`.

- **Frontend:** `npm run dev` (Vite). Point the proxy or `VITE_API_ORIGIN` to `http://localhost:3000` if using `vercel dev`, so the app calls the local API.
