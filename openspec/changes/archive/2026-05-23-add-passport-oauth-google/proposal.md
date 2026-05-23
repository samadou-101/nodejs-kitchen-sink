## Why

The current Google OAuth implementation uses raw `fetch()` calls against Google's OAuth2 endpoints. This is a learning project, and adding a Passport.js implementation alongside it lets developers compare both approaches side-by-side — seeing how Passport abstracts the OAuth dance (URL generation, token exchange, profile fetch) into a declarative strategy while producing the same result.

## What Changes

- Add a new Passport.js-based Google OAuth flow under `/api/auth/oauth/passport/google/`
- Add `passport`, `passport-google-oauth20`, and their type definitions as dependencies
- Add a frontend dropdown in the existing OAuth demo component to toggle between "Custom" and "Passport" implementations
- Share the same `OAuthAccount` upsert logic and JWT signing between both implementations
- Share the same frontend success page — both flows redirect to `/oauth/success?token=...`

## Capabilities

### New Capabilities
- `passport-integration`: Passport.js strategy configuration, controller, and service for Google OAuth, mounted at `/api/auth/oauth/passport/google/`

### Modified Capabilities
- `google-oauth`: The existing spec gains additional endpoints (`/passport/google/url`, `/passport/google/callback`) and a frontend selector for choosing between Custom and Passport implementations

## Impact

- **New dependencies**: `passport`, `passport-google-oauth20`, `@types/passport`, `@types/passport-google-oauth20`
- **New backend files**: `src/api/auth/oauth/passport/` (strategy, controller, service)
- **Modified backend files**: `src/api/auth/auth.routes.ts` (add passport routes)
- **New frontend files**: `frontend/react/src/modules/overview/features/auth/oauth/passport/OAuthPassport.tsx`
- **Modified frontend files**: `frontend/react/src/modules/overview/features/auth/oauth/custom/OAuth.tsx` (add dropdown selector)
- **No schema changes**: `OAuthAccount` model remains unchanged
- **No User model changes**: OAuth stays standalone (sandbox demo)
