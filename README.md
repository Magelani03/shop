If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up the database (required for auth, orders, products).
# Set DATABASE_URL in .env to your PostgreSQL URL (e.g. Neon), then:
npx prisma migrate dev
npx prisma db seed

# Step 5: Start the API (in one terminal).
npx vercel dev

# Step 6: Start the frontend (in another terminal).
npm run dev
```

**Important:** The app uses PostgreSQL (e.g. Neon, Vercel Postgres). Set `DATABASE_URL` in `.env`, then run `npx prisma migrate dev` and `npx prisma db seed` once. Use `npx vercel dev` for the API locally.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


# shop
