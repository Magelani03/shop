# Tech Stack & Deployment

This document lists the tools, frameworks, and technologies used in this project and why they were chosen. It also explains how to run the site on Cloudflare.

---

## Frontend

### React 18
- **What it is:** A JavaScript library for building user interfaces with components and declarative UI.
- **Why we use it:** Industry standard for SPAs; large ecosystem, good performance, and works well with Vite and the rest of the stack.

### TypeScript
- **What it is:** Typed superset of JavaScript that compiles to JavaScript.
- **Why we use it:** Catches bugs at build time, improves editor support, and makes the codebase easier to maintain as it grows.

### Vite
- **What it is:** Build tool and dev server (ESM-based, Rollup for production).
- **Why we use it:** Fast HMR, quick cold start, simple config, and first-class support for React and TypeScript. Replaces Create React App / Webpack for a lighter, faster setup.

### React Router v6
- **What it is:** Client-side routing for React (routes, links, navigation).
- **Why we use it:** Handles URLs and layout (e.g. `/`, `/products`, `/profile`, `/admin`) without full page reloads.

### Tailwind CSS
- **What it is:** Utility-first CSS framework (classes like `flex`, `rounded-lg`, `text-primary`).
- **Why we use it:** Rapid UI building, consistent design tokens, small production CSS when purged, and no separate CSS files for most components.

### shadcn/ui (Radix UI + Tailwind)
- **What it is:** Copy-paste component library built on Radix UI primitives and Tailwind.
- **Why we use it:** Accessible, customizable components (buttons, inputs, dialogs, etc.) without a heavy runtime dependency; we own the code in the repo.

### Zustand
- **What it is:** Small state management library (stores, no boilerplate).
- **Why we use it:** Manages global state (cart, auth, orders, settings) with a simple API and optional persistence (e.g. cart and auth in `localStorage`).

### TanStack Query (React Query)
- **What it is:** Library for fetching, caching, and updating server state.
- **Why we use it:** Used where we need server-state caching and refetching; complements Zustand for client state.

### Lucide React
- **What it is:** Icon set as React components.
- **Why we use it:** Consistent, tree-shakeable icons (cart, user, admin, etc.) with minimal bundle impact.

### Sonner
- **What it is:** Toast notification library.
- **Why we use it:** Simple API for success/error toasts (e.g. after login, profile update, checkout).

### Zod
- **What it is:** Schema validation library (runtime type checking).
- **Why we use it:** Validates API payloads and forms; used with React Hook Form resolvers where applicable.

### Other frontend libs
- **React Hook Form** – Form state and validation.
- **class-variance-authority (cva)** / **clsx** / **tailwind-merge** – Component variants and class merging (e.g. for buttons).
- **date-fns** – Date formatting (e.g. order dates).
- **Recharts** – Charts on the admin analytics page.

---

## Backend / API

### Hono
- **What it is:** Lightweight web framework (routes, middleware, request/response).
- **Why we use it:** Designed for edge runtimes (e.g. Cloudflare Workers), small bundle, and familiar Express-like API. Fits Workers + D1 better than Express.

### Cloudflare Workers
- **What it is:** Serverless execution environment on Cloudflare’s edge.
- **Why we use it:** Runs the API (Hono app) globally with no server to manage; scales automatically and pairs with D1 and Wrangler.

### Prisma
- **What it is:** ORM and schema tool (models, migrations, type-safe client).
- **Why we use it:** Type-safe database access, clear schema in `prisma/schema.prisma`, and a single API for local SQLite and D1.

### Prisma adapter for D1
- **What it is:** `@prisma/adapter-d1` – connects Prisma Client to Cloudflare D1.
- **Why we use it:** Lets us use Prisma’s API while D1 provides the actual SQLite database (local file or Cloudflare-hosted).

### JWT (jsonwebtoken)
- **What it is:** Creation and verification of JSON Web Tokens.
- **Why we use it:** Stateless auth: login returns a JWT; protected routes verify the token and load the user.

### bcryptjs
- **What it is:** Hashing for passwords.
- **Why we use it:** Passwords are hashed before storage and compared on login; no plain-text passwords in the database.

---

## Database

### Cloudflare D1
- **What it is:** Serverless SQL database (SQLite) on Cloudflare.
- **Why we use it:** Works with Workers, no separate DB host, and supports local dev (SQLite file) and production (D1 in the cloud) via the same Prisma schema.

### SQLite (via D1)
- **What it is:** Embedded relational database (single file or D1-backed).
- **Why we use it:** Schema and migrations are SQLite-compatible; D1 is SQLite at the edge, so one schema fits local and production.

---

## DevOps / Tooling

### Wrangler
- **What it is:** CLI for Cloudflare Workers, D1, and Pages.
- **Why we use it:** Run the Worker locally (`wrangler dev`), run D1 migrations and seeds (`wrangler d1 execute`), and deploy the Worker and D1. Required for this stack.

### ESLint
- **What it is:** Linter for JavaScript/TypeScript.
- **Why we use it:** Enforces code style and catches common mistakes.

### npm scripts
- **Key scripts:** `dev` (Vite frontend), `worker:dev` (API on port 4000), `db:setup:local` (migrate + seed local D1), `build` (Vite build), `worker:deploy`, `pages:deploy`.

---

## Summary Table

