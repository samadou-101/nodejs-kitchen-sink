## Context

The ecom app header lives inside `AppLayout.tsx` as an inline `<nav>` block. It uses a single flex row with logo and nav items grouped together, and auth-conditional links appended after a separator. As the app grows (cart, admin/employee dashboards, language switcher, more nav links), this pattern doesn't scale cleanly.

The project brand is "The Casbah Edit" — bold, energetic, streetwear-drop energy. The current header (`h-14`, `shadow-xs`, `border-b`, `text-lg` logo) is modest and doesn't carry the brand's visual weight.

## Goals / Non-Goals

**Goals:**
- Extract `<nav>` into a standalone `EcomHeader` component in its own file
- Desktop layout splits into 3 sections: logo (left), nav links (center, perfectly centered), cart + auth actions (right)
- Nav links: Products, About Us, Track Order (cart removed from nav)
- Right section shows: cart icon always, plus auth-appropriate actions (language switcher placeholder when unauthenticated; Dashboard/My Orders/Logout when authenticated; Admin Login/Employee Login when not authenticated)
- Bolder header: taller height, stronger shadow, larger logo, typography matching brand (Figtree, bold weights)
- Mobile layout stays unchanged (current Sheet-based nav)
- New `/about` route rendering a static About Us page
- Logout button wired as UI only (no logic)

**Non-Goals:**
- NOT changing the mobile header/nav layout
- NOT implementing actual i18n/language switching logic (placeholder only)
- NOT implementing logout logic (button only)
- NOT restructuring the router or data fetching

## Decisions

**1. Component extraction: standalone `EcomHeader.tsx`**

New file at `frontend/react/src/modules/ecom/shared/components/EcomHeader.tsx`. The `AppLayout` imports and renders `<EcomHeader />` in place of the current inline `<nav>`. Separates concerns cleanly — layout shell vs. header component.

**2. Desktop 3-section layout via CSS Grid**

```
┌──────────────────────────────────────────────────────────┐
│  grid grid-cols-3 items-center                           │
│                                                          │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ justify-self  │  │ justify-self     │  │ justify-self││
│  │ :start        │  │ :center          │  │ :end       ││
│  │               │  │                  │  │            ││
│  │ Logo          │  │ Products About   │  │ 🛒   EN    ││
│  │ E-Com Store   │  │ Track            │  │            ││
│  └──────────────┘  └──────────────────┘  └────────────┘│
└──────────────────────────────────────────────────────────┘
```

`grid-cols-3` ensures the center column stays perfectly centered regardless of left/right content width. Each section uses `justify-self` for alignment. Must be explicitly scoped to `hidden md:grid` — mobile keeps the existing flex layout.

**3. Extracted sub-components**

`EcomHeader` internally composes:
- `HeaderLogo` — logo + site name link (shared between mobile and desktop views)
- `NavLinks` — the center nav links (Products, About Us, Track Order) with active state
- `HeaderActions` — the right section: cart icon, auth-conditional links/buttons, language switcher
- `MobileNav` — the Sheet-based mobile menu (moved as-is from current AppLayout)

These are helper components within the same file or colocated. They don't need separate files at this scale.

**4. Bolder header design (per brand identity)**

| Property | Current | New |
|---|---|---|
| Height | `h-14` (3.5rem) | `h-16` (4rem) |
| Shadow | `shadow-xs` | `shadow-md` |
| Logo font | `text-lg font-bold` | `text-xl font-extrabold` (Figtree 800, brand display weight) |
| Nav link font | `text-sm font-medium` | `text-sm font-semibold` (Figtree 600) |
| Underline indicator | `h-0.5` | `h-0.5` (same, but color: `--primary` instead of `--foreground`) |
| Backdrop | `backdrop-blur-sm` | `backdrop-blur-md` |
| Border | `border-b` (1px) | `border-b-2` (for visual weight) |

The taller height, heavier shadow, and bolder typography align with the brand's "confident, streetwear-drop" energy. The header should feel like a destination, not a utility bar.

**5. Route for /about**

Add to the existing router config (likely in `src/modules/ecom/` router file). A lazy-loaded page component `AboutPage` rendering static content. No API calls — purely presentational.

**6. Language switcher as placeholder**

A `<button>` or `<span>` showing "EN" with a subtle dropdown icon. No actual locale switching. Acts as a visual placeholder that makes the header layout complete for unauthenticated users. Easy to wire up when i18n is implemented.

## Risks / Trade-offs

- **[Risk] Cart badge duplication** — Currently the cart badge appears in two places: as an inline badge on the Cart nav link (desktop) and as a standalone icon button (mobile). After moving cart to the right section, the desktop cart becomes an icon button matching the mobile style. This consolidates the pattern. Trade-off: one less badge variant to maintain.
- **[Risk] Mobile nav still uses old NavItems** — The mobile Sheet currently renders `NavItems` which includes both nav links and auth links. After refactor, the mobile Sheet needs to render the nav links and auth actions that match the desktop sections. Since mobile layout is unchanged, we keep the existing rendering but feed it from the new components.
- **[Risk] About Us route collisions** — Ensure `/about` doesn't conflict with any existing routes or catch-all patterns.
