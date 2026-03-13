# Tech Stack & Deployment

This document lists the tools, frameworks, and technologies used in this project and why they were chosen.

**Current deployment:** **Backend (API)** runs on **Vercel** with **PostgreSQL**. **Frontend** runs on **Cloudflare Pages**. See [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) for step-by-step deploy instructions.

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
- **Why we use it:** Small bundle, familiar Express-like API; runs on Vercel serverless via `@hono/node-server/vercel`.

### Vercel (API hosting)
- **What it is:** Serverless functions and hosting (Node.js).
- **Why we use it:** Hosts the Hono API in `api/[[...path]].ts`; same codebase runs locally with `vercel dev` and in production. Pairs with PostgreSQL (Vercel Postgres, Neon, or Supabase).

### Prisma
- **What it is:** ORM and schema tool (models, migrations, type-safe client).
- **Why we use it:** Type-safe database access with a single schema in `prisma/schema.prisma`. Production uses **PostgreSQL** (Vercel, Neon, Supabase, etc.).

### JWT (jsonwebtoken)
- **What it is:** Creation and verification of JSON Web Tokens.
- **Why we use it:** Stateless auth: login returns a JWT; protected routes verify the token and load the user.

### bcryptjs
- **What it is:** Hashing for passwords.
- **Why we use it:** Passwords are hashed before storage and compared on login; no plain-text passwords in the database.

---

## Database

### PostgreSQL
- **What it is:** Relational database (hosted e.g. by Vercel Postgres, Neon, Supabase).
- **Why we use it:** Single Prisma schema with `provider = "postgresql"`; `DATABASE_URL` points to your Postgres instance. Run `prisma migrate dev` and `prisma db seed` to set up.

---

## DevOps / Tooling

### Wrangler
- **What it is:** CLI for Cloudflare Pages (optional).
- **Why we use it:** Deploy the frontend to Cloudflare Pages with `wrangler pages deploy ./dist --project-name=shop`. The API and database are on Vercel.

### ESLint
- **What it is:** Linter for JavaScript/TypeScript.
- **Why we use it:** Enforces code style and catches common mistakes.

### npm scripts
- **Key scripts:** `dev` (Vite frontend), `build` (Prisma generate + Vite build), `prisma:migrate`, `pages:deploy` (frontend to Cloudflare Pages). API on Vercel: `npx vercel dev` locally.

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
| Runtime     | Vercel (Node)     | Serverless API                   |
| Database    | PostgreSQL        | Persistent data (Neon, etc.)     |
| ORM         | Prisma            | Type-safe DB access              |
| Auth        | JWT + bcryptjs    | Login and protected routes       |
| Deploy      | Vercel + Wrangler | API on Vercel; frontend on Pages |

---

# Deployment

**API and database:** Vercel (PostgreSQL). See [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md).

**Frontend:** Cloudflare Pages. Set `VITE_API_ORIGIN` to your Vercel URL in Pages project settings. The app uses it in `src/lib/api.ts` and `src/lib/store.ts`.

