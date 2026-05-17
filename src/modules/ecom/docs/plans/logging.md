# Logging Plan — From `console.log` to Production Structured Logging

> A deep dive into logging for someone new to the topic. Covers what logging is, why the `console.log` approach breaks down, the different methods and tools available, and a concrete migration plan for this codebase.

---

## 1. Why Logging Matters

Logging is the primary way a running application tells you what it's doing. When you can't attach a debugger (production, staging, or even a local server handling real traffic), logs are your eyes into the system. They serve three main purposes:

| Purpose | What it looks for |
|---------|-------------------|
| **Debugging** | "What values did this variable have?" "Did this branch execute?" |
| **Monitoring** | "How many requests per second?" "What's the error rate?" |
| **Auditing** | "Who deleted that order?" "When was the payroll confirmed?" |

### Why `console.log` isn't enough

The codebase currently has **10 `console.log`/`console.error` calls** spread across 6 files. This works for a quick hack, but breaks down fast:

| Problem | Example |
|---------|---------|
| **No log levels** | A debug message and a critical error look the same — you can't filter |
| **No structure** | Logs are free-text strings — grep works, but machines (log aggregators, alerting) can't parse them |
| **No timestamps** | You get the time `console.log` was called, but not in a consistent format |
| **No context** | Two concurrent requests interleave their `console.log` output — you can't tell which log line belongs to which request |
| **No control** | In production you can't turn `console.debug` off without changing code |
| **Performance** | `console.log` is synchronous and blocks the event loop under load |

---

## 2. The Evolution — Different Logging Methods

### A. Plain `console.log` — ad-hoc text

```
console.log("User logged in:", userId)
```

**What's wrong:** Unstructured, no level, no timestamp, no machine readability. Fine for a 50-line script, dangerous for a server handling real traffic.

### B. Log Levels

Log levels let you classify messages by severity. The standard levels (from most to least verbose):

| Level | Meaning | Example use |
|-------|---------|-------------|
| `trace` | Step-by-step execution details | "Entering function X with args Y" |
| `debug` | Development diagnostics | "Query returned 42 rows" |
| `info` | Normal operations | "Order #123 confirmed" |
| `warn` | Something unexpected but handled | "Rate limit approaching for IP X" |
| `error` | Failure that needs attention | "Database connection failed" |
| `fatal` | Process is about to crash | "Cannot connect to DB on startup, exiting" |

**Why levels matter:**
- In development, show everything (including `debug`/`trace`)
- In production, only show `info` and above (noise reduction)
- On-call gets paged for `error`/`fatal` only
- Levels let you *increase* verbosity for a specific request without restarting (via runtime config)

### C. Structured (JSON) Logging

Instead of free-text, you log a JSON object:

```json
{"level": "info", "time": "2026-05-17T10:30:00Z", "msg": "Order confirmed", "orderId": "123", "userId": "42"}
```

**Benefits:**
- **Machines can parse it** — log aggregators (ELK, Grafana Loki, Datadog) index each field
- **Filterable** — grep for a specific `orderId` across all logs
- **Queryable** — "Show me all `error` logs where `service = 'auth'` in the last hour"
- **Alertable** — "Alert if `error` level > 5/min"

**What to include (and not include):**

| Do log | Don't log |
|--------|-----------|
| Request ID, userId, entity IDs | Passwords, tokens, secrets |
| Operation name, module | Full request/response bodies (in most cases) |
| Duration, status code | Credit card numbers, PII |
| Error name, message, stack | Internal IPs/architecture details |
| Correlation/trace ID | Session tokens in plain text |

### D. Transports & Destinations

A "transport" is where the log line ends up:

| Transport | When to use |
|-----------|-------------|
| **stdout/stderr** | Default in containerized environments (Docker, Kubernetes) — the container runtime captures stdout |
| **File** | Traditional servers — requires log rotation |
| **External service** | Production — send to Datadog, Grafana Loki, ELK, Papertrail |
| **Database** | Audit logs only — not for general purpose (too slow, too much volume) |

**Rule of thumb for Node.js:** Always log to `stdout` in JSON. Let the infrastructure (Docker, systemd, orchestrator) handle routing to a file or external service. The app should not concern itself with file paths or rotation.

### E. Request-Scoped Context (Correlation ID)

Without a correlation ID, logs from concurrent requests get interleaved:

```
[17:30:01] Order confirmed for user 42
[17:30:01] Order confirmed for user 7
[17:30:01] Payment failed for order 100
```

Which order failed? You can't tell.

With a correlation ID (a UUID generated per-request):

```
{"time":"...", "level":"info", "reqId":"abc", "msg":"Order confirmed", "userId":42}
{"time":"...", "level":"info", "reqId":"def", "msg":"Order confirmed", "userId":7}
{"time":"...", "level":"error", "reqId":"abc", "msg":"Payment failed", "orderId":100}
```

