## 1. New Components

- [ ] 1.1 Create `CatalogHero.tsx` — gradient hero banner with "Discover Products" heading, tagline, integrated SearchBar and CategoryFilter
- [ ] 1.2 Create `CategoryPills.tsx` — horizontal scrollable row of badge-style category pills, synced with the dropdown and categoryId state
- [ ] 1.3 Create `ActiveFilters.tsx` — removable filter chips for search term and category, with "Clear all" link when ≥2 filters active
- [ ] 1.4 Create `EmptyCatalogState.tsx` — contextual empty state with icon, heading, dynamic subtitle, and optional "Clear filters" button

## 2. Enhanced Pagination

- [ ] 2.1 Rewrite `Pagination.tsx` — page number buttons with variant toggle (`default` / `outline`), prev/next arrow icons, ellipsis for large page counts, total product count display
- [ ] 2.2 Implement ellipsis logic — show first, last, current page ±1 with `...` spans when total pages > 7

## 3. ProductGrid Enhancements

- [ ] 3.1 Add opacity transition wrapper — wrap `<ProductGrid>` in a div with `transition-opacity duration-200`, toggling `opacity-50` during background refetch
- [ ] 3.2 Gate transition to background refetch only — use `isFetching && !isLoading` condition to avoid flashing on initial load

## 4. Page Orchestration

- [ ] 4.1 Rewrite `ProductCatalogPage.tsx` — integrate CatalogHero, CategoryPills, ActiveFilters, result count, enhanced ProductGrid, EmptyCatalogState, and enhanced Pagination
- [ ] 4.2 Wire category pills to `setCategoryId` — ensure pills and dropdown stay in sync bidirectionally
- [ ] 4.3 Wire active filter chips to `setSearch` and `setCategoryId` for individual clear, and `resetFilters` for "Clear all"
- [ ] 4.4 Verify loading, empty, and populated states all render correctly end-to-end

## 5. Verification

- [ ] 5.1 Run dev server (`pnpm dev`) and verify page renders without errors
- [ ] 5.2 Test all filter interactions: search, category pills, dropdown, active chip dismiss, "Clear all"
- [ ] 5.3 Test pagination: page navigation, prev/next disabled states, ellipsis on large page counts
- [ ] 5.4 Test empty state: search for nonexistent term, filter empty category, clear filters from empty state
- [ ] 5.5 Test mobile: hero layout, pill scroll, responsive grid, page number button sizing
- [ ] 5.6 Run typecheck to ensure no TypeScript errors
