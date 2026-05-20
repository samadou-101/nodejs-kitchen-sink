## Context

The frontend uses React 19 + Vite + Tailwind CSS v4 + shadcn/ui. Currently only the Button and Card shadcn primitives exist — every other component uses raw HTML with ad-hoc Tailwind classes. The app has ~40 components across 7 feature folders, all functionally complete but visually bare. HugeIcons and tw-animate-css are installed but unused. Product images don't exist in the data model or UI.

This design codifies the visual system, component architecture, and implementation approach for a "Sleek SaaS" redesign of the entire application.

## Goals / Non-Goals

**Goals:**
- Define a cohesive visual identity (color palette, typography, spacing, elevation)
- Build out the full shadcn component library (Input, Select, Textarea, Badge, Table, Dialog, Sheet, Toast, Skeleton)
- Add `imageUrl` to the Product model and display product images across all features
- Make all customer-facing pages responsive (mobile-first breakpoints)
- Redesign the admin dashboard with KPI metric cards and data tables
- Add minimal CSS-only micro-interactions (hover lifts, shimmer, fade-in)
- Create a shared Field component to eliminate form input boilerplate
- Replace the homemade ConfirmDialog with shadcn Dialog

**Non-Goals:**
- No Framer Motion or JavaScript animation libraries (all animation via CSS)
- No dark mode toggle (CSS variables exist but no toggle UI)
- No image upload endpoint (URL-based only; picsum.photos for dev/seed)
- No backend API changes beyond adding `imageUrl` to the Product model
- No changes to business logic, data flow, or routing structure

## Decisions

### 1. Color Palette

| Decision | Choice | Rationale |
|---|---|---|
| Neutral base | Zinc (`#18181b` → `#fafafa`) | Clean, modern, doesn't compete with product images |
| Accent | Zinc-900 (`#18181b`) for CTAs | Keeps UI restrained; color is reserved for semantics |
| Status colors | Amber (Pending), Emerald (Confirmed), Red (Cancelled), Blue (Shipped) | Standard semantic mapping, matches existing status IDs |
| Surface | White `#ffffff` / Zinc-50 `#fafafa` | Subtle distinction between page bg and card bg |
| Border | Zinc-200 `#e4e4e7` | Thin, unobtrusive borders |

CSS variables in `global.css` will be updated from the current blue-gray oklch values to zinc oklch equivalents. Status badge colors are added as Tailwind utility classes, not theme tokens.

### 2. Component Build Order

Components are built in dependency order, each replacing its raw HTML equivalent across every feature simultaneously:

```
1. Input + Label      → replaces ~40 raw <input> instances
2. Select             → replaces ~8 raw <select> instances
3. Textarea           → replaces ~4 raw <textarea> instances
4. Badge              → replaces manual getStatusColor() classes
5. Dialog             → replaces ConfirmDialog fixed overlay
6. Sheet              → enables mobile nav drawer
7. Table              → replaces all admin CRUD div-based lists
8. Toast/Sonner       → enables notifications (addToCart, confirmOrder, etc.)
9. Skeleton           → replaces manual animate-pulse divs
10. ProductImage      → new component for image display with fallback
11. Field             → form field wrapper (label + input + error message)
```

### 3. Image Architecture

Images are stored as URL strings in the Product model. For development and seed data, picsum.photos provides deterministic placeholder images:

```
https://picsum.photos/seed/{encodeURIComponent(productName)}/{width}/{height}
```

The ProductImage component encapsulates display logic:

```
ProductImage
├── <div aspect-ratio container>
│   ├── <img loading="lazy" onError→hide>  (object-cover)
│   └── <div fallback>                      (gradient + icon)
└── While loading: skeleton shimmer overlay
```

The fallback div renders a subtle gradient background with a product outline icon from HugeIcons. The component accepts `src`, `alt`, `aspect` (default "4:3"), and `size` ("sm" | "md" | "lg") props.

### 4. Responsive Strategy