Now you can trace the full lifecycle of request `abc` — it confirmed an order, then payment failed. Correlation IDs are the foundation of distributed tracing.

**Pattern:** Generate a UUID in a middleware at the top of the request chain, attach it to `req` and `res`, and pass it to every logger call downstream.

### F. Log Sampling & Rate Limiting

Under heavy load, logging *everything* becomes expensive (CPU, I/O, storage). Strategies:

- **Sampling:** Log 1 in every 100 requests at `info`, but always log errors
- **Deduplication:** If the same error fires 1000 times in a second, log it once with a count
- **Dynamic level:** Allow changing the log level at runtime (e.g., via an API endpoint) for debugging a specific request

Most teams don't need this until they hit 1000+ req/s. Start simple, add sampling when it becomes a problem.

---

## 3. Logger Library Showdown

| Feature | Pino | Winston | Morgan |
|---------|------|---------|--------|
| **Performance** | Fastest (benchmarked ~2x winston) | Slower (string interpolation + transport overhead) | HTTP-only, very fast |
| **JSON output** | Native (always JSON to stdout) | Requires a formatter | Line protocol (not structured) |
| **Levels** | trace, debug, info, warn, error, fatal | Same + custom levels | Only combined/dev/formats |
| **Child loggers** | `logger.child({ module: 'auth' })` — built-in | `.child()` — built-in | N/A |
| **Transports** | Core: stdout, file, socket. Ecosystem: pino-loki, pino-datadog | Built-in: file, HTTP, console, many more | None (stdout only) |
| **Async logging** | Yes (async writing to transports) | Yes | N/A |
| **Pretty printing** | `pino-pretty` (dev only, never in prod) | Built-in format options | Built-in formats |
| **Express integration** | `pino-http` (logs req/res automatically) | `express-winston` | Morgan IS an Express middleware |
| **Popularity** | ~45k GitHub stars, used by Fastify, etc. | ~23k stars, older ecosystem | ~28k stars, Express standard |
| **Bundle size** | ~10KB | ~80KB | ~15KB |

### Recommendation

**Use Pino for this codebase.** Here's why:

1. **It's the fastest Node.js logger** — important because logging is on the hot path of every request. Pino claims ~2x throughput of Winston.
2. **JSON-native** — Pino writes JSON lines to stdout by default. No configuration needed. This is exactly what Docker/Kubernetes/cloud services expect.
3. **Lightweight** — ~10KB, zero dependencies that matter. Winston pulls in multiple transitive deps.
4. **Child loggers** — `pino.child({ module: 'auth' })` adds a `"module":"auth"` field to every log line automatically. This is invaluable for filtering.
5. **`pino-http`** — drops-in as Express middleware for automatic request logging (method, path, status, duration) with correlation ID support.
6. **`pino-pretty`** — for local development, pipe pino through `pino-pretty` to get human-readable colored output. Never use it in production.

**Where Winston wins:** If you need complex multi-transport setups (log errors to one file, info to another, send some to a remote syslog server) out of the box without extra packages. For this codebase's scale, Pino's simplicity is an advantage.

**Where Morgan fits:** Morgan is purely an Express request-logging middleware. If you want to keep things minimal, you could use Morgan for request logging and Pino for application logging. But `pino-http` does the same job with structured output, so there's no reason for both.

---

## 4. Best Practices & Anti-Patterns

### Do this ✅

```
// ✅ Structured, leveled, contextual
logger.info({ orderId, userId, amount }, "Order confirmed")

// ✅ Child logger for module context
const orderLogger = logger.child({ module: 'order' })
orderLogger.error({ err, orderId }, "Failed to confirm order")

// ✅ Always pass Error objects directly (pino serializes the stack)
logger.error({ err }, "Database query failed")

// ✅ Include correlation ID on every log
logger.info({ reqId: req.id, orderId }, "Processing order")
```

### Don't do this ❌

```
// ❌ Unstructured, no level, no context
console.log("Order confirmed for user", userId)

// ❌ String interpolation — lose machine readability
logger.info(`Order ${orderId} confirmed for user ${userId}`)

// ❌ Logging sensitive data
logger.info({ password: req.body.password }, "User registration")

// ❌ Catching and logging without re-throwing (swallowing)
try { ... }
catch (err) {
  console.error(err) // swallowed — caller never knows
}

// ❌ Logging in a tight loop without sampling
for (const item of items) {
  logger.debug({ item }, "Processing item") // 10k logs/second
}
```

### Error logging pattern

Always log errors in the catch block, then re-throw or pass to the error handler:

