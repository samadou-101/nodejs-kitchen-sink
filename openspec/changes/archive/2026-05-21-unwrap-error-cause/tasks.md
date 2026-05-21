## 1. Error Middleware Changes

- [x] 1.1 Add `unwrapError` helper function that walks the `.cause` chain to find the root `Error`
- [x] 1.2 Update the logging block to include root cause details (`causeMsg`, `causeCode`, `causeMeta`, `causeName`) when a cause chain exists
- [x] 1.3 Update `instanceof` checks to classify errors against the unwrapped root (AppError, ZodError, Prisma.PrismaClientKnownRequestError)
- [x] 1.4 Ensure non-Error causes (plain objects, strings) don't trigger unwrapping and fall through gracefully

## 2. Verification

- [ ] 2.1 Start dev server and trigger a DELETE /api/ecom/product/:id that fails (e.g., product referenced by cart items)
- [ ] 2.2 Confirm log output shows root cause details (Prisma error code, message, metadata) alongside the wrapper message
- [ ] 2.3 Confirm the HTTP response uses the appropriate status code based on the root cause (409 for P2003 FK violation, not 500)
- [ ] 2.4 Confirm normal errors without `.cause` still log and respond identically to before
