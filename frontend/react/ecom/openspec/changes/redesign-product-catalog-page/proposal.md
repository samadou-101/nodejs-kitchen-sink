## Why

The product catalog page is the primary customer-facing landing page, but its current implementation is flat and utilitarian: a plain "Products" heading, basic search bar, dropdown filter, and a card grid. For a COD e-commerce storefront that must build trust and confidence at first glance, the catalog needs to feel vibrant, responsive, and product-forward — without violating the project's design principles of restraint and utility-first motion.

## What Changes

- Replace the plain "Products" header with a visually rich hero section (subtle gradient, tagline, integrated search + category filter)
- Add quick-filter category pills for tactile one-tap browsing alongside the existing dropdown
- Display active filters as removable chips with real-time feedback on clear
- Show inline result count ("24 products") that reacts to filter changes
- Upgrade pagination from plain prev/next to page numbers with ellipsis
- Introduce a polished empty state with search suggestions and a reset-filters CTA
- Add smooth `transition-opacity` on the product grid when data refetches, making filter changes feel connected
- Keep all existing components (ProductCard, SkeletonCard, SearchBar, CategoryFilter) intact — no breaking changes

## Capabilities

### New Capabilities
- `catalog-hero`: Hero section with gradient background, tagline, and integrated search/category controls
- `active-filters`: Removable filter chips showing current search/category state
- `category-pills`: Quick-filter badge-style pills for popular categories
- `empty-catalog-state`: Polished empty state with illustration, suggestions, and reset CTA
- `pagination-enhanced`: Page-number-based pagination with ellipsis

### Modified Capabilities

No existing specification-level capabilities are being modified. All changes are additive within the product-catalog feature.

## Impact

- **Files modified**: `ProductCatalogPage.tsx`, `Pagination.tsx`, `ProductGrid.tsx`
- **Files created**: `CatalogHero.tsx`, `ActiveFilters.tsx`, `CategoryPills.tsx`, `EmptyCatalogState.tsx`
- **No API changes** — UI-only enhancements
- **No new dependencies** — uses existing shadcn/ui components (Button, Badge, Input, Select)
- **No breaking changes** — all existing behavior preserved