```typescript
try {
  const order = await findOrder(id)
  if (!order) throw new NotFoundError("Order not found")
  return order
}
catch (err) {
  logger.error({ err, orderId: id }, "Failed to find order")
  throw err // re-throw to the global error handler
}
```

The global error handler should log the final error before sending the response — no middleware should log the same error twice.

### What to log by level

| Level | What goes here |
|-------|----------------|
| `debug` | SQL queries, function entry/exit, variable values (dev only) |
| `info` | Request lifecycle: "Order created", "User logged in", "Payment confirmed" |
| `warn` | Deprecation notices, rate limit warnings, retry attempts |
| `error` | Caught exceptions, failed operations, business rule violations |
| `fatal` | Uncaught exceptions, startup failures, DB connection loss |

---

## 5. Current State in This Codebase

| File | Line | Current call | Problem |
|------|------|-------------|---------|
| `src/modules/ecom/shared/error.middleware.ts` | 30 | `console.error("[ErrorMiddleware]", err)` | No structure, no level, no context beyond the error |
| `src/modules/ecom/auth/rbac/rbac.seed.ts` | 88 | `console.log("Seeding...")` | Seed script — low concern, but inconsistent |
| `src/modules/ecom/auth/rbac/rbac.seed.ts` | 132 | `console.log("Seeded successfully")` | Same |
| `src/modules/ecom/auth/rbac/rbac.context.ts` | 34 | `console.error("Authentication error:", error)` | No structure, swallows into catch |
| `src/modules/ecom/order/order.service.ts` | 240 | `console.error("[updateOrderStatus] Error:", error)` | No structure, no orderId in the log |
| `src/modules/ecom/admin/repo/employee.repo.ts` | 11 | `console.log(email, "from repo")` | Leftover dev debug |
| `src/modules/ecom/admin/services/auth.service.ts` | 17 | `console.log(inPendingList)` | Leftover dev debug |

Additionally:
- No request ID / correlation ID anywhere
- No request logging middleware (no tracking of method/path/status/duration)
- No structured logger installed or configured
- The production-gaps doc lists "No structured logger", "No request ID", "No request logging middleware" as Tier 1 ship-blockers

---

## 6. Implementation Plan

### Phase 1 — Install & Configure Pino

**Step 1. Install packages**

```bash
pnpm add pino pino-http
pnpm add -D pino-pretty
```

- `pino` — the logger itself
- `pino-http` — Express middleware for automatic request/response logging
- `pino-pretty` — dev-only prettifier (never in production)

**Step 2. Create logger singleton**

File: `src/modules/ecom/shared/logger.ts`

```typescript
import pino from "pino"

const isDev = process.env.NODE_ENV !== "production"

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:standard" },
    },
  }),
  redact: {
    paths: ["password", "token", "secret", "authorization", "cookie"],
    censor: "[REDACTED]",
  },
})
```

Key design decisions:
- **`level`** is configurable via `LOG_LEVEL` env var, defaults to `debug` in dev, `info` in production
- **`pino-pretty`** only activates in development — production logs raw JSON to stdout
- **`redact`** automatically censors sensitive fields across all log calls — a safety net

### Phase 2 — Add Request Context

**Step 3. Create request-context middleware**

File: `src/modules/ecom/shared/request-context.middleware.ts`

This middleware:
- Generates a `req.id` (UUID v4) on every incoming request
- Sets `res.setHeader("X-Request-Id", req.id)` for client-side tracing
- Creates a child logger bound to that request ID and attaches it to `req.log`
- Records start time for duration measurement

```typescript
import { randomUUID } from "node:crypto"
import type { Request, Response, NextFunction } from "express"
import { logger } from "./logger"

declare global {
  namespace Express {
    interface Request {
      id: string
      log: ReturnType<typeof logger.child>
    }
  }
}

export function requestContext(req: Request, _res: Response, next: NextFunction) {
  req.id = (req.headers["x-request-id"] as string) ?? randomUUID()
  req.log = logger.child({ reqId: req.id })
  next()
}
```

Why extend `req` instead of passing context manually: Every downstream middleware and route handler has access to `req.log` without modifying function signatures.

### Phase 3 — Wire Request Logging

**Step 4. Add `pino-http` as Express middleware**

In `src/app.ts`, add after body parsers and before routes:

```typescript
import pinoHttp from "pino-http"
import { logger } from "./modules/ecom/shared/logger"

// After cookie-parser, before routes
app.use(requestContext)
app.use(pinoHttp({
  logger,
  customProps: (req) => ({ reqId: (req as any).id }),
  autoLogging: {
    ignore: (req) => req.url === "/api/health",
  },
}))
```

This automatically logs:
- `GET /api/ecom/orders 200 42ms` (method, path, status, duration)
- Includes `reqId` for correlation
- Ignores health check endpoints to reduce noise