| Layer        | Technology        | Purpose                          |
|-------------|-------------------|----------------------------------|
| UI          | React 18          | Components and UI                |
| Language    | TypeScript        | Types and safety                  |
| Build       | Vite              | Dev server and production build   |
| Routing     | React Router v6   | Client-side routes                |
| Styling     | Tailwind CSS      | Utility CSS                      |
| Components  | shadcn/Radix      | Buttons, inputs, dialogs, etc.    |
| State       | Zustand           | Cart, auth, orders                |
| API layer   | Hono              | HTTP API and middleware           |
| Runtime     | Cloudflare Workers| Run API at the edge               |
| Database    | D1 (SQLite)       | Persistent data                  |
| ORM         | Prisma + D1 adapter| Type-safe DB access              |
| Auth        | JWT + bcryptjs    | Login and protected routes       |
| Deploy      | Wrangler          | Workers, D1, and Pages            |

---

# Deploying to Cloudflare (Run on the Cloud)

To run the full site on Cloudflare you deploy two things: the **API** (Worker + D1) and the **frontend** (Pages). The frontend talks to the API using an environment variable so it works from any domain.

## Prerequisites

- Node.js and npm installed.
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed (`npm i -g wrangler` or use `npx wrangler`).
- A Cloudflare account. Log in with: `wrangler login`.

---

## Step 1: Create a D1 database (production)

1. In the [Cloudflare dashboard](https://dash.cloudflare.com), go to **Workers & Pages** → **D1** → **Create database**.
2. Name it (e.g. `shop-db-v2`) and create it.
3. Open the database and copy its **Database ID** (UUID).

Update `wrangler.jsonc` with this ID:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "shop-db-v2",
    "database_id": "YOUR_REAL_DATABASE_ID_HERE"
  }
]
```

Replace `YOUR_REAL_DATABASE_ID_HERE` with the ID from the dashboard.

---

## Step 2: Set production secrets and vars

Use a **strong random value** for JWT in production (e.g. `openssl rand -base64 32`):

```bash
wrangler secret put JWT_SECRET
```

When prompted, paste your secret.

Set the admin WhatsApp number (optional; can also be set in DB Settings):

```bash
wrangler secret put ADMIN_WHATSAPP
# Enter e.g. +264814680418
```

If your frontend will be on a different domain than the Worker, set allowed origins (comma-separated, no spaces):

```bash
wrangler secret put ALLOWED_ORIGINS
# e.g. https://your-shop.pages.dev,https://yourdomain.com
```

---

## Step 3: Run migrations and seed on the production D1

From the project root:

```bash
wrangler d1 execute shop-db-v2 --remote --file=./prisma/d1_migration.sql
wrangler d1 execute shop-db-v2 --remote --file=./prisma/seed_d1.sql
```

If the migration fails because tables already exist, that’s okay; ensure the seed ran so you have admin user, products, and settings.

---

## Step 4: Deploy the API (Worker)

```bash
npm run worker:deploy
```

Note the Worker URL (e.g. `https://shop-api.<your-subdomain>.workers.dev`). The frontend will call this URL in production.

---

## Step 5: Deploy the frontend (Pages)

The frontend must know the API URL in production. We use the `VITE_API_ORIGIN` environment variable.

1. Build with the production API URL (replace with your real Worker URL):

   **PowerShell:**
   ```powershell
   $env:VITE_API_ORIGIN="https://shop-api.<your-subdomain>.workers.dev"; npm run build
   ```

   **Bash:**
   ```bash
   VITE_API_ORIGIN=https://shop-api.<your-subdomain>.workers.dev npm run build
   ```

2. Deploy the built output to Cloudflare Pages:

   ```bash
   npx wrangler pages deploy ./dist --project-name=shop
   ```

   If the Pages project doesn’t exist yet, create it in the dashboard (**Workers & Pages** → **Create** → **Pages** → **Connect to Git** or **Direct Upload**). For direct upload, use the same `wrangler pages deploy ./dist --project-name=shop` (project name must match).

3. **If you use Git integration:** set `VITE_API_ORIGIN` in the Pages project settings (**Settings** → **Environment variables**) for the Production environment, then trigger a new build so the build step uses it.

---

## Step 6: Allow the frontend origin in the Worker

Ensure the Worker allows your frontend origin in CORS. If you set `ALLOWED_ORIGINS` in Step 2 to your Pages URL (and custom domain if any), you’re set. Otherwise add the Pages URL (e.g. `https://shop.pages.dev`) to `ALLOWED_ORIGINS` and redeploy the Worker.

---

## Step 7: Optional – Custom domain

- **Worker (API):** In the dashboard, open your Worker → **Settings** → **Triggers** → **Custom Domains** (e.g. `api.yourdomain.com`).
- **Pages (frontend):** In the Pages project → **Custom domains** (e.g. `www.yourdomain.com`).

Then set `VITE_API_ORIGIN` to your API domain (e.g. `https://api.yourdomain.com`) and rebuild/redeploy the frontend.

---

## Quick reference after first deploy

| Task | Command |
|------|--------|
| Deploy API | `npm run worker:deploy` |
| Deploy frontend | Set `VITE_API_ORIGIN`, then `npm run build` and `npx wrangler pages deploy ./dist --project-name=shop` |
| Run DB migration (remote) | `wrangler d1 execute shop-db-v2 --remote --file=./prisma/d1_migration.sql` |
| Seed DB (remote) | `wrangler d1 execute shop-db-v2 --remote --file=./prisma/seed_d1.sql` |

---

## Making the frontend use the API URL in production

The app uses relative `/api` URLs in development (Vite proxies to the Worker). In production, the frontend is served from Pages and must call the Worker URL. Adding a small helper in `src/lib/api.ts` and using it in all `fetch` calls ensures that when `VITE_API_ORIGIN` is set (at build time), all API requests go to the deployed Worker. The codebase already uses `VITE_API_ORIGIN`: `src/lib/api.ts` and `src/lib/store.ts` prefix all API requests with this value when it is set at build time, so the same app works in dev (relative `/api` via Vite proxy) and in production (Worker URL).
