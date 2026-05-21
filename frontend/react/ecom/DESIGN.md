# Design System

## Overview

Minimal, trustworthy e-commerce and operations UI built with React, TypeScript, Tailwind CSS 4, and shadcn/Base UI. Restrained color palette, Figtree typography, and efficient components that get out of the user's way.

Default theme: Light (primary for office daytime use). Dark mode available as toggle.

---

## Color Palette

All colors defined in OKLCH color space. Neutrals are tinted slightly cool (blue-gray, "mist" base) rather than pure gray.

### Semantic Roles

| Role | Light (OKLCH) | Dark (OKLCH) | Purpose |
|---|---|---|---|
| `background` | `oklch(1 0 0)` | `oklch(0.142 0.004 285.951)` | Page background |
| `foreground` | `oklch(0.142 0.004 285.951)` | `oklch(0.985 0 0)` | Primary body text |
| `card` | `oklch(1 0 0)` | `oklch(0.228 0.006 285.926)` | Card surface |
| `card-foreground` | `oklch(0.142 0.004 285.951)` | `oklch(0.985 0 0)` | Text on cards |
| `popover` | `oklch(1 0 0)` | `oklch(0.228 0.006 285.926)` | Dropdowns, menus |
| `popover-foreground` | `oklch(0.142 0.004 285.951)` | `oklch(0.985 0 0)` | Text in popovers |
| `primary` | `oklch(0.228 0.006 285.926)` | `oklch(0.92 0.004 286.32)` | Primary buttons, active nav |
| `primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.228 0.006 285.926)` | Text on primary |
| `secondary` | `oklch(0.967 0.001 286.375)` | `oklch(0.322 0.01 285.805)` | Secondary buttons, subtle surfaces |
| `secondary-foreground` | `oklch(0.228 0.006 285.926)` | `oklch(0.985 0 0)` | Text on secondary |
| `muted` | `oklch(0.967 0.001 286.375)` | `oklch(0.322 0.01 285.805)` | Disabled, inactive, placeholder |
| `muted-foreground` | `oklch(0.532 0.013 285.804)` | `oklch(0.655 0.012 285.805)` | Secondary text, hints |
| `accent` | `oklch(0.228 0.006 285.926)` | `oklch(0.92 0.004 286.32)` | Highlight, KPI icon backgrounds |
| `accent-foreground` | `oklch(0.985 0 0)` | `oklch(0.228 0.006 285.926)` | Text on accent |
| `destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Delete, cancel, error |
| `border` | `oklch(0.92 0.004 286.32)` | `oklch(1 0 0 / 10%)` | Dividers, card borders |
| `input` | `oklch(0.92 0.004 286.32)` | `oklch(1 0 0 / 15%)` | Input borders |
| `ring` | `oklch(0.655 0.012 285.805)` | `oklch(0.532 0.013 285.804)` | Focus rings |

### Color Strategy

**Restrained** — tinted cool neutrals + near-black primary used at ≤10% of surface area. No saturated brand colors competing with content.

- Primary is intentionally desaturated (`chroma: 0.006`) — reads as near-black with cool undertone
- Destructive is the only saturated color in the system (red, `chroma: 0.245`)
- All status colors use semantic Tailwind utilities (`amber-*`, `emerald-*`, `blue-*`, `red-*`) via badge variants

### Status Colors (Badge Variants)

| Status | Variant | Light Theme | Use Case |
|---|---|---|---|
| Pending | `amber` | `bg-amber-100 text-amber-800` | Order created, awaiting confirmation |
| Confirmed | `emerald` / `green` | `bg-emerald-100 text-emerald-800` | Order verified by employee |
| Shipped | `blue` | `bg-blue-100 text-blue-800` | Order dispatched |
| Delivered | `green` | `bg-green-100 text-green-800` | Order completed |
| Cancelled | `red` / `destructive` | `bg-red-100 text-red-800` | Order rejected |

---

## Typography

### Font Family

```css
--font-sans: 'Figtree Variable', sans-serif;
--font-heading: var(--font-sans);
```

Single sans-serif family for everything. No separate heading font. Figtree provides clean, modern proportions with good readability at all sizes.

### Scale (Inferred from Usage)

| Role | Size | Weight | Usage |
|---|---|---|---|
| Page Title | `text-2xl` / `text-3xl` | `font-bold` | Admin section headers |
| KPI Value | `text-3xl` | `font-bold` | Dashboard metrics |
| Card Title | `text-base` | `font-medium` | Product names, card headings |
| Price | `text-lg` | `font-bold` | Product pricing |
| Body | `text-sm` | `font-normal` | Primary body text, UI labels |
| Muted | `text-sm` | `font-normal`, `text-muted-foreground` | Secondary info, hints |
| Badge | `text-xs` | `font-medium` | Status indicators |

### Line Length

Cap body text at 65–75ch. Dashboard tables and dense UI are exceptions.

---

## Layout & Spacing

### Container

- Storefront: `max-w-7xl`, centered, `px-4` gutters
- Admin: Full bleed sidebar + flexible main area with `p-6` padding

### Spacing Scale

Uses Tailwind's default spacing scale with intentional rhythm:

- Tight UI (forms, tables): `gap-1`, `gap-2`
- Card padding: `p-4` (storefront), `px-6 py-4` (admin cards `size="sm"`)
- Section spacing: `gap-6`, `gap-8`
- Sidebar nav: `space-y-1` between items

### Navigation Layouts

**Public Storefront (AppLayout)**
- Sticky top nav: `h-14`, border bottom, `backdrop-blur-sm`
- Logo left, nav links center-right
- Mobile: Sheet hamburger menu + floating cart icon with badge

**Admin Dashboard (AdminLayout)**
- Left sidebar: `w-16` (collapsed) → `lg:w-56` (expanded)
- Icons only on mobile, labels appear at `lg` breakpoint
- Active nav item: `bg-primary text-primary-foreground` (filled, not underlined)

---

## Components

### Buttons (`buttonVariants`)

Base styles:
- `inline-flex items-center justify-center`
- `rounded-md` (uses `--radius-md` derived from base `--radius: 0.45rem`)
- `text-sm font-medium`
- `transition-all` duration 200ms
- Focus: `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`
- Active: `active:not(aria-[haspopup]):translate-y-px` (subtle press)

Variants:

| Variant | Styles | Use Case |
|---|---|---|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/80` | Primary actions, CTAs |
| `outline` | `border-border bg-background shadow-xs hover:bg-muted` | Secondary actions, cancel |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80` | Tertiary, toolbar actions |
| `ghost` | `hover:bg-muted hover:text-foreground` | Nav links, icon buttons |
| `destructive` | `bg-destructive/10 text-destructive hover:bg-destructive/20` | Delete, dangerous actions |
| `link` | `text-primary underline-offset-4 hover:underline` | Text links |

Sizes:
- `default`: `h-9 px-2.5 gap-1.5`
- `sm`: `h-8 px-2.5`
- `xs`: `h-6 px-2 text-xs`
- `lg`: `h-10 px-2.5`
- `icon`: `size-9` (square)

### Cards

Base: `rounded-xl`, `ring-1 ring-foreground/10` (subtle border in light mode), `shadow-xs`.

| Size | Padding | Gap | Use Case |
|---|---|---|---|
| `default` | `py-6 px-6` | `gap-6` | Content cards, forms |
| `sm` | `py-4 px-4` | `gap-4` | Dashboard KPI cards, dense lists |

Product cards additionally use:
- `hover:shadow-md` transition
- Overlay "Add to Cart" button on hover (`translate-y-2 → translate-y-0`, `opacity-0 → opacity-100`)

### Badges

Base: `inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium`.

Used for:
- Order status (Pending → `amber`, Confirmed → `emerald`, etc.)
- Cart item count (pill shape via `rounded-full` in `AppLayout`)

### Tables

Standard data tables for admin views (Orders, Products, Employees). Column alignment:
- Text left-aligned
- Numbers/prices right-aligned
- Actions right-aligned, minimal width

### Inputs & Forms

- Labels: `text-sm font-medium`
- Inputs: Use `input` border/background tokens, `rounded-md`
- Validation errors: `aria-invalid` states connect to `destructive` color via button/input variants
- Helper text: `text-sm text-muted-foreground`

### Dialogs & Sheets

- `Dialog`: Modal confirmations (ConfirmDialog for order approval)
- `Sheet`: Mobile navigation, side drawers
- Both centered around user action, not used as default UI pattern

### Toasts (Sonner)

- Success: Green/neutral check + message
- Error: Destructive red + message
- Position: Top-right or bottom-right (configurable)
- Used for: "Added to cart", "Order confirmed", API errors

---

## Elevation & Shadow

Minimal shadow system. Only two practical depths:

| Token | Usage |
|---|---|
| `shadow-xs` | Default cards, inputs, subtle lift |
| `shadow-md` | Hover state on product cards, elevated elements |
| `shadow-lg` | Hovered "Add to Cart" button overlay |

No `shadow-xl` or `shadow-2xl` used. Depth comes from borders + minimal shadow, not blurry darkness.

---

## Border Radius

Base: `--radius: 0.45rem` (~7px). Derived scale:

| Token | Calculation | Usage |
|---|---|---|
| `--radius-sm` | `0.6 × radius` | Tight UI, badges on mobile |
| `--radius-md` | `0.8 × radius` | Buttons, inputs, badges |
| `--radius-lg` | `1.0 × radius` | Base (aliased to `--radius`) |
| `--radius-xl` | `1.4 × radius` | Cards, `rounded-xl` in component classes |

Card corners use `rounded-xl` explicitly in component classes. Buttons use `rounded-md`.

---

## Icons

**Library:** HugeIcons (`@hugeicons/react`) via shadcn config.

Style: Outline (1.5px stroke), consistent with Heroicons proportions. Used for:
- Sidebar navigation
- KPI card icons
- Form field prefixes
- Action buttons in tables

Inline SVG size defaults:
- Buttons: `size-4` (16px)
- Sidebar nav: `size-5` (20px)
- KPI icon containers: `h-10 w-10` with `size-5` inside

---

## Motion

### Philosophy

Motion serves utility, not decoration. No entrance animations, no decorative transitions between pages.

### Allowed Motion

| Property | Duration | Easing | Use Case |
|---|---|---|---|
| `transform` | `200ms` | ease (default) | Hover overlay on product cards |
| `opacity` | `200ms` | ease (default) | Fade in/out hover actions |
| `shadow` | `200ms` | ease (default) | Card elevation on hover |
| `background-color` | `transition-all` | ease | Button hover states |

### Explicitly Avoided

- Page transition animations
- Entrance animations (`animate-in`, `fade-in`)
- Bounce, elastic easings
- Counting animations for KPIs
- Gradient text with shimmer effects

### Skeletons

Used during loading:
- Simple `bg-muted` animated blocks
- Single shimmer `translateX` animation if needed
- No pulse animation (too distracting in dashboard context)

---

## Dark Mode

Supported via `@custom-variant dark (&:is(.dark *))`. Toggle not currently implemented in UI but CSS tokens are ready.

Key differences in dark mode:
- Background/card swap to near-black cool grays
- Primary inverts (light foreground on dark becomes dark foreground on light)
- Borders become `oklch(1 0 0 / 10%)` (subtle white strokes)
- All semantic roles have corresponding `--color-*` variables in `.dark` block

---

## Responsive Breakpoints

Following Tailwind defaults as used in code:

| Breakpoint | Usage |
|---|---|
| `md` (768px) | Nav links appear (mobile hamburger → desktop nav) |
| `lg` (1024px) | Admin sidebar expands from icons-only to icons + labels |

Mobile-first patterns:
- Storefront product grid: 1 col mobile → 2-3 col at larger breakpoints
- Admin sidebar: `w-16` → `lg:w-56`
- Touch targets: Minimum `h-9` for interactive elements on mobile

---

## References & Precedents

**Inspired by:**
- Linear — Restraint, minimalism, clarity in tool UI
- Shopify — Product-first e-commerce, trustworthy storefront patterns

**Technical Base:**
- shadcn `style: "base-vega"`
- `baseColor: "mist"` (cool neutral foundation)
- Tailwind CSS 4 with `@theme inline` variables
- @base-ui/react (formerly Radix UI) primitives

---

## Implementation Notes

### CSS Location

All design tokens defined in `src/global.css`:
- `@theme inline` block exports tokens to Tailwind
- `:root` block defines light mode CSS variables
- `.dark` block defines dark mode overrides

### Component Locations

```
src/components/
├── components/ui/        # shadcn-generated components
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── dialog.tsx
│   ├── sheet.tsx
│   ├── table.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── label.tsx
│   ├── textarea.tsx
│   ├── skeleton.tsx
│   └── sonner.tsx
└── lib/
    ├── button-variants.ts    # CVA button variants
    ├── badge-variants.ts     # CVA badge variants
    └── utils.ts              # cn() merge utility
```

### Pattern Inconsistencies to Resolve

1. **Icon Source:** Some components use inline SVG paths (AdminLayout), others should use `@hugeicons/react` for consistency
2. **Status Mapping:** Badge variants for order status are inferred but not centralized — create `getStatusBadgeVariant()` utility
3. **Cart Badge:** Uses ad-hoc `rounded-full bg-primary` instead of badge variant — consider using variant="default" with custom `rounded-full`

---

## Do Not Change Without Discussion

- The restrained primary color (no saturated brand accent)
- Single font family (Figtree for everything)
- `200ms` transition duration on all hover states
- Lack of decorative animation
- Admin sidebar active state using filled background (not underline or accent color)
