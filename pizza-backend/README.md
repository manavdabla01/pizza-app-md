# Pizza Ordering App — Backend (Node.js + Express + MySQL)

## Setup

1. `npm install`
2. Copy `.env.example` → `.env` and fill in your MySQL credentials + JWT secret.
3. Create the database and tables:
   ```
   mysql -u root -p < config/schema.sql
   ```
4. `npm run dev` (or `npm start`)

Server runs on `http://localhost:8000` by default.

## Image handling (important for hosting)

- Uploaded images are saved to `/uploads` and served via `express.static`.
- Every API response returns a **full image URL**, not a relative path — built from
  `BASE_URL` (set this in `.env` once you deploy) or the request's own host as a fallback.
- This means your frontend can use `pizza.image` directly in an `<img src>` with zero
  extra logic, whether you're running locally or in production.
- Old images are automatically deleted from disk when a pizza/side item's image is
  replaced or the item is deleted — no orphan files piling up.

## Folder structure

```
config/       db.js, schema.sql
models/       raw SQL query functions per table
controllers/  request handling / business logic
routes/       public + admin route definitions
middleware/   JWT auth, multer upload
utils/        token signing, image URL/cleanup helpers
uploads/      uploaded images (served statically)
```

## API Endpoints

### Users — `/users`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/signup` | — | Create account |
| POST | `/login` | — | Login, returns JWT |
| GET | `/logout` | JWT | Logout (client discards token) |
| PATCH | `/:userId` | JWT (self or admin) | Update user |
| DELETE | `/:userId` | JWT (self or admin) | Delete user (cascades cart/orders) |

### Pizzas — `/pizzas` (public)
| Method | Path | Description |
|---|---|---|
| GET | `/` | List all pizzas |
| GET | `/:pizzaId` | Get one pizza |

### Side Items — `/sideitems` (public)
| Method | Path | Description |
|---|---|---|
| GET | `/getItems` | List all side items |

### Cart — `/cart` (JWT required)
| Method | Path | Description |
|---|---|---|
| POST | `/add` | Add item(s) to cart |
| GET | `/` | Get current user's cart |
| PATCH | `/update` | Update item quantities |
| DELETE | `/item/:cartItemId` | Remove one item |
| DELETE | `/clear` | Clear entire cart |

### Orders — `/orders` (JWT required)
| Method | Path | Description |
|---|---|---|
| POST | `/checkoutOrder` | Place order from cart |
| GET | `/my-orders` | Get logged-in user's orders |
| DELETE | `/:orderId` | Cancel an order |

### Admin — `/admin` (Admin JWT required)
| Method | Path | Description |
|---|---|---|
| GET | `/all-users` | List all users |
| PATCH | `/:userId` | Update any user |
| DELETE | `/:userId` | Delete any user |
| POST | `/addPizza` | Add pizza (multipart: `image` file) |
| PATCH | `/pizza/:pizzaId` | Update pizza |
| DELETE | `/pizza/:pizzaId` | Delete pizza |
| POST | `/addSideItem` | Add side item (multipart: `image` file) |
| PATCH | `/sideItem/:id` | Update side item |
| DELETE | `/sideItem/:id` | Delete side item |
| GET | `/getOrders` | List all orders |
| PATCH | `/updateStatus/:id` | Update order status |

## Fixes made vs. the original Mongo version

- **Cart route bug**: original had `GET /cart/:userId` unauthenticated-by-param — now `GET /cart/` reads the user strictly from the JWT, so no one can fetch another user's cart by guessing an ID.
- **Upload-before-auth bug**: side item routes ran `multer` before `authenticateAdminJWT`, letting unauthenticated requests write files to disk. Auth now always runs first.
- **Checkout race condition**: checkout now runs inside a real MySQL transaction (begin/commit/rollback), so a failure mid-checkout can't leave an order half-written while the cart is already deleted.
- **Image cleanup**: old images are deleted from disk on update/delete instead of accumulating forever.
