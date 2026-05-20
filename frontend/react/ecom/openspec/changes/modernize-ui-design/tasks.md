## 1. Foundation — Theme & Shared Components

- [ ] 1.1 Update `global.css` theme variables from blue-gray oklch to zinc-based neutral palette
- [ ] 1.2 Build shadcn Input component (replaces all raw `<input>`)
- [ ] 1.3 Build shadcn Label component (pairs with Input)
- [ ] 1.4 Build shadcn Select component (replaces all raw `<select>`)
- [ ] 1.5 Build shadcn Textarea component (replaces all raw `<textarea>`)
- [ ] 1.6 Build shadcn Badge component with variants for status colors (amber, emerald, red, blue, green)
- [ ] 1.7 Build shadcn Dialog component (replaces homemade ConfirmDialog)
- [ ] 1.8 Build shadcn Sheet component (enables mobile nav drawer)
- [ ] 1.9 Build shadcn Table component (replaces all admin div-based CRUD lists)
- [ ] 1.10 Add Sonner Toast component (enables notifications)
- [ ] 1.11 Build shadcn Skeleton component with shimmer animation (replaces animate-pulse)
- [ ] 1.12 Create shared `src/shared/components/Field.tsx` — form field wrapper (Label + input + error)
- [ ] 1.13 Create shared `src/shared/components/ProductImage.tsx` — image with lazy loading, aspect-ratio, gradient fallback

## 2. Backend — Image Support

- [ ] 2.1 Add `imageUrl String?` field to Product model in `prisma/schema.prisma`
- [ ] 2.2 Run `npx prisma generate` to regenerate Prisma client
- [ ] 2.3 Add `imageUrl?: string` to the `Product` interface in `src/shared/lib/types.ts`
- [ ] 2.4 Update seed script to generate picsum.photos URLs for each product: `https://picsum.photos/seed/{name}/600/600`
- [ ] 2.5 Update the backend product DTOs to include `imageUrl` in responses

## 3. Customer Pages — Product Catalog

- [ ] 3.1 Redesign `ProductCard` with image slot (ProductImage), hover scale effect, and Add to Cart CTA on hover
- [ ] 3.2 Update `ProductGrid` to use responsive grid with stagger fade-in animation
- [ ] 3.3 Redesign `SkeletonCard` to use Skeleton component with image placeholder shape
- [ ] 3.4 Redesign `SearchBar` to use shadcn Input with icon
- [ ] 3.5 Redesign `CategoryFilter` to use shadcn Select
- [ ] 3.6 Redesign `Pagination` with modern button styling
- [ ] 3.7 Redesign `ProductDetail` with hero image (ProductImage), clean typography layout, and Add to Cart button
- [ ] 3.8 Add loading and error states to `ProductDetail` using Skeleton component

## 4. Customer Pages — Shopping Cart & Checkout

- [ ] 4.1 Redesign `CartItemRow` with product thumbnail (ProductImage), restyled quantity controls, and responsive layout
- [ ] 4.2 Redesign `CartSummary` as a proper shadcn Card with subtotal breakdown
- [ ] 4.3 Redesign `EmptyCart` with illustration/icon and prominent CTA
- [ ] 4.4 Redesign `CartPage` with responsive layout (stacked on mobile)
- [ ] 4.5 Refactor `CheckoutForm` to use shared Field component for all inputs (name, phone, address, city, notes)
- [ ] 4.6 Add order summary section to `CheckoutForm` with item thumbnails
- [ ] 4.7 Redesign `OrderConfirmation` with success animation (scale-in checkmark)
- [ ] 4.8 Add Sonner Toast notification when item is added to cart

## 5. Customer Pages — Order Tracking

- [ ] 5.1 Redesign `TrackOrderForm` to use shadcn Input with icon inside
- [ ] 5.2 Redesign `OrderTrackResult` to use shadcn Badge for status, responsive card layout
- [ ] 5.3 Redesign `OrderDetail` with shadcn Badge for status, ProductImage thumbnails on items, clean section layout

## 6. Auth Pages

- [ ] 6.1 Redesign `LoginPage` with centered card layout and branded header
- [ ] 6.2 Refactor `AdminLoginForm` to use shared Field component
- [ ] 6.3 Refactor `AdminSignupForm` to use shared Field component
- [ ] 6.4 Refactor `EmployeeLoginForm` to use shared Field component
- [ ] 6.5 Refactor `EmployeeSignupForm` to use shared Field component

## 7. Navigation & Layout

- [ ] 7.1 Redesign `AppLayout` nav with HugeIcons, Sheet for mobile (<md), cart badge with icon, responsive behavior
- [ ] 7.2 Redesign `AdminLayout` sidebar with collapsible behavior (<lg = icons only), active indicator, HugeIcons

## 8. Admin Dashboard

- [ ] 8.1 Create shared `KpiCard` component in `src/shared/components/KpiCard.tsx` (icon + label + value)
- [ ] 8.2 Add dashboard overview index route to `AdminLayout` with 4 KPI cards (products, pending orders, low stock, employees)
- [ ] 8.3 Redesign `ProductManagement` with shadcn Table for product list, Field + Input for form, image thumbnail in rows, image URL preview
- [ ] 8.4 Redesign `CategoryManagement` with shadcn Table for category list
- [ ] 8.5 Redesign `OrderManagement` with shadcn Table, Badge component for status, styled status select
- [ ] 8.6 Redesign `EmployeeManagement` with shadcn Table, styled payment type select
- [ ] 8.7 Redesign `InventoryManagement` with shadcn Table, styled stock adjustment form, low-stock alerts as Badge
- [ ] 8.8 Redesign `PayrollManagement` with shadcn Table for payroll runs and run detail items

## 9. Employee Pages

- [ ] 9.1 Redesign `AssignedOrdersList` with shadcn Badge for status, clean card layout, Icon buttons for Confirm/Reject
- [ ] 9.2 Replace `ConfirmDialog` with shadcn Dialog showing order details with product thumbnails

## 10. Cleanup

- [ ] 10.1 Remove all unused raw `<input>` / `<select>` / `<textarea>` className patterns
- [ ] 10.2 Update `getStatusColor()` helper to use Badge variants
- [ ] 10.3 Verify all empty/loading/error states use Skeleton or proper illustration
- [ ] 10.4 Test all customer pages at mobile breakpoints (320px, 640px, 768px, 1024px)
- [ ] 10.5 Run `pnpm build` and fix any type errors
- [ ] 10.6 Run `pnpm lint` and fix any lint errors