# Glossary: Terms Used in This Project

A short reference for common terms you’ll see in the code and config.

---

## JavaScript / TypeScript basics

| Term | Meaning |
|------|--------|
| **const** | Declares a variable that cannot be reassigned. Use it for values that shouldn’t change (e.g. `const app = new Hono()`). |
| **let** | Declares a variable you can reassign later. Use when the value will change. |
| **var** | Old-style variable; avoid in modern code. Prefer `const` or `let`. |
| **async** | Marks a function as asynchronous. The function returns a **Promise** and can use **await** inside it. |
| **await** | Pauses an async function until a Promise resolves (e.g. `await fetch(...)` or `await prisma.user.findMany()`). Only valid inside an **async** function. |
| **Promise** | Represents a value (or error) that will be available later (e.g. after a network request or DB call). |
| **=>** (arrow function) | Shorthand for a function. `(x) => x * 2` is like `function(x) { return x * 2; }`. |
| **export** | Makes a variable, function, or class available to other files that **import** it. |
| **import** | Brings in something that was **export**ed from another file or package. |
| **default export** | The main thing a file exports (e.g. `export default app`). Imported without curly braces: `import app from "./app"`. |
| **type** / **interface** | Describes the shape of data (TypeScript). Helps with autocomplete and catching mistakes. |

---

## Environment & config

| Term | Meaning |
|------|--------|
| **env** / **environment** | Where the app runs (e.g. “development” on your machine, “production” on Vercel). |
| **environment variable** | A setting read from the environment (e.g. `DATABASE_URL`, `JWT_SECRET`). Stored in `.env` locally or in Vercel/Neon dashboards in production. Not committed to git. |
| **.env** | File that holds environment variables for local development. Usually in `.gitignore`. |
| **process.env** | In Node.js, the object that holds environment variables (e.g. `process.env.DATABASE_URL`). |

---

## Auth & security

| Term | Meaning |
|------|--------|
| **JWT** | JSON Web Token. A signed string that encodes user info (e.g. user id, role). The server signs it with **JWT_SECRET**; clients send it in the `Authorization` header. |
| **JWT_SECRET** | A secret string used to sign and verify JWTs. Must be the same on the server everywhere and must not be shared or committed. |
| **Authorization header** | HTTP header often used to send a token, e.g. `Authorization: Bearer <jwt>`. |
| **hash** / **hashing** | One-way transformation of data (e.g. password). You store the hash, not the plain password; **bcrypt** is commonly used for passwords. |
| **bcrypt** | Library used to hash passwords so they can be stored safely and checked on login. |

---

## API & HTTP

| Term | Meaning |
|------|--------|
| **API** | Application Programming Interface. Here, the backend routes (e.g. `/api/auth/login`, `/api/products`) that the frontend calls. |
| **endpoint** | One API URL + method (e.g. `POST /api/auth/register`). |
| **REST** | Style of API using URLs and HTTP methods (GET, POST, PUT, DELETE, etc.). |
| **request** | What the client sends: URL, method (GET, POST, etc.), headers, and sometimes a body (JSON). |
| **response** | What the server sends back: status code (200, 404, 500), headers, and often a body (JSON). |
| **status code** | Number that indicates result: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error. |
| **preflight** | Browser sends an **OPTIONS** request before some cross-origin requests (CORS). The server must respond with 2xx and CORS headers. |
| **CORS** | Cross-Origin Resource Sharing. Rules that allow a frontend (e.g. on `shop-5ns.pages.dev`) to call an API on another domain (e.g. `shop-pearl-beta.vercel.app`). |

---

## Database

| Term | Meaning |
|------|--------|
| **Prisma** | ORM (Object–Relational Mapper): you define models in **schema.prisma** and use JavaScript/TypeScript (e.g. `prisma.user.findMany()`) instead of raw SQL. |
| **schema** | Definition of your data: tables (models), columns, and relations. In this project, `prisma/schema.prisma`. |
| **migration** | A change to the database structure (new table, new column, etc.). Prisma can generate and run migrations. |
| **seed** | Script that fills the database with initial or demo data (e.g. admin user, sample products). `npx prisma db seed`. |
| **DATABASE_URL** | Environment variable that holds the DB connection string (e.g. Neon PostgreSQL URL). |

---

## Backend (Hono / Node)

| Term | Meaning |
|------|--------|
| **middleware** | Code that runs for (almost) every request before or after the route handler. Used for CORS, auth, logging, etc. |
| **route** | Mapping from a path + method to a handler (e.g. `POST /api/auth/login` → login handler). |
| **handler** | Function that runs for a given route and returns a response. |
| **context (c)** | In Hono, the object passed to handlers and middleware. Holds request, helpers to read headers/body, and ways to set response and variables. |
| **serverless** | Code runs in short-lived functions (e.g. Vercel) instead of a long-running server. Each request can start a new “instance.” |

---

## Frontend (React / Vite)

| Term | Meaning |
|------|--------|
| **component** | Reusable piece of UI (e.g. a button, a form, a page). In React, a function that returns JSX. |
| **hook** | React function that adds state or side effects. Names usually start with `use` (e.g. `useState`, `useEffect`). |
| **state** | Data that can change and that, when updated, causes the UI to re-render. |
| **props** | Data passed from a parent component to a child (e.g. `<Button label="Submit" />` → `label` is a prop). |
| **Vite** | Build tool for the frontend: dev server, bundling, and production build. |
| **build** | Process of turning source code into optimized files for production (e.g. `dist/`). |

---

## Deployment

| Term | Meaning |
|------|--------|
| **Vercel** | Hosting used here for the API (serverless) and optionally the frontend. |
| **Cloudflare Pages** | Hosting used here for the frontend (static site). |
| **Neon** | Serverless PostgreSQL used here as the database. |
| **origin** | The scheme + host + port of a URL (e.g. `https://shop-5ns.pages.dev`). CORS is defined per origin. |
| **ALLOWED_ORIGINS** | Comma-separated list of frontend origins that are allowed to call the API (CORS). |

---

## Other

| Term | Meaning |
|------|--------|
| **npm** / **npx** | **npm**: package manager (install deps). **npx**: run a package without installing it globally (e.g. `npx prisma db push`). |
| **dependency** | External package the project uses (listed in `package.json`). |
| **singleton** | A single shared instance (e.g. one Prisma client reused across serverless invocations to avoid too many DB connections). |
