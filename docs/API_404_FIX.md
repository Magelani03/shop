# Fix: 404 on /api/auth/register (or other /api/*)

The browser is requesting `/api/auth/register` but getting **404**. That means the request is either going to a host that has no API, or the API route is not being hit.

---

## 1. Check which URL is actually called

In the browser: **Sign up page** → open **Developer Tools (F12)** → **Network** tab → try to register.

- Find the request to `register` (or `auth/register`).
- Look at **Request URL** (full URL).

**If the URL is:**

- `https://your-frontend.pages.dev/api/auth/register`  
  → Request is going to **Cloudflare Pages**. Pages only serve static files; there is no API there → **404**.  
  **Fix:** Build the frontend with the API base URL and redeploy (see step 2).

- `https://your-vercel-app.vercel.app/api/auth/register`  
  → Request is going to your **Vercel** app.  
  - If this is the **same** Vercel project that contains the `api/` folder: the API should answer. If you still get 404, check step 3.  
  - If this is a **different** Vercel project (frontend-only, no `api/` in that repo): that project has no API → **404**.  
  **Fix:** Set `VITE_API_ORIGIN` to the URL of the project that **does** have the API, then rebuild and redeploy the frontend (step 2).

**Quick check:** Open **`https://your-vercel-app.vercel.app/api/health`** in the browser.  
- If you see JSON like `{"status":"ok","from":"api/health.ts",...}` → the `api/` folder is deployed; the problem is likely the catch-all route for `/api/auth/register`.  
- If you get **404** → the `api/` folder is not deployed: check **Root Directory** (must be repo root so `api/` is included) and redeploy.

---

## 2. Set the API base URL when frontend and API are on different hosts

If the **frontend** (e.g. Cloudflare Pages or a frontend-only Vercel project) and the **API** (this repo’s `api/` on Vercel or Render) are on **different** URLs:

1. In the **frontend** project (Pages or Vercel):
   - **Environment variables** → add:
   - **Name:** `VITE_API_ORIGIN`
   - **Value:** backend base URL, e.g. `https://your-api-project.vercel.app` or `https://your-service.onrender.com`  
     (no trailing slash, no `/api`)
2. **Redeploy the frontend** (new build) so the new value is baked in.

Then the app will call `https://your-api.../api/auth/register` instead of the frontend host → 404 should go away.

---

## 3. Same Vercel project (frontend + API in one repo)

If you deploy **this repo** as a **single** Vercel project:

- The same project serves both the static site (`dist/`) and the API (`api/`).
- You **do not** need `VITE_API_ORIGIN`; the app uses relative `/api/...` and they go to the same domain.

If you still get 404:

1. Open **`https://your-project.vercel.app/api/health`** in the browser.  
   - If you see `{"status":"ok",...}` → API is working; the 404 may be path or method (e.g. POST).  
   - If you get 404 there too → the API is not deployed or not routed.

2. In **Vercel Dashboard** → your project → **Deployments** → latest deployment:
   - Confirm the deploy succeeded.
   - In **Building** or **Functions**, confirm that the `api` directory / serverless functions are present.

3. **Redeploy** once (e.g. **Redeploy** from the latest deployment) and test again.

---

## Summary

| Where the frontend runs | Where the API runs        | What to do |
|-------------------------|---------------------------|------------|
| Same Vercel project     | Same project (`api/`)     | No `VITE_API_ORIGIN`. Check `/api/health` and deploy. |
| Pages / other host      | Vercel or Render         | Set `VITE_API_ORIGIN` = backend URL, rebuild & redeploy frontend. |
| Second Vercel project   | First Vercel project      | Set `VITE_API_ORIGIN` = first project URL, rebuild & redeploy. |
