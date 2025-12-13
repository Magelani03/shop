# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Lovable-generated single-page shopping website built with Vite, React, TypeScript, Tailwind CSS, shadcn-ui, and Radix UI primitives. Routing is handled with `react-router-dom`, state with `zustand`, and data-fetching infrastructure is set up via `@tanstack/react-query`.

The app is entirely client-side and uses static product data under `src/lib`; there is no backend service layer in this repo.

## Common Commands

All commands assume the working directory is the project root.

### Install dependencies

```sh
npm install
```

### Run the dev server

```sh
npm run dev
```

Vite is configured in `vite.config.ts` to:
- Listen on all interfaces (`host: "::"`)
- Use port `8080`
- Expose the `@` alias pointing to `src/`

### Build for production

```sh
npm run build
```

There is also a development-mode build (useful for some debugging workflows):

```sh
npm run build:dev
```

### Preview a production build

After `npm run build`:

```sh
npm run preview
```

### Lint the codebase

```sh
npm run lint
```

This runs ESLint over the entire project (`eslint .`). The lint config is based on `@eslint/js`, `typescript-eslint`, and React plugins.

### Running tests

There is no test runner configured in this repository (no Vitest/Jest setup or `test` npm script). If you need tests, you will first need to add a test runner and scripts to `package.json`.

## High-Level Architecture

### Entry point and app shell

- `src/main.tsx` is the React entry point. It mounts `<App />` into the `root` DOM element and imports global styles from `index.css`.
- `src/App.tsx` wires up application-wide providers and routing:
  - Wraps the app with `QueryClientProvider` from `@tanstack/react-query` (ready for future data fetching and caching).
  - Wraps UI with `TooltipProvider` and two toast systems (`@/components/ui/toaster` and `@/components/ui/sonner`).
  - Configures `BrowserRouter` and `Routes` for all top-level pages.

The main route configuration lives entirely in `App.tsx`; any new pages should be added there.

### Routing and pages

Routing uses `react-router-dom` with a fairly simple flat structure:

- `/` → `src/pages/Index.tsx` (marketing-style landing page with featured products)
- `/products` → `src/pages/Products.tsx` (browsing and filtering of all products)
- `/product/:id` → `src/pages/ProductDetail.tsx` (detail view for a single product)
- `/cart` → `src/pages/Cart.tsx` (shopping cart)
- `/profile` → `src/pages/Profile.tsx`
- `/about` → `src/pages/About.tsx`
- `/contact` → `src/pages/Contact.tsx`
- `/sales` → `src/pages/Sales.tsx`
- `/login` → `src/pages/Auth/Login.tsx`
- `/signup` → `src/pages/Auth/SignUp.tsx`
- Fallback `*` → `src/pages/NotFound.tsx`

The route elements are plain React components; there is no nested routing in `react-router-dom` terms. Layout composition is done inside the page components themselves (see below), not via nested routes.

### Layout system

There are two primary layout components under `src/components/layout`:

- `Layout.tsx`
  - Wraps content with a top `Navbar` and `Footer` and provides a standard page layout (`min-h-screen`, flex column).
  - Used by pages that follow the main marketing layout (e.g. `Index.tsx`).

- `SidebarLayout.tsx`
  - Provides an alternate layout with a compact header (logo + search + logout icon), a persistent vertical `Sidebar` on the left, and a `Footer` at the bottom of the main content area.
  - Used by more dashboard-like pages (e.g. `Products.tsx`, and likely `Profile.tsx` and others that want a sidebar).

Supporting layout components:

- `Navbar.tsx`
  - Top navigation bar for the main layout.
  - Uses `useLocation` to highlight the active route.
  - Shows a search input, login link, and a cart icon with a badge for total items from the cart store.

- `Sidebar.tsx`
  - Vertical navigation used inside `SidebarLayout`.
  - Uses `useLocation` to determine the active nav item and highlights accordingly.
  - Uses `cn` from `src/lib/utils` for conditional className composition.