### Phase 4 — Integrate Error Middleware

**Step 5. Update `error.middleware.ts`**

Replace the `console.error` call with the request-scoped logger:

```typescript
// Before:
console.error("[ErrorMiddleware]", err)

// After:
const log = req?.log ?? logger  // fallback if req is undefined
log.error({ err, reqId: req?.id }, "Unhandled error")
```

This gives us structured error logs with stack traces, request IDs, and all the context pino serializes from `Error` objects (name, message, stack, cause).

### Phase 5 — Replace All `console.*` Calls

**Step 6. Migrate each file**

| File | Replace with |
|------|-------------|
| `order.service.ts:240` | `req?.log?.error({ err, orderId }, ...)` or inject logger via dependency |
| `rbac.context.ts:34` | `req.log?.error({ err }, "Authentication error")` |
| `employee.repo.ts:11` | `logger.debug({ email }, "Checking pending list")` |
| `auth.service.ts:17` | `logger.debug({ inPendingList }, "Pending list check")` |

For files that don't have access to `req` (services, repos), the pattern is:
1. Accept an optional `ReqFields` with `log` or `reqId` in the function options
2. Or use the module-level default logger for non-request-specific logs

### Phase 6 — Child Loggers Per Module

**Step 7. Create module-specific loggers for richer context**

```typescript
// src/modules/ecom/order/order.service.ts
const orderLogger = logger.child({ module: "order" })
orderLogger.info({ orderId, userId }, "Order created")
```

Each log line automatically includes `"module":"order"`, making it trivial to filter: "Show me all logs from the order module in the last hour."

---

## 7. Migration Checklist

### Phase 1 — Foundation
- [ ] Install `pino`, `pino-http`, `pino-pretty` (dev)
- [ ] Create `src/modules/ecom/shared/logger.ts` with config
- [ ] Create `src/modules/ecom/shared/request-context.middleware.ts`
- [ ] Wire both into `src/app.ts`

### Phase 2 — Replace existing `console.*` calls
- [ ] `error.middleware.ts` — use `req.log?.error`
- [ ] `order.service.ts` — inject logger, replace `console.error`
- [ ] `rbac.context.ts` — use `req.log?.error`
- [ ] `rbac.seed.ts` — use default logger (non-request context)
- [ ] `employee.repo.ts` — replace leftover `console.log`
- [ ] `auth.service.ts` — replace leftover `console.log`

### Phase 3 — Module child loggers
- [ ] Add child logger to `order` module
- [ ] Add child logger to `auth` module
- [ ] Add child logger to `admin` module
- [ ] Add child logger to `shared` utilities

### Phase 4 — Observability integration (next steps)
- [ ] Configure pino transport for log aggregation (Loki, Datadog, etc.)
- [ ] Add Sentry integration for error tracking (see observability plan)
- [ ] Add log sampling for high-traffic endpoints
- [ ] Document log schemas for the team

---

## 8. What Good Looks Like

Before:
```
[17:30:01] Order confirmed for user 42
[17:30:01] Error: Database connection failed
```

After (each line is a single JSON object, pretty-printed here for readability):
```json
{
  "level": 30,
  "time": "2026-05-17T17:30:01.000Z",
  "pid": 1234,
  "hostname": "api-1",
  "reqId": "a1b2c3d4",
  "module": "order",
  "msg": "Order confirmed",
  "orderId": "ord_456",
  "userId": "usr_42",
  "durationMs": 42
}
```

```json
{
  "level": 50,
  "time": "2026-05-17T17:30:02.000Z",
  "pid": 1234,
  "hostname": "api-1",
  "reqId": "a1b2c3d4",
  "module": "order",
  "msg": "Failed to confirm order",
  "orderId": "ord_456",
  "err": {
    "type": "DatabaseError",
    "message": "Connection refused",
    "stack": "...",
    "cause": "..."
  }
}
```

Now you can:
- **Filter:** `grep '"reqId":"a1b2c3d4"'` to see everything for one request
- **Count errors:** `jq 'select(.level == 50) | .module' | sort | uniq -c`
- **Alert:** "If `level == 50` count > 10 in 5 minutes, page the team"
- **Trace:** Follow `reqId` across services (when distributed tracing is added)

---

## 9. Additional Resources

- [Pino documentation](https://getpino.io/)
- [pino-http documentation](https://github.com/pinojs/pino-http)
- [The Twelve-Factor App — Logs](https://12factor.net/logs) — treat logs as event streams
- [Node.js Best Practices — Error Logging](https://github.com/goldbergyoni/nodebestpractices?tab=readme-ov-file#-23-avoid-using-consolelog-in-production-use-a-structured-logging-library)

---

*Next: See `observability.md` for Sentry integration, metrics, and alerting.*
