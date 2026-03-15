# Deploying the backend on Render

Use this when creating or fixing the **Web Service** for the API.

---

## If the app “exited early” or logs show “Running 'npm run'”

Render is using the wrong **Start Command**. Fix it:

1. Open [Render Dashboard](https://dashboard.render.com) → your **Web Service** (e.g. shop-api).
2. Go to **Settings** (left sidebar).
3. Find **Build & Deploy** → **Start Command**.
4. Set it to exactly:
   ```bash
   npm start
   ```
5. Click **Save Changes**. Render will redeploy with the new command.

After that, the service should stay up and respond at `https://<your-service>.onrender.com/api/health`.

---

## New Web Service – required fields

| Field | Value |
|-------|--------|
| **Build Command** | `npm install && npx prisma generate` |
| **Start Command** | `npm start` |
| **Environment Variables** | `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS` (optional: `ADMIN_WHATSAPP`) |

See [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) for full setup and env var details.
