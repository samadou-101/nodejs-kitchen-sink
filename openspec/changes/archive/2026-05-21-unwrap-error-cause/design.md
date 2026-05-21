## Context

The Express error middleware (`src/modules/ecom/shared/error.middleware.ts`) classifies errors using `instanceof` checks against `AppError`, `ZodError`, and `Prisma.PrismaClientKnownRequestError`. When a service wraps an error — e.g., `throw new Error("Failed to remove product", { cause: prismaError })` — the `instanceof` checks fail against the wrapper, the original error is lost in `.cause`, and the middleware falls through to a generic `500 Internal Server Error` with a useless log message.

The log output currently shows only:

```
errMsg: "Failed to remove product"
errName: "Error"
```

The root cause (e.g., Prisma P2003 foreign key violation) is invisible unless `LOG_LEVEL=debug` is set.

## Goals / Non-Goals

**Goals:**

- Every logged error includes the root cause chain, not just the outermost wrapper message
- `instanceof` classification works regardless of how many levels of `.cause` wrapping exist
- Zero changes to service-layer code (the 11+ files with try/catch patterns)
- Prisma errors, Zod errors, and AppErrors caught inside wrappers are properly detected and yield appropriate HTTP status codes

**Non-Goals:**

- Not changing how services throw errors (that's a separate concern)
- Not adding logging infrastructure beyond the middleware
- Not modifying the client-facing error response format

## Decisions

**Decision 1: Unwrap in middleware, not in services**

Services wrap errors with contextual messages ("Failed to remove product"). The middleware approach preserves this context while also surfacing the root cause.

Alternatives considered:
- Unwrap at each service catch site — more code changes, easy to forget
- Custom `AppError` with cause-awareness — requires modifying the `AppError` class and all throw sites

**Decision 2: Walk the full `.cause` chain, not just one level**

An error could be wrapped multiple times (e.g., service → repository → Prisma). Walking the chain to the deepest `Error` ensures the root cause is always found.

```ts
function unwrapError(err: Error): Error {
  let current: unknown = err;
  while (current instanceof Error && current.cause instanceof Error) {
    current = current.cause;
  }
  return current instanceof Error ? current : err;
}
```

**Decision 3: Log both the wrapper chain and the root cause**

The log will include:
- `errMsg` — the outermost wrapper message (e.g., "Failed to remove product")
- `causeMsg` — the root cause message (e.g., "Foreign key constraint failed on `CartItem`")
- `causeCode` — error code if the root is a Prisma error (e.g., "P2003")
- `causeMeta` — error metadata if available
- `causeName` — the root error type name

This gives full visibility without requiring `LOG_LEVEL=debug`.

**Decision 4: Run `instanceof` against the unwrapped root error**

Instead of `if (err instanceof Prisma.PrismaClientKnownRequestError)`, use:

```ts
const root = unwrapError(err);
if (root instanceof Prisma.PrismaClientKnownRequestError) { ... }
```

This ensures proper classification of wrapped errors.

## Risks / Trade-offs

- **[Perf]** Walking the `.cause` chain is O(n) where n is chain depth. In practice, chain depth is 1-2 levels, making this negligible.
- **[Semantics]** If a plain `Error` legitimately wraps another plain `Error`, unwrapping could lose the wrapper's intended semantics. Mitigation: both messages are logged, and the wrapper message is preserved as `errMsg`.
- **[Completeness]** `error.cause` can be any type, not just `Error`. The `unwrapError` function only walks `Error` causes, leaving non-Error causes in place.
