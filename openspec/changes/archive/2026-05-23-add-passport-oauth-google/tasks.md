## 1. Dependencies

- [x] 1.1 Install `passport`, `passport-google-oauth20`, `@types/passport`, `@types/passport-google-oauth20`

## 2. Backend — Passport Strategy & Setup

- [x] 2.1 Create `src/api/auth/oauth/passport/google.strategy.ts` — configure `GoogleStrategy` with env vars, write verify callback that receives profile and calls `done(null, profile)`
- [x] 2.2 Create `src/api/auth/oauth/passport/passport.setup.ts` — initialize Passport, register the Google strategy, export the configured passport instance

## 3. Backend — Passport Service

- [x] 3.1 Create `src/api/auth/oauth/passport/passport.service.ts` — export `initiateGoogleAuth()` (placeholder, Passport handles this) and `handleGoogleCallback(profile)` that upserts `OAuthAccount` and signs the JWT (reuse the same upsert + JWT logic from the custom service)

## 4. Backend — Passport Controller

- [x] 4.1 Create `src/api/auth/oauth/passport/passport.controller.ts` — export `passportAuthHandler` that checks `req.path`:
  - `/auth/oauth/passport/google/url` → `passport.authenticate("google", { scope: ["openid", "email", "profile"], session: false })`
  - `/auth/oauth/passport/google/callback` → `passport.authenticate("google", { session: false })` with a custom `res.redirect` to frontend with JWT or error

## 5. Backend — Route Mounting

- [x] 5.1 Update `src/api/auth/auth.routes.ts` — add the two passport routes:
  - `apiRouter.get("/auth/oauth/passport/google/url", passportAuthHandler)`
  - `apiRouter.get("/auth/oauth/passport/google/callback", passportAuthHandler)`

## 6. Frontend — Passport OAuth Component

- [x] 6.1 Create `frontend/react/src/modules/overview/features/auth/oauth/passport/OAuthPassport.tsx` — identical UI to the custom OAuth component, but calls `/api/auth/oauth/passport/google/url` via `window.location.href` directly (no fetch)

## 7. Frontend — OAuth Method Dropdown

- [x] 7.1 Modify `frontend/react/src/modules/overview/features/auth/oauth/custom/OAuth.tsx` — add a dropdown selector above the login button with options "Custom" and "Passport"
- [x] 7.2 Wire the dropdown state to render either the existing (Custom) flow or import and render `OAuthPassport` component

## 8. Verification

- [ ] 8.1 Start dev server (`pnpm dev`) and confirm both Custom and Passport flows work end-to-end
- [ ] 8.2 Confirm the frontend dropdown switches between methods correctly
- [ ] 8.3 Confirm both flows produce the same `OAuthAccount` upsert and JWT redirect behavior
