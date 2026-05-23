## Context

Building a custom Google OAuth 2.0 flow as a sandbox/practice exercise. The backend lives in `src/api/auth/oauth/custom/` (existing empty stubs). The frontend component lives in `overview/features/auth/oauth/custom/OAuth.tsx`. No integration with the ecom module — this is purely for learning.

The existing auth system uses both JWT and session-based flows. This OAuth practice will use JWT for simplicity.

## Goals / Non-Goals

**Goals:**
- Implement the full OAuth 2.0 authorization code flow manually (no Passport.js)
- Create a separate `OAuthAccount` model to store provider identity
- Allow users to authenticate via Google and see their profile info on a success page
- Use JWT (unsigned on frontend) to carry user data from backend to frontend

**Non-Goals:**
- Integration with ecom auth or RBAC system
- Account linking with existing password accounts
- Refresh token rotation or token revocation
- Multiple OAuth providers (Google only)

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| OAuth library | None (raw `fetch`) | Practice goal — understand the handshake at HTTP level |
| Auth strategy | JWT in URL query param | Simple, no cookies needed for sandbox, no FE verification |
| OAuthAccount model | Standalone, no FK to `User` | Keeps practice isolated from the existing auth system |
| Frontend token handling | Base64-decode JWT payload | No secret on FE, this is a learning exercise |
| Redirect after callback | Frontend success page with token in URL | Simplest flow — backend redirects browser with `?token=xxx` |
| Google API endpoint | `oauth2/v2/userinfo` | Returns name, email, avatar in one call |

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| JWT exposed in URL query param | This is a sandbox — acceptable. In production, use httpOnly cookie + POST flow |
| No CSRF protection (state param) | Acceptable for learning. A production flow should use `state` to prevent CSRF |
| Token never expires on FE | FE stores token in-memory only (not localStorage) — refresh clears it |
| No error handling for bad codes | Backend returns a simple error redirect for now |
