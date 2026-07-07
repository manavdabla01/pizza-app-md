# FornoNotte — Pizza Ordering Frontend

React + Vite + Tailwind CSS v4, wired to the Node/Express/MySQL backend.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev
```

Runs on `http://localhost:5173`. Make sure the backend is running (default `http://localhost:8000`) and CORS is enabled there (it already is, via `cors()` in `server.js`).

## Structure

```
src/
  api/            axios client (auto-attaches JWT) + endpoint functions
  context/        Auth, Cart, Toast — global state via React Context
  components/     Navbar, PizzaCard, SideItemCard, SizeDial, CartDrawer, Loader
  pages/          Menu, Login, Signup, Checkout, Orders, AdminDashboard
  pages/admin/    AdminPizzas, AdminSideItems, AdminOrders
```

## Design

- Palette: oven-dark charcoal background, flame-orange primary, basil-green accent, gold highlight.
- Type: Fraunces (display) + Manrope (body) + JetBrains Mono (prices/data).
- Signature element: the circular pizza-slice size dial used wherever sizing matters.
- Respects `prefers-reduced-motion`, visible focus states throughout, fully responsive.

## Data flow

- `AuthContext` persists user/token in `localStorage`, restores session on reload.
- `CartContext` refetches from `/cart` after every mutation — no manual state drift.
- Axios interceptor auto-clears session on 401/403 (expired/invalid token).
- Images render directly from the backend's returned absolute URLs — no hardcoded paths.

## Roles

- Signup defaults to `customer`. To test admin features:
  - Signup with `role: "admin"` via Postman (`/users/signup`), or
  - Manually update a user's role in MySQL: `UPDATE users SET role='admin' WHERE email='...'`
- Admins get an extra "Admin" nav link to manage pizzas, side items, and order statuses.

## Build

```bash
npm run build   # outputs to dist/
npm run preview
```
