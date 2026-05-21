## 1. Create About Us Page

- [ ] 1.1 Create `AboutPage.tsx` component with static store info content
- [ ] 1.2 Add `/about` route to the ecom router config (lazy-loaded)

## 2. Extract EcomHeader Component

- [ ] 2.1 Create `EcomHeader.tsx` with `HeaderLogo`, `NavLinks`, `HeaderActions`, and `MobileNav` sub-components
- [ ] 2.2 Implement `HeaderLogo` — logo + "E-Com Store" text link (reuse current diamond square icon)
- [ ] 2.3 Implement `NavLinks` — Products, About Us, Track Order links with active state (underline indicator + semibold)
- [ ] 2.4 Implement `HeaderActions` (desktop right section) — cart icon with badge, language switcher placeholder, auth-conditional Dashboard/My Orders links and Logout button
- [ ] 2.5 Implement `MobileNav` — Sheet-based menu matching current mobile layout (hamburger + cart icon)
- [ ] 2.6 Wire desktop 3-section grid layout (`grid grid-cols-3` with `justify-self` for each section, scoped to `hidden md:grid`)

## 3. Bolder Header Design

- [ ] 3.1 Increase header height to `h-16`, shadow to `shadow-md`, border to `border-b-2`
- [ ] 3.2 Upgrade logo typography to `text-xl font-extrabold`
- [ ] 3.3 Upgrade nav link typography to `text-sm font-semibold`
- [ ] 3.4 Apply increased backdrop blur to `backdrop-blur-md`

## 4. Update AppLayout

- [ ] 4.1 Remove inline `<nav>` block from `AppLayout.tsx`
- [ ] 4.2 Import and render `<EcomHeader />` in `AppLayout.tsx`
- [ ] 4.3 Remove unused imports from `AppLayout.tsx` (Sheet, SheetContent, SheetTrigger, icons, etc. now in EcomHeader)

## 5. Verify and Polish

- [ ] 5.1 Verify desktop 3-section layout renders correctly at various widths
- [ ] 5.2 Verify mobile layout is unchanged
- [ ] 5.3 Verify cart badge shows on both mobile and desktop
- [ ] 5.4 Verify auth states (unauthenticated, admin, employee, both roles) render correct right-section content
- [ ] 5.5 Verify About Us route works and nav link highlights
- [ ] 5.6 Run `pnpm dev` and confirm no console errors
