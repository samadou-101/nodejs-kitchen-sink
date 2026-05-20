## 1. Foundation & Dependencies

- [ ] 1.1 Install new dependencies: `@tanstack/react-query`, `@tanstack/react-query-devtools`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `msw`, `jsdom`
- [ ] 1.2 Create folder structure: `src/features/<name>/{api,hooks,components}/` for all 5 features, `src/shared/{api,hooks,components,lib}/`
- [ ] 1.3 Remove or reorganize existing flat `components/`, `hooks/`, `lib/` folders

## 2. Shared Infrastructure

- [ ] 2.1 Create shared HTTP client (`src/shared/api/http-client.ts`) with base URL, headers, error normalization
- [ ] 2.2 Create Tanstack Query provider wrapper (`src/shared/api/query-provider.tsx`) with configured `QueryClient`
- [ ] 2.3 Create shared query key factory utility (`src/shared/api/query-keys.ts`)
- [ ] 2.4 Create shared type definitions (`src/shared/lib/types.ts`) for Product, CartItem, Order, User
- [ ] 2.5 Wire up QueryClientProvider in the app entry point

## 3. Auth Feature (customer-auth)

- [ ] 3.1 Create auth API layer (`features/customer-auth/api/use-auth.ts`) — `useLogin`, `useRegister`, `useLogout`, `useCurrentUser` queries/mutations
- [ ] 3.2 Create auth context and provider (`features/customer-auth/hooks/auth-context.tsx`) — exposes current user, login/logout/register functions
- [ ] 3.3 Create auth hook (`features/customer-auth/hooks/use-auth.ts`) — public interface for consuming auth state
- [ ] 3.4 Create auth UI components: LoginForm, RegisterForm, AuthGuard (protected route wrapper)
- [ ] 3.5 Wrap app with AuthProvider

## 4. Product Catalog Feature

- [ ] 4.1 Create product API layer (`features/product-catalog/api/use-products.ts`) — `useProducts` (paginated list), `useProduct` (single), `useCategories`
- [ ] 4.2 Create product hooks (`features/product-catalog/hooks/use-product-list.ts`, `use-product-detail.ts`) — orchestrate pagination, search, filter state
- [ ] 4.3 Create product components: ProductCard, ProductGrid, ProductDetail, SearchBar, CategoryFilter, ProductSkeleton
- [ ] 4.4 Wire up product routes

## 5. Shopping Cart Feature

- [ ] 5.1 Create cart API layer (`features/shopping-cart/api/use-cart.ts`) — `useCart`, `useAddToCart`, `useUpdateQuantity`, `useRemoveFromCart`
- [ ] 5.2 Create cart hooks (`features/shopping-cart/hooks/use-cart.ts`) — orchestrates cart data, computes totals
- [ ] 5.3 Create cart components: CartDrawer/CartPage, CartItemRow, CartSummary, EmptyCart

## 6. Customer Order Feature (order-customer)

- [ ] 6.1 Create customer order API layer (`features/order-customer/api/use-customer-orders.ts`) — `usePlaceOrder`, `useCustomerOrders`, `useCustomerOrder`
- [ ] 6.2 Create customer order hooks (`features/order-customer/hooks/use-customer-orders.ts`) — orchestrate checkout flow
- [ ] 6.3 Create customer order components: CheckoutPage, OrderConfirmation, OrderHistory, OrderDetail

## 7. Admin Order Feature (order-admin)

- [ ] 7.1 Create admin order API layer (`features/order-admin/api/use-admin-orders.ts`) — `usePendingOrders`, `useConfirmOrder`, `useCancelOrder`
- [ ] 7.2 Create admin order hooks (`features/order-admin/hooks/use-admin-orders.ts`)
- [ ] 7.3 Create admin order components: PendingOrdersList, OrderRow, ConfirmOrderButton, CancelOrderButton

## 8. Testing Setup

- [ ] 8.1 Configure Vitest (`vitest.config.ts`) with jsdom environment
- [ ] 8.2 Create MSW handlers for all API endpoints
- [ ] 8.3 Create test utilities/render helpers with providers (QueryClient, AuthProvider)
- [ ] 8.4 Write tests for product API hooks
- [ ] 8.5 Write tests for cart hooks
- [ ] 8.6 Write tests for order hooks
- [ ] 8.7 Write tests for auth flow (login, register, protected routes)
- [ ] 8.8 Write component tests for key UI components (ProductCard, CartItemRow, OrderConfirmation)

## 9. Routing & Navigation

- [ ] 9.1 Set up React Router with routes for: home (product list), product detail, cart, checkout, order history, order detail, admin dashboard, login, register
- [ ] 9.2 Add AuthGuard to protected routes
- [ ] 9.3 Add navigation layout with links to cart, orders, login/logout

## 10. Linting & Final Polish

- [ ] 10.1 Configure ESLint rule to prevent feature-to-feature imports
- [ ] 10.2 Add path aliases (`@features/`, `@shared/`) in tsconfig and vite config
- [ ] 10.3 Verify build passes with `pnpm build`
- [ ] 10.4 Verify all tests pass with `pnpm test`
