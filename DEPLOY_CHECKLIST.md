# Deploy checklist — Backend (Vercel or Render), Frontend on Cloudflare Pages

- **API (backend):** Vercel serverless **or** Render Web Service  
- **Frontend:** Cloudflare Pages  
- **Database:** PostgreSQL (e.g. Neon, Supabase, Vercel Postgres)

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

### 3b. Deploy API to Render (alternative to Vercel)

- Go to [Render](https://render.com) → Dashboard → New → Web Service.
- Connect your repo and select this project.
- **Build command:** `npm install && npx prisma generate`
- **Start command:** `npm run start:server`
- **Environment** (Environment Variables):

| Name             | Value                                                                 |
|-----------------|-----------------------------------------------------------------------|
| `DATABASE_URL`  | Your Postgres URL (e.g. Neon connection string)                       |
| `JWT_SECRET`    | Strong random secret                                                 |
| `ALLOWED_ORIGINS` | Your frontend URL(s), comma-separated (e.g. `https://shop-5ns.pages.dev`) |
| `ADMIN_WHATSAPP` | Optional, e.g. `+1234567890`                                         |

- Create Web Service. Your API will be at `https://shop-api-xxxx.onrender.com` (or the name you gave). Health check: `https://your-service.onrender.com/api/health`.

**Optional:** Use the repo’s `render.yaml` (Blueprint) to create the service with the same settings.

### 4. Frontend on Cloudflare Pages

- **Cloudflare:** Workers & Pages → Create → Pages → Connect to Git (or Direct Upload). Project name e.g. `shop`.
- In the Pages project **Settings → Build configuration**:
  - **Build command:** `npm run build` (or `npm ci && npm run build`).
  - **Build output directory:** `dist`.
- **Environment variables** (Production):
  - `VITE_API_ORIGIN` = your **backend** base URL (Vercel or Render), e.g. `https://your-project.vercel.app` or `https://shop-api-xxxx.onrender.com`  
    (no trailing slash, no `/api` — the app adds `/api` to paths).

---

## Deploy (every time)

**API (Vercel)**  
Push to the branch connected to Vercel, or run `vercel --prod` from the project root.

**API (Render)**  
Push to the branch connected to Render; Render will rebuild and redeploy automatically.

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
- **API (Vercel):** `https://your-project.vercel.app/api` — or **(Render):** `https://your-service.onrender.com/api`.
- Ensure `ALLOWED_ORIGINS` on your backend (Vercel or Render) includes your frontend URL so CORS works.

---

## Local development

- **API (Vercel-style):** `npx vercel dev` — uses the same Hono app and `api/`. Set `.env` with `DATABASE_URL`, `JWT_SECRET`, and optionally `ALLOWED_ORIGINS`.

- **API (Node, same as Render):** `npm run start:server` — runs the backend on `http://localhost:3000`. Set `.env` with `DATABASE_URL`, `JWT_SECRET`, and optionally `ALLOWED_ORIGINS`.

- **Frontend:** `npm run dev` (Vite). Set `VITE_API_ORIGIN=http://localhost:3000` (or the URL where the API runs) so the app calls the local API.
