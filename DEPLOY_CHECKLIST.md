# Deploy checklist

Use this with [TECH_STACK.md](./TECH_STACK.md) (full Cloudflare deployment guide).

---

## One-time setup

1. **Cloudflare account & Wrangler**
   - Sign up at [Cloudflare](https://dash.cloudflare.com).
   - Install Wrangler: `npm i -g wrangler` (or use `npx wrangler`).
   - Log in: `wrangler login`.

2. **D1 database**
   - Dashboard → **Workers & Pages** → **D1** → **Create database** (e.g. name: `shop-db-v2`).
   - Copy the **Database ID** and put it in `wrangler.jsonc` under `d1_databases[0].database_id` (replace the existing value if you created a new DB).

3. **Secrets (production)**
   ```powershell
   wrangler secret put JWT_SECRET    # use a strong random value, e.g. openssl rand -base64 32
   wrangler secret put ADMIN_WHATSAPP   # e.g. +264814680418
   wrangler secret put ALLOWED_ORIGINS  # e.g. https://shop.pages.dev,https://yourdomain.com
   ```

4. **Run migrations and seed on production D1**
   ```powershell
   wrangler d1 execute shop-db-v2 --remote --file=./prisma/d1_migration.sql
   wrangler d1 execute shop-db-v2 --remote --file=./prisma/seed_d1.sql
   ```

5. **Create Pages project (if needed)**  
   Dashboard → **Workers & Pages** → **Create** → **Pages** → **Direct Upload** (or **Connect to Git**). Project name: `shop` (must match `--project-name=shop`).

6. **If using Pages with Git:** In the Pages project → **Settings** → **Builds & deployments** → **Build configuration**:
   - **Build command:** `npm run build` (or `npm ci && npm run build` for a clean install).
   - **Build output directory:** `dist`.
   - Add **Environment variable** `VITE_API_ORIGIN` = your Worker URL (e.g. `https://shop-api.<subdomain>.workers.dev`) for **Production** (and Preview if needed).  
   The repo uses `package-lock.json` only (no `bun.lockb`) so Cloudflare will use npm.

---

## Deploy (every time)

**Option A – Script (API + frontend)**

From project root:

```powershell
# Deploy API, then build and deploy frontend (you'll need the Worker URL for the frontend)
.\scripts\deploy.ps1
```

After the API deploys, the script will ask for the Worker URL. Or pass it so the frontend build uses it:

```powershell
.\scripts\deploy.ps1 -WorkerUrl "https://shop-api.YOUR-SUBDOMAIN.workers.dev"
```

**Option B – Manual**

```powershell
# 1. Deploy API
npm run worker:deploy

# 2. Build frontend with your Worker URL, then deploy Pages
$env:VITE_API_ORIGIN = "https://shop-api.YOUR-SUBDOMAIN.workers.dev"
npm run build
npm run pages:deploy
```

**Only API:** `.\scripts\deploy.ps1 -ApiOnly` or `npm run worker:deploy`  
**Only frontend:** `.\scripts\deploy.ps1 -FrontendOnly -WorkerUrl "https://shop-api.xxx.workers.dev"`

---

## After first deploy

- **Frontend:** `https://shop.pages.dev` (or your custom domain).
- **API:** `https://shop-api.<your-subdomain>.workers.dev` (or custom domain).
- Ensure `ALLOWED_ORIGINS` includes your frontend URL so CORS works.
