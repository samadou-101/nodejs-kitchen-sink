## Why

Error logs are generic and uninformative. When a service wraps an error with `throw new Error("Failed to remove product", { cause: error })`, the original error (e.g., Prisma P2003 foreign key violation) gets buried in `.cause`. The error middleware never inspects `.cause`, so it falls through to a catch-all `500 Internal Server Error` with only the wrapper's generic message logged. Debugging requires reproducing the issue with `LOG_LEVEL=debug`.

## What Changes

- Add an `unwrapError` helper in the error middleware that walks the `.cause` chain to find the root error
- Log the full error chain in the middleware (wrapper message + root cause details)
- Run `instanceof` classification checks against the unwrapped root error so Prisma errors, Zod errors, and AppErrors caught inside service wrappers are properly detected and handled
- No changes to service-layer code — the middleware is the single chokepoint fix

## Capabilities

### New Capabilities
- `error-handling`: structured error unwrapping and classification in the Express error middleware

### Modified Capabilities

*(none — no existing specs)*

## Impact

- One file: `src/modules/ecom/shared/error.middleware.ts`
- Log output becomes richer (includes root cause) without requiring `LOG_LEVEL=debug`
- Downstream error responses may change status codes (e.g., Prisma P2003 → 409 Conflict instead of 500) since the middleware can now classify wrapped errors correctly
