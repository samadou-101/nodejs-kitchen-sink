## Context

The project has a custom Google OAuth flow using raw `fetch()` to Google's OAuth2 endpoints. A `passport/` directory already exists in the OAuth folder but is empty. The custom flow works as a sandbox demo — no User records are created, no sessions established, just an OAuthAccount upsert and a JWT returned via URL redirect.

This change adds a Parallel Passport.js implementation. Since the functional behavior (OAuthAccount upsert, JWT signing, frontend redirect) is identical, the design reuses the existing service layer and only replaces the HTTP-handling portion (URL generation → token exchange → profile fetch) with Passport's declarative strategy.

## Goals / Non-Goals

**Goals:**
- Provide a Passport.js-based Google OAuth flow at `/api/auth/oauth/passport/google/` that produces identical behavior to the custom flow
- Add a frontend dropdown in the OAuth component to toggle between Custom and Passport implementations
- Keep both implementations stateless (no Express sessions, no `serializeUser`)
- Allow passing the OAuth method choice from frontend to backend

**Non-Goals:**
- No User model integration — OAuth stays sandbox-only
- No Express session middleware (`passport.session()` is not used)
- No changes to the Prisma schema or OAuthAccount model
- No changes to the frontend success page (`/oauth/success`)
- No Google strategy configuration UI

## Decisions

### Decision: Stateless Passport (no sessions)
Passport is used solely for the OAuth strategy flow (redirect → code → token → profile). The `session: false` option is passed to `passport.authenticate()`, and no `serializeUser`/`deserializeUser` functions are registered. This keeps the Passport path aligned with the custom path, which is also stateless.

### Decision: Shared service layer
The `passport.service.ts` calls the same `handleGoogleCallback` pattern as the custom version (upsert OAuthAccount → sign JWT). No code is duplicated at the service level.

### Decision: Passport redirects directly (different from custom)
The custom flow returns a JSON `{ url }` that the frontend then navigates to via `window.location.href`. The Passport flow redirects directly (Passport issues a 302 to Google). The frontend selects which approach to use via the dropdown:
- **Custom**: `fetch(/url) → JSON → window.location.href = json.url`
- **Passport**: `window.location.href = /passport/google/url` (the response is a redirect, not JSON)

### Decision: Separate controller for passport routes
A `passport.controller.ts` handles the two Passport routes, keeping concerns separated from the custom controller. Both share the same `auth.routes.ts` for mounting.

### Decision: No passport.initialize() middleware at app level
Since Passport is used only for two specific OAuth routes (not globally), `passport.initialize()` is called inline within the controller or route handler rather than at the Express app level. This avoids polluting global middleware for a sandbox feature.

## Risks / Trade-offs

- **[Frontend UX variance]** The Custom flow requires two HTTP round-trips (fetch URL → redirect to Google), while Passport does it in one (redirect directly to Google). Users toggling between them will see slightly different timing. → Mitigation: trivial — this is a learning demo, the difference is educational.
- **[Passport version mismatch]** If express v5 changes how middleware chains work, Passport's `authenticate()` may behave differently. The project uses express 5.x. → Mitigation: test the strategy on express 5 early in implementation.
- **[No serializeUser means no req.user]** Since sessions are disabled, `req.user` is only available inside the callback handler's scope. → Mitigation: the JWT is immediately signed and the user is redirected, so `req.user` persistence across requests is unnecessary.