- `Footer.tsx`
  - Shared footer component used by both `Layout` and `SidebarLayout`.

When creating new pages, choose between `Layout` and `SidebarLayout` depending on whether the page should look like a marketing page or a dashboard/management screen.

### State management (cart and user)

Global client-side state is handled with `zustand` in `src/lib/store.ts`.

#### Cart store

- Types:
  - `Product` — canonical product shape used across the app.
  - `CartItem` — extends `Product` with a `quantity` field.
- Store interface `CartStore` includes:
  - `items: CartItem[]`
  - `addToCart(product: Product)`
  - `removeFromCart(productId: number)`
  - `updateQuantity(productId: number, quantity: number)`
  - `clearCart()`
  - `getTotalItems()` → total quantity across all cart items.
  - `getTotalPrice()` → subtotal based on `price * quantity` for each item.

The hook `useCartStore` is the single source of truth for cart state. Components such as `Navbar` (cart badge), `Cart` page, and `ProductCard` use this hook to read and mutate cart data.

#### User store (mock auth)

Also in `src/lib/store.ts`, `useUserStore` implements a simple, fully client-side mock authentication layer:

- State:
  - `isAuthenticated`
  - `user` object with `name`, `email`, `phone`, and optional `avatar`.
- Methods:
  - `login(email, password)` — sets a hard-coded user profile if credentials are non-empty and returns `true`.
  - `signup(name, email, password)` — creates a basic user profile and returns `true`.
  - `logout()` — clears auth state.

This is not connected to any backend; it is intended as a placeholder for a real auth integration.

### Product data and domain helpers

`src/lib/products.ts` serves as an in-memory catalog and simple domain helper module:

- Imports all product images from `src/assets/products`.
- Exports a `products` array of `Product`-shaped objects with fields like `id`, `name`, `description`, `price`, `rating`, `image`, `category`, and optional `discount`.
- Exports:
  - `categories` — array of visible product categories (e.g. `"All"`, `"Body Care"`, etc.).
  - `getProductById(id: number)` — finds a product by ID.
  - `getProductsByCategory(category: string)` — returns either all products (if `"All"`) or a filtered subset.

The `Products` and `ProductDetail` pages, as well as `Index.tsx`, take their data from this module, so changes here flow through the entire UI.

### UI primitives

The `src/components/ui` directory contains a large collection of reusable UI primitives, largely based on shadcn-ui patterns and Radix UI components (`button`, `input`, `accordion`, `dialog`, `sheet`, etc.).

Key patterns:

- Most primitives accept `className` and variant props to integrate with Tailwind.
- Toasts are handled via:
  - `@/components/ui/toaster` (for shadcn-style toasts)
  - `@/components/ui/sonner` (for `sonner` toasts)
  - Some components (e.g. `ProductCard`) import `toast` from `sonner` directly.

When building new features, prefer using these existing primitives instead of building one-off components.

### Hooks and utilities

- `src/hooks/use-mobile.tsx` and `src/hooks/use-toast.ts` expose custom hooks used across layout and UI to handle responsive behavior and toast logic.
- `src/lib/utils.ts` contains shared utilities such as `cn` for class name concatenation and any other cross-cutting helpers.

### Styling

- Tailwind CSS powers almost all layout and visual styling via utility classes on JSX elements.
- Global styles (including Tailwind directives) live in `src/index.css` and related CSS files.
- Color tokens like `bg-sage-light` or `text-sage-dark` are defined in the Tailwind config (not shown here but present in the project root), and are used to give the project its visual identity.

## Notes for Future Warp Sessions

- For new routes, update `src/App.tsx` and then create the corresponding `src/pages/...` component.
- For global state, prefer extending the zustand stores in `src/lib/store.ts` rather than creating multiple ad-hoc stores scattered across the codebase.
- For new UI, reuse the primitives under `src/components/ui` and respect existing design tokens (Tailwind classes) to keep visuals consistent.
- Product catalog changes should be centralized in `src/lib/products.ts` so that all views stay in sync.