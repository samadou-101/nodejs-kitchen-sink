## 1. Foundation — Theme & Shared Components

- [x] 1.1 Update `global.css` theme variables from blue-gray oklch to zinc-based neutral palette
- [x] 1.2 Build shadcn Input component (replaces all raw `<input>`)
- [x] 1.3 Build shadcn Label component (pairs with Input)
- [x] 1.4 Build shadcn Select component (replaces all raw `<select>`)
- [x] 1.5 Build shadcn Textarea component (replaces all raw `<textarea>`)
- [x] 1.6 Build shadcn Badge component with variants for status colors (amber, emerald, red, blue, green)
- [x] 1.7 Build shadcn Dialog component (replaces homemade ConfirmDialog)
- [x] 1.8 Build shadcn Sheet component (enables mobile nav drawer)
- [x] 1.9 Build shadcn Table component (replaces all admin div-based CRUD lists)
- [x] 1.10 Add Sonner Toast component (enables notifications)
- [x] 1.11 Build shadcn Skeleton component with shimmer animation (replaces animate-pulse)
- [x] 1.12 Create shared `src/shared/components/Field.tsx` — form field wrapper (Label + input + error)
- [x] 1.13 Create shared `src/shared/components/ProductImage.tsx` — image with lazy loading, aspect-ratio, gradient fallback

## 2. Backend — Image Support

- [x] 2.1 Add `imageUrl String?` field to Product model in `prisma/schema.prisma`
- [x] 2.2 Run `npx prisma generate` to regenerate Prisma client
- [x] 2.3 Add `imageUrl?: string` to the `Product` interface in `src/shared/lib/types.ts`
- [x] 2.4 Update seed script to generate picsum.photos URLs for each product: `https://picsum.photos/seed/{name}/600/600`
- [x] 2.5 Update the backend product DTOs to include `imageUrl` in responses

## 3. Customer Pages — Product Catalog

- [x] 3.1 Redesign `ProductCard` with image slot (ProductImage), hover scale effect, and Add to Cart CTA on hover
- [x] 3.2 Update `ProductGrid` to use responsive grid with stagger fade-in animation
- [x] 3.3 Redesign `SkeletonCard` to use Skeleton component with image placeholder shape
- [x] 3.4 Redesign `SearchBar` to use shadcn Input with icon
- [x] 3.5 Redesign `CategoryFilter` to use shadcn Select
- [x] 3.6 Redesign `Pagination` with modern button styling
- [x] 3.7 Redesign `ProductDetail` with hero image (ProductImage), clean typography layout, and Add to Cart button
- [x] 3.8 Add loading and error states to `ProductDetail` using Skeleton component

## 4. Customer Pages — Shopping Cart & Checkout

- [x] 4.1 Redesign `CartItemRow` with product thumbnail (ProductImage), restyled quantity controls, and responsive layout
- [x] 4.2 Redesign `CartSummary` as a proper shadcn Card with subtotal breakdown
- [x] 4.3 Redesign `EmptyCart` with illustration/icon and prominent CTA
- [x] 4.4 Redesign `CartPage` with responsive layout (stacked on mobile)
- [x] 4.5 Refactor `CheckoutForm` to use shared Field component for all inputs (name, phone, address, city, notes)
- [x] 4.6 Add order summary section to `CheckoutForm` with item thumbnails
- [x] 4.7 Redesign `OrderConfirmation` with success animation (scale-in checkmark)
- [x] 4.8 Add Sonner Toast notification when item is added to cart

## 5. Customer Pages — Order Tracking

- [x] 5.1 Redesign `TrackOrderForm` to use shadcn Input with icon inside
- [x] 5.2 Redesign `OrderTrackResult` to use shadcn Badge for status, responsive card layout
- [x] 5.3 Redesign `OrderDetail` with shadcn Badge for status, ProductImage thumbnails on items, clean section layout

## 6. Auth Pages

- [x] 6.1 Redesign `LoginPage` with centered card layout and branded header
- [x] 6.2 Refactor `AdminLoginForm` to use shared Field component
- [x] 6.3 Refactor `AdminSignupForm` to use shared Field component
- [x] 6.4 Refactor `EmployeeLoginForm` to use shared Field component
- [x] 6.5 Refactor `EmployeeSignupForm` to use shared Field component

## 7. Navigation & Layout

- [x] 7.1 Redesign `AppLayout` nav with HugeIcons, Sheet for mobile (<md), cart badge with icon, responsive behavior
- [x] 7.2 Redesign `AdminLayout` sidebar with collapsible behavior (<lg = icons only), active indicator, HugeIcons

## 8. Admin Dashboard

- [x] 8.1 Create shared `KpiCard` component in `src/shared/components/KpiCard.tsx` (icon + label + value)
- [x] 8.2 Add dashboard overview index route to `AdminLayout` with 4 KPI cards (products, pending orders, low stock, employees)
- [x] 8.3 Redesign `ProductManagement` with shadcn Table for product list, Field + Input for form, image thumbnail in rows, image URL preview
- [x] 8.4 Redesign `CategoryManagement` with shadcn Table for category list
- [x] 8.5 Redesign `OrderManagement` with shadcn Table, Badge component for status, styled status select
- [x] 8.6 Redesign `EmployeeManagement` with shadcn Table, styled payment type select
- [x] 8.7 Redesign `InventoryManagement` with shadcn Table, styled stock adjustment form, low-stock alerts as Badge
- [x] 8.8 Redesign `PayrollManagement` with shadcn Table for payroll runs and run detail items

## 9. Employee Pages

- [x] 9.1 Redesign `AssignedOrdersList` with shadcn Badge for status, clean card layout, Icon buttons for Confirm/Reject
- [x] 9.2 Replace `ConfirmDialog` with shadcn Dialog showing order details with product thumbnails

## 10. Cleanup

- [x] 10.1 Remove all unused raw `<input>` / `<select>` / `<textarea>` className patterns
- [x] 10.2 Update `getStatusColor()` helper to use Badge variants
- [x] 10.3 Verify all empty/loading/error states use Skeleton or proper illustration
- [x] 10.4 Test all customer pages at mobile breakpoints (320px, 640px, 768px, 1024px)
- [x] 10.5 Run `pnpm build` and fix any type errors
- [x] 10.6 Run `pnpm lint` and fix any lint errors