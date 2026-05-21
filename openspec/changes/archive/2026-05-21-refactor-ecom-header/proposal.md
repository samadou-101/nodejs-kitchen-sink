## Why

The current header in `AppLayout.tsx` jams the logo, nav links, and auth controls into a single flex group with no clear spatial separation. As the ecom app grows (admin dashboard, employee orders, cart, language switcher), this pattern doesn't scale. We need a proper 3-section header that's extracted into its own component, making it maintainable and giving it the visual weight an e-commerce storefront deserves.

## What Changes

- Extract the `<nav>` block from `AppLayout.tsx` into a standalone `EcomHeader` component
- Split the desktop header into 3 distinct sections: left (logo), center (nav links), right (cart + auth actions)
- Add "About Us" nav link and its route
- Add a language switcher placeholder (right section) for unauthenticated users
- Wire up a Logout button (without logic — just UI)
- Increase header size and visual weight (bolder design)
- Keep mobile layout unchanged

## Capabilities

### New Capabilities
- `about-us-page`: A static About Us page at `/about` with a corresponding route
- `ecom-header`: Extracted header component with 3-section desktop layout, mobile Sheet nav, and auth-aware rendering
- `language-switcher`: Placeholder UI for future i18n switching (right section, unauthenticated state)

### Modified Capabilities
- *(none — no existing specs are changing at the requirement level)*

## Impact

- `frontend/react/src/modules/ecom/shared/components/AppLayout.tsx` — `<nav>` block extracted out
- `frontend/react/src/modules/ecom/shared/components/` — new file `EcomHeader.tsx` (or similar)
- `frontend/react/src/modules/ecom/` — new route for `/about`
- No backend or API changes
