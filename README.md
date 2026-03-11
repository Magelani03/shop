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

# Step 4: Set up the local database (required for auth, orders, products).
npm run db:setup:local

# Step 5: Start the API worker (in one terminal).
npm run worker:dev

# Step 6: Start the frontend (in another terminal).
npm run dev
```

**Important:** The app uses Cloudflare D1 (SQLite) for the database. For local development you must run `npm run db:setup:local` once before the API will store users, orders, or products. That command creates the tables and seeds sample data (admin user, products, settings).

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


# shop
