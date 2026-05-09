# ScholarWeb (ShopHub)

A full-stack ecommerce platform built with a modern Next.js frontend and an Express + MongoDB backend.

## Overview

ScholarWeb (UI branding: **ShopHub**) provides:

- Customer storefront with search, filtering, cart, checkout, and order tracking
- Authentication with profile management
- Product likes (wishlist-style toggle)
- Buyer/seller messaging per product
- Admin dashboard to manage products, categories, and orders

## Tech Stack

### Frontend (`/`)

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Axios

### Backend (`/backend`)

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT authentication
- bcryptjs password hashing

## Repository Structure

```text
scholarweb/
├── app/                    # Next.js app routes (storefront, auth, admin, chat, orders)
├── components/             # Reusable UI components
├── contexts/               # Auth and cart React contexts
├── lib/                    # API client and auth storage helpers
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # API handlers
│   │   ├── middleware/     # Auth/admin guards
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express route definitions
│   │   └── server.ts       # Backend entrypoint
│   └── package.json
├── package.json            # Frontend scripts
└── README.md
```

## Core Features

### Customer Features

- Browse products with:
  - text search
  - category filter
  - min/max price filter
  - pagination
- View product details, rating summary, and seller
- Like/unlike products
- Add items to local cart with quantity controls
- 3-step checkout (shipping, payment method selection, order review)
- View personal order history and order details
- Simulate payment completion from order details page
- Update profile details (name, email, avatar, address, optional password)

### Messaging

- Conversation list for authenticated users
- Product-specific chat threads
- Send, edit, and delete own messages (delete is user-scoped visibility)

### Admin Features

- Admin dashboard KPIs (orders, revenue, pending deliveries, products)
- Manage products (create/update/delete)
- Manage categories (create/delete)
- Manage orders (view all, mark delivered)

## API Surface (Backend)

Base URL: `http://localhost:5000` by default

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile` (protected)
- `PUT /api/auth/profile` (protected)

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)
- `POST /api/products/:id/reviews` (protected)

### Categories

- `GET /api/categories`
- `POST /api/categories` (admin)
- `DELETE /api/categories/:id` (admin)

### Orders

- `POST /api/orders` (protected)
- `GET /api/orders/myorders` (protected)
- `GET /api/orders/:id` (protected)
- `PUT /api/orders/:id/pay` (protected)
- `GET /api/orders` (admin)
- `PUT /api/orders/:id/deliver` (admin)

### Likes

- `POST /api/likes/:productId` (protected toggle)
- `GET /api/likes/user` (protected)

### Chats

- `GET /api/chats` (protected)
- `POST /api/chats` (protected)
- `POST /api/chats/:chatId/messages` (protected)
- `PUT /api/chats/:chatId/messages/:messageId` (protected)
- `DELETE /api/chats/:chatId/messages/:messageId` (protected)

### Health

- `GET /health`

## Environment Variables

No `.env` files are committed. Create them locally.

### Frontend (`/`)

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (`/backend`)

Create `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/scholarweb
JWT_SECRET=replace_with_a_long_random_secret
CORS_ORIGIN=http://localhost:3000
```

## Local Development

### 1) Install dependencies

```bash
# Frontend
cd <project-root>
npm ci

# Backend
cd <project-root>/backend
npm ci
```

### 2) Start backend

```bash
cd <project-root>/backend
npm run dev
```

### 3) Start frontend (in a separate terminal)

```bash
cd <project-root>
npm run dev
```

Open: `http://localhost:3000`

## Build & Validation

### Frontend

```bash
cd <project-root>
npm run lint
npm run build
```

### Backend

```bash
cd <project-root>/backend
npm run build
```

## Scripts

### Frontend (`/package.json`)

- `npm run dev` – start Next.js dev server
- `npm run lint` – run ESLint
- `npm run build` – production build
- `npm run start` – start production server

### Backend (`/backend/package.json`)

- `npm run dev` – run API in watch mode via nodemon + ts-node
- `npm run build` – compile TypeScript to `backend/dist`
- `npm run start` – run compiled server

## Important Notes

- Payments are currently simulated from the order details page.
- Chat UI fetches from `/api/chats` and resolves threads client-side.
- Product image support expects valid URLs; invalid image URLs are filtered on create.

## License

No license file is currently defined in this repository.
