# MVP Remaining Tasks

> All items below have been implemented.

## Product Module

- [x] `PATCH /product/:id` — Update product (via `/product/update` POST)
- [x] Category CRUD
  - [x] `POST /category` — Create category
  - [x] `GET /categories` — List categories
  - [x] `GET /category/:id` — Get category
  - [x] `POST /category/update` — Update category
  - [x] `DELETE /category/:id` — Delete category
- [x] Product search/filter
- [x] Product list by category

## Customer Module

- [x] Browse products with pagination
- [x] Filter products by category
- [x] Search products by name
- [x] View product details
- [x] Cart management (placeholder endpoints)
- [x] Checkout form (full name, phone, address, city, notes) — no auth required
- [x] Order tracking via phone number lookup

## Employee Module

- [x] View assigned orders (`GET /employee/orders`)
- [x] Confirm order validity (`PATCH /employee/orders/:id/confirm`)
- [x] Reject order (`PATCH /employee/orders/:id/reject`)
- [x] Add confirmation notes (`POST /employee/orders/:id/notes`)

## Order Module

- [x] List all orders (`GET /orders` with admin, with pagination)
- [x] Filter by status (`?status=:id`)
- [x] Filter by assigned employee (`?employee=:id`)

## Admin Module

- [x] View employee performance stats (`GET /admin/employees/:id/performance`)
- [x] Inventory stock management
  - [x] `POST /admin/inventory/adjust` — Adjust stock manually
  - [x] `GET /admin/inventory/low-stock` — List low stock items

## Docs

- [x] Employee use-case documents in `docs/use-cases/employee/`
