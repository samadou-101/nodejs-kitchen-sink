## Why

The e-commerce frontend is fully functional but has no visual identity — raw HTML inputs, plain borders, no product images, and no mobile responsiveness. For a storefront that customers and admins use daily, the current UI undermines trust and usability. This change transforms the visual experience into a modern, polished SaaS-grade interface while keeping all existing business logic intact.

## What Changes

- Establish a shared design system theme (colors, typography, spacing, shadows) using Tailwind CSS v4 theme variables
- Build out the shadcn/ui component library (Input, Select, Textarea, Badge, Table, Dialog, Sheet, Toast) and replace all raw HTML elements
- Add product image support: `imageUrl` field on Product, picsum.photos for seed/placeholder images
- Redesign every customer-facing page with a "Sleek SaaS" aesthetic — clean typography, generous spacing, subtle shadows, proper visual hierarchy
- Make all customer-facing pages fully responsive (mobile-first)
- Redesign the admin dashboard with KPI metric cards, data tables, and a collapsible sidebar
- Add minimal micro-interactions (hover lifts, skeleton shimmer, toast notifications, dialog animations)
- Replace the homemade ConfirmDialog with a proper shadcn Dialog
- Create a shared Field component abstraction to eliminate form input boilerplate
- Add loading and empty state illustrations across all features

## Capabilities

### New Capabilities
- `design-system`: Shared theme tokens, shadcn component library, form field primitives, layout patterns, animation utilities, image component

### Modified Capabilities
- `product-catalog`: Products now display images (imageUrl field), responsive product grid, modern card with hover interaction, image skeletons
- `shopping-cart`: Cart items show product thumbnails, responsive stacked layout on mobile, quantity controls restyled
- `order-checkout`: Form fields use shared Field component, responsive single-column layout, order summary with item thumbnails
- `order-tracking`: Responsive form and results layout, status badges instead of colored text
- `admin-dashboard`: KPI metric cards, data tables for CRUD lists, collapsible sidebar, responsive admin layout
- `employee-orders`: Modern order cards with Badge component, shadcn Dialog for confirmation, product thumbnails in order detail

## Impact

- **Backend**: Add `imageUrl` (String?) to Product model in Prisma schema; seed script generates picsum.photos URLs
- **Frontend**: Replace all raw `<input>`, `<select>`, `<textarea>` with shadcn components; add ProductImage component; add Sheet for mobile nav; add Toast for notifications; add Skeleton component
- **Types**: `Product` interface gains optional `imageUrl` field
- **Dependencies**: No new runtime deps (shadcn, HugeIcons, tw-animate-css are already installed but unused)