Breakpoints follow Tailwind defaults:

| Breakpoint | Customer Pages | Admin Pages |
|---|---|---|
| `sm` (640px) | Single column, Sheet nav, stacked layout | Full-width tables with horizontal scroll |
| `md` (768px) | 2-column product grid | Sidebar collapses to icon-only |
| `lg` (1024px) | 3-column product grid, horizontal nav | Sidebar expanded, KPI cards in 4-col grid |
| `xl` (1280px) | 4-column product grid | Max-width container |

Customer nav: `sm` = hamburger → Sheet overlay; `md+` = horizontal links.
Admin sidebar: `lg+` = expanded with labels; `<lg` = icon-only with tooltips.

### 5. Animation Strategy

All animations are CSS-only via `tw-animate-css`:

| Element | Animation | Implementation |
|---|---|---|
| Product Card hover | scale-[1.02] + shadow transition | `transition-all duration-200 hover:scale-[1.02] hover:shadow-md` |
| Button press | brightness-95 | `active:brightness-95 transition-all` |
| Skeleton | Shimmer gradient | CSS `@keyframes shimmer` with `bg-gradient-to-r` |
| Dialog open | Backdrop fade + content scale | `data-[open]:animate-in data-[closed]:animate-out` (shadcn built-in) |
| Toast | Slide from top-right | Sonner built-in animation |
| Page content fade-in | Fade up on mount | `animate-in fade-in slide-in-from-bottom-1 duration-300` |
| Skeleton loaders | Pulse replaced by shimmer | Custom keyframe, more polished than Tailwind pulse |

### 6. Form Field Abstraction

Every form currently repeats the same 5-line pattern. The Field component consolidates this:

```
<Field label="Name" error={errors.name}>
  <Input value={form.name} onChange={...} placeholder="..." />
</Field>
```

Field renders:
```
<div class="space-y-1">
  <Label>Name</Label>
  {children}  ← the Input/Select/Textarea
  {error && <p class="text-xs text-destructive">{error}</p>}
</div>
```

This eliminates the `<label>` + error display boilerplate from all 15+ forms.

### 7. Admin Dashboard Layout

The existing AdminLayout sidebar remains but gains:
- Collapsible behavior at `<lg` (icons only)
- Active link indicator with accent border
- Dashboard overview page (index route) with KPI cards

KPI card data sources:

| KPI | Source |
|---|---|
| Total Products | `useAllProducts()` → data.length |
| Pending Orders | `useAdminOrders({ statusId: 1 })` → data.length |
| Low Stock Items | `useLowStock()` → data.length |
| Active Employees | `useListEmployees()` → data.length |

Each KPI card is a shadcn Card with:
```
┌──────────────────────┐
│ [icon]  Label        │
│   42    Value        │  (text-3xl font-bold)
└──────────────────────┘
```

KPI cards are a shared component in `src/shared/components/KpiCard.tsx`.

### 8. Mobile Navigation

At `sm`, the nav links collapse behind a hamburger icon. Clicking opens a shadcn Sheet from the right side containing all nav links with proper spacing, icons, and active states.

The Sheet uses `@base-ui/react/sheet` or the built-in shadcn Sheet implementation (to be determined during component build).

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Images from external CDN (picsum) may be slow or unavailable | ProductImage component handles onError gracefully with gradient fallback; lazy loading prevents blocking page render |
| Replacing all raw inputs simultaneously is high-touch | Start with the Field component, then do a sweep of all forms in sequence — the replacement is mechanical, not risky |
| Mobile nav Sheet adds a runtime dependency on Base UI Sheet | shadcn Sheet is built on Radix UI and is already in the dependency tree via shadcn |
| KPI cards add API calls on dashboard load | All 4 queries run in parallel via Tanstack Query; they're lightweight list endpoints with pagination defaults |
| Status badge colors change from inline classes to Badge component | Badge component accepts a `variant` prop mapped to status IDs; existing `getStatusColor()` helper is replaced, not removed |