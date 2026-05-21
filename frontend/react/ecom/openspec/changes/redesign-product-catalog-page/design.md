## Context

The product catalog page (`src/features/product-catalog/components/ProductCatalogPage.tsx`) is the landing page for all unauthenticated users. It currently renders a plain "Products" heading, a search bar + category dropdown, a product grid, and prev/next pagination. The design system (DESIGN.md) prescribes restrained color (cool-tinted mist base, primary at ≤10% surface), utility-first motion (200ms transitions, no decorative animation), and Figtree Variable typography. The brand personality (PRODUCT.md) is "Modern, Minimal, Trustworthy" with Linear-inspired restraint and Shopify-inspired product clarity.

## Goals / Non-Goals

**Goals:**
- Introduce a hero section that feels vibrant without violating the restrained color strategy
- Add category pills for one-tap browsing alongside the existing dropdown
- Show active filters as removable chips for clear filter state feedback
- Display inline result count that reacts live to filter changes
- Upgrade pagination to show page numbers with ellipsis
- Add a polished empty state with suggestions and a reset CTA
- Apply a smooth opacity transition on the grid during data refetches

**Non-Goals:**
- No API changes or new backend endpoints
- No new external dependencies
- No changes to ProductCard, SkeletonCard, SearchBar, or CategoryFilter component interfaces
- No decorative entrance animations, bounce/elastic easings, or page transitions
- No dark mode toggle changes

## Decisions

### 1. Hero gradient approach

The hero needs visual impact without adding a saturated brand accent. Solution: `bg-gradient-to-b from-primary/[0.03] to-background` — a 3% tint of the near-black primary at the top, fading to the page background. Barely perceptible as a color, but creates a subtle atmospheric depth. The heading uses `text-3xl font-semibold tracking-tight` with a muted tagline beneath it. The search bar and category dropdown sit in a row below the tagline, visually integrated rather than separated by whitespace. The search icon (Search01Icon from @hugeicons/react) is placed inside the input.

**Alternatives considered:**
- Full gradient with actual brand color: Rejected — violates restrained strategy (primary should stay ≤10%)
- Background pattern/geometric shapes: Rejected — "no decorative elements that compete with content"

### 2. Category pills alongside dropdown

The existing `CategoryFilter` component (a `<Select>`) remains for browsing the full category list. Above the grid, we add `CategoryPills` — a horizontal scrollable row of `badge` components. The first 6-8 categories from `useCategories()` are shown as pills. Active pill gets `variant="default"` (filled near-black), inactive gets `variant="outline"` (border only). Clicking a pill sets the category filter; clicking the active pill clears it. This gives instant one-tap filtering without replacing the dropdown.

**Alternatives considered:**
- Removing the dropdown entirely: Rejected — dropdown remains useful for long category lists on mobile
- Only pills, no dropdown: Rejected — mobile users need the full list accessible

### 3. Active filters layout

`ActiveFilters` renders between the pills bar and the grid when filters are active. Each active filter (search term, selected category) renders as a `badge` with `variant="secondary"` and an `×` icon button (using `CloseIcon` from @hugeicons/react, size 14px). Clicking `×` clears that specific filter. If both search and category are active, both chips appear. A "Clear all" link appears at the end when ≥2 filters are active. The component uses `transition-all duration-200` on the container so chips animate in/out as filters change.

### 4. Result count placement

A small `span` in the controls bar (same row as the sort area, right-aligned) shows "X products" or "X of Y products" using `text-sm text-muted-foreground`. Hidden when loading (shows skeleton text instead). Updates reactively when filters change. When the grid is empty, it shows "No results" with matching styling — the empty state component handles the full visual, but the count text still reflects zero.

### 5. Pagination with page numbers

Replace the existing prev/next buttons with a `nav` element containing:
- Previous button (disabled on page 1)
- Page number buttons (using `button` with `variant={page === i ? 'default' : 'outline'}`, `size="icon"`)
- Ellipsis (`...` as a span, not a button) when page count exceeds 7
- Next button (disabled on last page)

Logic: Show first page, last page, current page ±1, with ellipsis in between. E.g., for 20 pages on page 8: `[1] [...] [7] [8] [9] [...] [20]`. Uses `cn()` utility for button class merging. `transition-all duration-200` on buttons.

**Alternatives considered:**
- Infinite scroll: Rejected — pagination is simpler, more predictable, and matches the existing pattern
- "Load more" button: Rejected — pagination is already the established UX contract

### 6. Empty state

`EmptyCatalogState` renders when `data?.data` is an empty array and loading is done. Shows:
- A large centered icon (SearchIcon or PackageIcon from @hugeicons/react, `text-muted-foreground/40`, `size-16`)
- "No products found" heading (`text-lg font-medium`)
- Context-specific subtitle: if search is active, "No results for "{search}" — try a different search term or clear your filters." If a category is active, "No products in this category yet." If both, combine messages.
- A "Clear filters" button (`variant="outline"` size="sm") that triggers `resetFilters()`.

### 7. Grid transition on data fetch

Wrap the `<ProductGrid>` in a container div with `transition-opacity duration-200`. When `isLoading` changes from true to false (data arrives), a brief opacity fade makes the grid feel connected to filter changes. Key: use `opacity-50` during refetch (background refetch, not initial load) and `opacity-100` when data is stable. This avoids flashing on initial page load.

## Risks / Trade-offs

- **[Performance] Category pills fetch all categories upfront** → Mitigation: `useCategories` caches via React Query (staleTime 30s). The data is already loaded for the dropdown, so there's zero additional network cost.
- **[Usability] Category pills may overflow on small screens** → Mitigation: Use `overflow-x-auto` with `scrollbar-none` and `flex-shrink-0` on pills. The horizontal scroll is intuitive on mobile.
- **[Motion] Grid opacity transition might flicker** → Mitigation: Only apply the transition class when `isFetching` (background refetch) is true, not on initial `isLoading` state. Gate with `className={isFetching && !isLoading ? 'transition-opacity duration-200 opacity-50' : 'opacity-100'}`.
- **[UX] Page numbers with ellipsis add complexity** → Mitigation: Standard pattern used by every major e-commerce site. Users already understand it. The implementation is a simple JS conditional.
