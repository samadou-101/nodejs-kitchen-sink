## 1. Foundation & Shared Infrastructure

- [ ] 1.1 Create `src/shared/{api,hooks,components,lib}/` folder structure
- [ ] 1.2 Set up Tanstack Query: install `@tanstack/react-query`, create `query-provider.tsx`, wrap app
- [ ] 1.3 Create HTTP client (`shared/api/http-client.ts`) with `credentials: "include"` and response envelope parsing (`{ success, data, error }`)
- [ ] 1.4 Create error mapping utility for backend error codes (VALIDATION_ERROR, NOT_FOUND, FORBIDDEN, CONFLICT, InsufficientStockError)
- [ ] 1.5 Create shared TypeScript types matching backend models (Product, Category, Order, OrderItem, AuthContext, Employee, Inventory, PayrollRun)
- [ ] 1.6 Create query key factory utility with feature-namespace convention
- [ ] 1.7 Create status label mapping utility (1→Pending, 2→Confirmed, 3→Shipped, 4→Delivered, 5→Cancelled)

## 2. Auth Features

- [ ] 2.1 Create `features/auth-admin/{api,hooks,components}/` with login/signup forms and session context
- [ ] 2.2 Create `features/auth-employee/{api,hooks,components}/` with login/signup forms
- [ ] 2.3 Create shared auth context provider that resolves current user (admin or employee) from session
- [ ] 2.4 Add AuthGuard component for protected routes (admin routes, employee routes)
- [ ] 2.5 Add login/signup routes and redirect logic

## 3. Product Catalog Feature

- [ ] 3.1 Create `features/product-catalog/api/use-products.ts` with `useProducts` (paginated, filterable), `useProduct` (by ID), `useCategories`
- [ ] 3.2 Create `features/product-catalog/hooks/` for pagination, search, and filter state management
- [ ] 3.3 Create `features/product-catalog/components/ProductGrid`, `ProductCard`, `ProductDetail`, `SearchBar`, `CategoryFilter`, pagination controls, skeleton loading
- [ ] 3.4 Wire up product catalog routes

## 4. Shopping Cart Feature

- [ ] 4.1 Create `features/shopping-cart/hooks/use-cart.ts` with add, remove, update quantity, clear, and localStorage persistence
- [ ] 4.2 Create `features/shopping-cart/components/CartPage`, `CartItemRow`, `CartSummary`, `EmptyCart`
- [ ] 4.3 Add cart badge in navigation showing item count

## 5. Order Checkout Feature

- [ ] 5.1 Create `features/order-checkout/api/use-checkout.ts` with `usePlaceOrder` mutation
- [ ] 5.2 Create `features/order-checkout/hooks/use-checkout.ts` orchestrating form state and submission
- [ ] 5.3 Create `features/order-checkout/components/CheckoutForm` with fields: name, phone, address, city, notes — with client-side validation matching backend Zod schemas
- [ ] 5.4 Create `features/order-checkout/components/OrderConfirmation` page showing order reference after successful checkout

## 6. Order Tracking Feature

- [ ] 6.1 Create `features/order-tracking/api/use-order-tracking.ts` with `useTrackOrders` (by phone) and `useOrderDetail` (by ID)
- [ ] 6.2 Create `features/order-tracking/components/TrackOrderForm` (phone input + submit)
- [ ] 6.3 Create `features/order-tracking/components/OrderTrackResult` showing matched orders with status badges
- [ ] 6.4 Create `features/order-tracking/components/OrderDetail` for full order view

## 7. Admin Dashboard Feature

- [ ] 7.1 Create `features/admin-dashboard/api/` with all admin query/mutation hooks (products, categories, orders, employees, inventory, payroll)
- [ ] 7.2 Create admin sub-pages: ProductManagement, CategoryManagement, OrderManagement, EmployeeManagement, InventoryManagement, PayrollManagement
- [ ] 7.3 Create admin layout with sidebar navigation and route sub-pages under `/admin/*`
- [ ] 7.4 Add role-based UI: hide SUPERADMIN-only features from ADMIN users

## 8. Employee Orders Feature

- [ ] 8.1 Create `features/employee-orders/api/use-employee-orders.ts` with `useAssignedOrders`, `useConfirmOrder`, `useRejectOrder`, `useAddNote`
- [ ] 8.2 Create `features/employee-orders/components/AssignedOrdersList` with confirm/reject buttons
- [ ] 8.3 Create `features/employee-orders/components/ConfirmDialog` showing order items before confirmation
- [ ] 8.4 Handle `InsufficientStockError` in UI — show which product failed and available quantity

## 9. Routing & Navigation

- [ ] 9.1 Set up React Router with all routes: `/` (products), `/product/:id`, `/cart`, `/checkout`, `/track`, `/track/:id`, `/admin/*` (protected, ADMIN), `/employee/*` (protected, EMPLOYEE), `/admin/login`, `/employee/login`, `/admin/signup`, `/employee/signup`
- [ ] 9.2 Add role-based redirect: unauthenticated → login, wrong role → 403 page
- [ ] 9.3 Add navigation bar with links based on auth state (public: products, cart, track; admin: dashboard link; employee: assigned orders)

## 10. Testing

- [ ] 10.1 Configure Vitest with jsdom environment
- [ ] 10.2 Set up MSW handlers for all API endpoints (products, categories, checkout, orders, auth, inventory, payroll)
- [ ] 10.3 Create test utilities: render helper with QueryClientProvider and AuthProvider
- [ ] 10.4 Write tests for HTTP client (response envelope parsing, error throwing)
- [ ] 10.5 Write tests for cart hooks (add, remove, persistence)
- [ ] 10.6 Write tests for product catalog hooks and components
- [ ] 10.7 Write tests for checkout flow (success, validation errors)
- [ ] 10.8 Write tests for order tracking flow
- [ ] 10.9 Write tests for employee order confirmation (success, InsufficientStockError)
- [ ] 10.10 Write tests for auth flows (login, signup, session, protected routes)
