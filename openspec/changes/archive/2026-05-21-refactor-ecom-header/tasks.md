## 1. Create About Us Page

- [x] 1.1 Create `AboutPage.tsx` component with static store info content
- [x] 1.2 Add `/about` route to the ecom router config (lazy-loaded)

## 2. Extract EcomHeader Component

- [x] 2.1 Create `EcomHeader.tsx` with `HeaderLogo`, `NavLinks`, `HeaderActions`, and `MobileNav` sub-components
- [x] 2.2 Implement `HeaderLogo` — logo + "E-Com Store" text link (reuse current diamond square icon)
- [x] 2.3 Implement `NavLinks` — Products, About Us, Track Order links with active state (underline indicator + semibold)
- [x] 2.4 Implement `HeaderActions` (desktop right section) — cart icon with badge, language switcher placeholder, auth-conditional Dashboard/My Orders links and Logout button
- [x] 2.5 Implement `MobileNav` — Sheet-based menu matching current mobile layout (hamburger + cart icon)
- [x] 2.6 Wire desktop 3-section grid layout (`grid grid-cols-3` with `justify-self` for each section, scoped to `hidden md:grid`)

## 3. Bolder Header Design

- [x] 3.1 Increase header height to `h-16`, shadow to `shadow-md`, border to `border-b-2`
- [x] 3.2 Upgrade logo typography to `text-xl font-extrabold`
- [x] 3.3 Upgrade nav link typography to `text-sm font-semibold`
- [x] 3.4 Apply increased backdrop blur to `backdrop-blur-md`

## 4. Update AppLayout

- [x] 4.1 Remove inline `<nav>` block from `AppLayout.tsx`
- [x] 4.2 Import and render `<EcomHeader />` in `AppLayout.tsx`
- [x] 4.3 Remove unused imports from `AppLayout.tsx` (Sheet, SheetContent, SheetTrigger, icons, etc. now in EcomHeader)

## 5. Verify and Polish

- [x] 5.1 Verify desktop 3-section layout renders correctly at various widths
- [x] 5.2 Verify mobile layout is unchanged
- [x] 5.3 Verify cart badge shows on both mobile and desktop
- [x] 5.4 Verify auth states (unauthenticated, admin, employee, both roles) render correct right-section content
- [x] 5.5 Verify About Us route works and nav link highlights
- [x] 5.6 Run `pnpm dev` and confirm no console errors
