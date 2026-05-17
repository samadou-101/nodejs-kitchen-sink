# Observability Plan — Error Tracking, Metrics, Health Checks & Alerting

> Written for someone new to observability in Node.js. Covers the three pillars
> (logs, metrics, traces), Sentry integration for error tracking, health checks,
> and how to know your production system is healthy. Assumes you've read
> `logging.md` — this doc builds on that foundation.

---

## 1. What is Observability?

Observability (often shortened to "o11y") is the ability to understand what's happening inside a system by asking questions from the outside — without deploying new code, attaching a debugger, or SSH-ing into a server.

It rests on three pillars:

| Pillar | What it tells you | Tool in this stack |
|--------|-------------------|-------------------|
| **Logs** | "This specific thing happened at this time" | Pino (see `logging.md`) |
| **Metrics** | "Over time, how many requests? How fast? How many errors?" | Sentry + (optionally) Prometheus |
| **Traces** | "What happened from when the request entered until it responded?" | Sentry performance tracking |

You can debug most production issues with logs alone — but you *notice* them faster with metrics, and you *diagnose* them faster with traces + good logs.

---

## 2. Error Tracking — Why `console.error` + a log file isn't enough

The codebase currently logs errors to stdout via `console.error` and the error middleware. Here's what breaks in production:

| Scenario | What happens now | What should happen |
|----------|-----------------|-------------------|
| **A 500 error happens at 3 AM** | It scrolls past in a terminal that nobody is watching | Sentry captures it, groups it, and pages the on-call engineer |
| **The same error happens 1000 times** | 1000 lines scroll past — still no notification | Sentry groups by fingerprint, shows "occurred 1000 times" in a single issue |
| **An error doesn't crash the process** | Logged and forgotten — you find it when a user complains | Sentry captures it with full context (user, request, previous actions) |
| **You want to know "has this error happened before?"** | You grep through log files hoping you have the right date range | Sentry's issue list shows first seen, last seen, count, affected users |
| **An intermittent error with no clear reproduction** | You add more logging, deploy, wait, repeat | Sentry captures breadcrumbs (database queries, API calls) leading up to the error |

### Errors vs exceptions vs logs

| What | Example | Where it goes |
|------|---------|--------------|
| **Uncaught exception** | `ReferenceError: x is not defined` | Process crash + Sentry capture |
| **Unhandled rejection** | A `Promise` that rejected with no `.catch()` | Process warning + Sentry capture |
| **Caught error** | `catch (err)` where you handle it gracefully | Logger at `warn`/`error` level + Sentry capture (if unexpected) |
| **Expected failure** | Validation error, 404 | Logger at `info`/`warn` level — NOT Sentry (not a bug) |
| **Audit event** | "Admin deleted order 123" | Logger at `info` level, sent to a dedicated audit stream |

**Rule of thumb for when to send to Sentry:** If it's a bug in the code or an unexpected external failure that an engineer needs to investigate, send it to Sentry. If it's a user making a bad request or a routine business event, just log it.

---

## 3. Sentry — How It Works

Sentry is an error tracking and performance monitoring platform. There are two parts:

1. **The SDK** (`@sentry/node`) — runs inside your application, captures errors and performance data, sends them to…
2. **The Sentry server** — either hosted (sentry.io) or self-hosted — aggregates, groups, alerts, and provides a UI to investigate.

### What Sentry captures automatically

Once initialized, Sentry hooks into Node.js globals to capture:

| Event | How Sentry captures it |
|-------|----------------------|
| `uncaughtException` | Global handler registered in the SDK |
| `unhandledRejection` | Global handler registered in the SDK |
| Express request errors | Through the `expressMiddleware()` integration (or `@sentry/tracing` HTTP integration) |
| Console calls (`console.error`) | Optional — Sentry can intercept console methods |
| Request context | URL, method, headers (configurable), body (configurable, off by default for privacy) |

### What Sentry captures when you call it manually

```typescript
// Manually capture an error
Sentry.captureException(err)

// Add context for the current scope
Sentry.setUser({ id: userId, email })
Sentry.setTag("orderId", orderId)
Sentry.addBreadcrumb({ category: "db", message: "Queried orders table", level: "info" })

// Check if an error should be sent (e.g. don't send 400s)
Sentry.captureException(err, {
  mechanism: { handled: true },
})
```

### How Sentry groups errors

Sentry groups individual occurrences into **issues** using a fingerprint. By default it uses the error type, message, and stack trace. Same fingerprint = same issue. This means:

- `Error: Connection refused` from 1000 requests → 1 issue with count 1000
- `Error: Connection refused` with a different stack trace (different code path) → 2 issues

You can override the fingerprint if the default doesn't work well:

```typescript
Sentry.setFingerprint(["{{ default }}", orderId])
```

### Performance tracing

Sentry can trace the lifecycle of a request — from the moment it enters Express until the response is sent. It breaks the request into **transactions** and **spans**:

```
Transaction: GET /api/ecom/orders
├── Span: express.middleware (cookie-parser)
├── Span: express.middleware (auth)
├── Span: db.query (Prisma — findOrders)
├── Span: db.query (Prisma — countOrders)
└── Span: express.response (200)
```

This tells you exactly where time is spent in each request. You don't need this on day one — but when you start optimizing slow endpoints, it's invaluable.

---

## 4. Sentry Setup for This Codebase

### A. Install the packages

```bash
pnpm add @sentry/node
```

No other Sentry packages needed for basic error tracking. If you want performance monitoring, add:

```bash
pnpm add @sentry/profiling-node
```

### B. Configure the SDK

File: `src/modules/ecom/shared/sentry.ts`

```typescript
import * as Sentry from "@sentry/node"
import type { Request } from "express"

export function initSentry() {
  const dsn = process.env.SENTRY_DSN
  if (!dsn) {
    console.warn("[Sentry] SENTRY_DSN not set — skipping initialization")
    return
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    release: process.env.GIT_SHA ?? "unknown",
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
    // 0.1 = sample 10% of transactions in production
    // 1.0 = sample 100% in development
    integrations: [
      // Auto-integrates with Express, Node.js http, console, etc.
    ],
    // Don't send request bodies by default (passwords, tokens)
    beforeSend(event, hint) {
      const req: Request | undefined = hint?.originalException as any
      if (req?.body) {
        // Only include non-sensitive fields
        const safe = { ...req.body }
        delete safe.password
        delete safe.token
        delete safe.secret
        event.request = { ...event.request, data: JSON.stringify(safe) }
      }
      return event
    },
  })
}
```

**Key config decisions:**

| Option | Value | Why |
|--------|-------|-----|
| `tracesSampleRate` | `0.1` (10%) in production | Performance data at 100% is expensive — 10% gives enough signal |
| `environment` | `NODE_ENV` | Separate staging errors from production errors |
| `release` | `GIT_SHA` env var | Know exactly which commit deployed each error |
| `beforeSend` | Strip sensitive fields | Never send passwords or tokens to Sentry |

### C. Initialize in `server.ts` — before everything

```typescript
// src/server.ts
import { initSentry } from "./modules/ecom/shared/sentry"
initSentry()

// Must be after initSentry(), before app import
import { app } from "./app"
import { logger } from "./modules/ecom/shared/logger"

const PORT = process.env.PORT ?? 3000

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server started")
})

// Graceful shutdown
async function shutdown(signal: string) {
  logger.info({ signal }, "Shutting down gracefully")
  server.close(() => {
    logger.info("Server closed")
    process.exit(0)
  })
  // Force exit after 10s
  setTimeout(() => {
    logger.error("Forced shutdown after timeout")
    process.exit(1)
  }, 10_000).unref()
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))
```

**Why before the app import:** Sentry's Express integration patches `http.createServer` and Express middleware at import time. If you init after importing `app`, the patches won't apply.

### D. Add the Express request handler middleware

In `src/app.ts`, immediately after `cookie-parser`:

```typescript
import * as Sentry from "@sentry/node"

app.use(cookieParser())
app.use(express.json())
app.use(Sentry.Handlers.requestHandler())        // <-- adds request context
app.use(Sentry.Handlers.tracingHandler())         // <-- adds performance tracing
```

### E. Add the Sentry error handler — before your existing error middleware

The Sentry error handler must be registered *before* your custom one:

```typescript
// The Sentry handler sends the error to Sentry, then passes it down
app.use(Sentry.Handlers.errorHandler())

// Your existing error middleware
app.use(errorMiddleware)
```

### F. Wire correlation IDs to Sentry

In the `requestContext` middleware (from `logging.md`), add Sentry scope tags:

```typescript
import * as Sentry from "@sentry/node"

export function requestContext(req: Request, _res: Response, next: NextFunction) {
  req.id = (req.headers["x-request-id"] as string) ?? randomUUID()
  req.log = logger.child({ reqId: req.id })

  // Link the request to Sentry
  Sentry.setTag("reqId", req.id)

  next()
}
```

Now you can go from a Sentry alert → see `reqId` in the event → search your logs for that `reqId` → see every log line leading up to the error.

### G. Set user context on authenticated requests

In the auth middleware (`authenticate` or equivalent), after resolving the user:

```typescript
Sentry.setUser({ id: user.id, role: user.role })
```

Now every error from this request includes "this happened to user 42, who is an admin."

### H. Track releases

Build and deploy with the git SHA:

```bash
# In your deploy script
export GIT_SHA=$(git rev-parse HEAD)
pnpm start
```

Sentry will show you which commits were included in each release and whether a particular error was first seen after a deploy.

---

## 5. Health Check Endpoints

A health check endpoint is a lightweight route that tells an orchestrator (Docker, Kubernetes, Render, Railway) whether the process is alive and ready.

### Liveness vs Readiness

| Endpoint | What it checks | If it fails… |
|----------|---------------|-------------|
| `GET /api/health` | Is the process up and responding? (no DB check) | Orchestrator restarts the container |
| `GET /api/ready` | Can the process handle requests? (DB + Redis are reachable) | Orchestrator removes the container from the load balancer |

### Implementation

File: `src/modules/ecom/shared/health.controller.ts`

```typescript
import { Router } from "express"
import { prisma } from "@db"
import { redis } from "@config"
import { logger } from "./logger"

const router = Router()

// Liveness — no dependencies checked, just "process is alive"
router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() })
})

// Readiness — verifies DB and Redis connectivity
router.get("/ready", async (_req, res) => {
  const checks: Record<string, string> = {}

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = "ok"
  }
  catch {
    checks.database = "error"
  }

  try {
    await redis.ping()
    checks.redis = "ok"
  }
  catch {
    checks.redis = "error"
  }

  const allOk = Object.values(checks).every((s) => s === "ok")

  res.status(allOk ? 200 : 503).json({
    status: allOk ? "ok" : "degraded",
    checks,
  })
})

export default router
```

Register in `app.ts` at the top (before auth middleware, so health checks don't require authentication):

```typescript
import healthRouter from "./modules/ecom/shared/health.controller"
app.use("/api", healthRouter)
```

### Why register before auth

Health checks are called by the orchestrator every few seconds. If they hit the auth middleware, they'll fail (no token) and the orchestrator will think your app is broken. Health check routes should always be public.

---

## 6. Metrics — What to Track

Sentry Performance Monitoring provides most of the metrics you need out of the box. Here's what to watch:

| Metric | How to get it | Why it matters |
|--------|--------------|----------------|
| **Request rate** (req/s) | Sentry dashboard — transactions/min | Traffic volume — sudden drop means routing issue, sudden spike means abuse |
| **Error rate** (%) | Sentry dashboard — errors / transactions | >5% means something is broken |
| **Latency p50** | Sentry — transaction durations | 50% of requests are faster than this — baseline |
| **Latency p95** | Sentry — transaction durations | 95% of requests are faster than this — the slow-user experience |
| **Latency p99** | Sentry — transaction durations | The worst 1% — flaky network, cold starts, slow queries |
| **Apdex** | Sentry — built-in | "Application Performance Index" — fraction of requests satisfying a threshold (commonly 500ms) |
| **Crash-free rate** | Sentry — built-in | % of sessions that didn't experience a crash |

### Custom metrics (when Sentry isn't enough)

If you need more granular metrics than Sentry provides (e.g., per-endpoint, per-user-segment), you'd add Prometheus + Grafana. For this codebase's scale, Sentry's built-in metrics are sufficient to start.

### What not to track

Don't obsess over p50. Users don't notice a 10ms difference. Focus on p95 and p99 — those are the requests users actually feel.

---

## 7. Alerting Strategy

### What warrants an alert

| Condition | Severity | Channel |
|-----------|----------|---------|
| Error rate > 5% over 5 minutes | Critical | Slack + SMS/PagerDuty |
| Any `uncaughtException` or `unhandledRejection` | Critical | Slack + SMS/PagerDuty |
| p99 latency > 2s over 5 minutes | Warning | Slack |
| Single error affecting > 100 users in 1 hour | Warning | Slack |
| Health check failing for > 30 seconds | Critical | Slack + SMS/PagerDuty |

### What does NOT warrant an alert

```
❌ A single 500 error from one user
❌ 404s from a scraper
❌ Validation errors (400)
❌ Rate limit hits (429)
```

These are noise. Alert fatigue is dangerous — when every alert is "cry wolf," real incidents get ignored.

### Setting up Sentry alerts

Sentry has built-in alert rules:

1. **Issue alert** — fires when a specific issue meets conditions (e.g., "happens more than 10 times in 1 hour")
2. **Metric alert** — fires when a metric crosses a threshold (e.g., "error rate > 5%")
3. **Crash rate alert** — fires when crash-free rate drops below a threshold

Alerts can notify via:
- Email
- Slack (recommended for this codebase)
- PagerDuty / OpsGenie (for on-call rotation)
- Webhook (custom)

Start with Slack notifications for everything, then graduate critical alerts to PagerDuty when there's an on-call rotation.

---

## 8. Audit Logging

Audit logging is separate from error tracking. It records *who did what* for compliance and investigation purposes. Sentry is not the right tool for this — Sentry tracks errors, not business events.

### What to audit

| Event | Data to record |
|-------|---------------|
| Admin changes employee role | `{ action: "role.update", userId, targetId, from, to }` |
| Admin confirms payroll | `{ action: "payroll.confirm", userId, period }` |
| Order deleted | `{ action: "order.delete", userId, orderId }` |
| Employee login | `{ action: "auth.login", userId }` |

### Implementation

Use a dedicated child logger with a `stream` that writes to a separate file or stderr:

```typescript
import { logger } from "../shared/logger"

const audit = logger.child({ module: "audit" })

export function logAudit(event: {
  action: string
  userId: string
  targetId?: string
  metadata?: Record<string, unknown>
}) {
  audit.info(event, `[AUDIT] ${event.action}`)
}
```

Usage in a controller:

```typescript
import { logAudit } from "../shared/audit"

async function deleteOrder(req: Request, res: Response) {
  await orderService.delete(req.params.id)
  logAudit({
    action: "order.delete",
    userId: req.user.id,
    targetId: req.params.id,
  })
  sendSuccess(res, { message: "Order deleted" })
}
```

### Storage

Audit logs are typically stored longer than regular logs. Options:

| Storage | Pros | Cons |
|---------|------|------|
| **Same stdout** | Simple — no new infrastructure | Hard to separate from regular logs |
| **Separate file** | Easy to grep, long retention | Requires log rotation |
| **Database table** | Queryable, relational | Adds write load to DB |
| **External service** | Splunk, Datadog, Logtail | Cost |

**Recommendation for this codebase:** Start with a dedicated child logger piping to stdout. Structure audit logs with a consistent `"type":"audit"` field so they're trivially filterable. If compliance requires long-term storage, add a file transport or DB table later.

---

## 9. Graceful Shutdown

The current `server.ts` has a SIGTERM handler but it's incomplete:

```typescript
// Current (incomplete)
process.on("SIGTERM", () => server.close())
```

A production-grade shutdown should:

1. **Stop accepting new requests** — `server.close()` does this
2. **Drain in-flight requests** — wait for active connections to finish (with a timeout)
3. **Disconnect Prisma** — close the database connection pool
4. **Disconnect Redis** — close the Redis connection
5. **Flush Sentry** — send any queued events before the process exits
6. **Flush pino** — write any buffered log lines

Updated handler (from `logging.md` context):

```typescript
async function shutdown(signal: string) {
  logger.info({ signal }, "Shutting down gracefully")

  // Stop accepting new requests
  server.close(() => {
    logger.info("HTTP server closed")
  })

  // Drain connections
  await Promise.allSettled([
    prisma.$disconnect().catch(() => {}),
    redis.quit().catch(() => {}),
    Sentry.close(2_000),   // 2s timeout to flush
  ])

  logger.info("All connections drained — exiting")
  process.exit(0)
}

// Forceful shutdown if graceful drain takes too long
const forceExit = setTimeout(() => {
  logger.error("Graceful shutdown timed out — force exiting")
  process.exit(1)
}, 30_000).unref()

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))
process.on("uncaughtException", (err) => {
  Sentry.captureException(err)
  logger.fatal({ err }, "Uncaught exception — shutting down")
  shutdown("uncaughtException")
})
process.on("unhandledRejection", (reason) => {
  Sentry.captureException(reason)
  logger.error({ err: reason }, "Unhandled rejection")
})
```

---

## 10. Implementation Plan

### Phase 1 — Sentry Foundation

| Step | File | What to do |
|------|------|-----------|
| 1 | `package.json` | `pnpm add @sentry/node` |
| 2 | `.env` | Add `SENTRY_DSN=...` (get DSN from sentry.io project settings) |
| 3 | `src/modules/ecom/shared/sentry.ts` | Create init function with DSN, env, release, beforeSend |
| 4 | `src/server.ts` | Call `initSentry()` before importing `app` |

### Phase 2 — Sentry Middleware Wiring

| Step | File | What to do |
|------|------|-----------|
| 5 | `src/app.ts` | Add `Sentry.Handlers.requestHandler()` and `tracingHandler()` after body parsers |
| 6 | `src/app.ts` | Add `Sentry.Handlers.errorHandler()` before `errorMiddleware` |
| 7 | `src/modules/ecom/shared/request-context.middleware.ts` | Add `Sentry.setTag("reqId", req.id)` |
| 8 | `src/modules/ecom/auth/rbac/rbac.context.ts` | Add `Sentry.setUser()` after authentication |

### Phase 3 — Health Checks

| Step | File | What to do |
|------|------|-----------|
| 9 | `src/modules/ecom/shared/health.controller.ts` | Create `/api/health` and `/api/ready` endpoints |
| 10 | `src/app.ts` | Register `healthRouter` at the top (before auth middleware) |

### Phase 4 — Graceful Shutdown

| Step | File | What to do |
|------|------|-----------|
| 11 | `src/server.ts` | Add SIGINT handler |
| 12 | `src/server.ts` | Add Prisma disconnect on shutdown |
| 13 | `src/server.ts` | Add Redis quit on shutdown |
| 14 | `src/server.ts` | Add `Sentry.close()` on shutdown |
| 15 | `src/server.ts` | Add `uncaughtException` and `unhandledRejection` handlers |

### Phase 5 — Audit Logging

| Step | File | What to do |
|------|------|-----------|
| 16 | `src/modules/ecom/shared/audit.ts` | Create `logAudit()` helper |
| 17 | Key controllers | Call `logAudit()` on sensitive operations |

---

## 11. Migration Checklist

### Phase 1 — Sentry (Foundation)
- [ ] Install `@sentry/node`
- [ ] Add `SENTRY_DSN` to `.env`
- [ ] Create `src/modules/ecom/shared/sentry.ts`
- [ ] Wire `initSentry()` in `server.ts`

### Phase 2 — Sentry (Middleware)
- [ ] Add `requestHandler()` and `tracingHandler()` in `app.ts`
- [ ] Add `errorHandler()` before `errorMiddleware`
- [ ] Wire `Sentry.setTag("reqId", ...)` in request context middleware
- [ ] Wire `Sentry.setUser()` in auth middleware

### Phase 3 — Health Checks
- [ ] Create `src/modules/ecom/shared/health.controller.ts`
- [ ] Register `/api/health` and `/api/ready` in `app.ts`

### Phase 4 — Shutdown
- [ ] Add SIGINT handler
- [ ] Add Prisma disconnect
- [ ] Add Redis disconnect
- [ ] Add `Sentry.close()`
- [ ] Add `uncaughtException` / `unhandledRejection` handlers

### Phase 5 — Audit & Polish
- [ ] Create audit logging helper
- [ ] Add release tracking in deploy script (`GIT_SHA` env var)
- [ ] Configure Sentry alert rules in Sentry dashboard
- [ ] Set `SENTRY_TRACES_SAMPLE_RATE` appropriately per environment
- [ ] Document runbook: "How to investigate a Sentry issue"

---

## 12. Operational Runbook (How to Investigate an Error)

When you get a Sentry alert, follow these steps:

### Step 1: Open the Sentry issue

The alert has a direct link to the Sentry issue. It shows:
- **First seen / last seen** — Is this new or ongoing?
- **Count** — How many users affected? How many events?
- **Environments** — Is it only in staging?

### Step 2: Read the stack trace

Look at the top frame first — that's where the error was thrown. The frames below it are the call chain. Look for:
- Which function threw the error
- What line of code
- What arguments were passed (Sentry captures function args when available)

### Step 3: Check the tags and context

- `reqId` — copy this value
- `user.id` — who was affected?
- `environment` — production or staging?

### Step 4: Search logs for the `reqId`

```bash
# If using file-based logs
grep '"reqId":"<id>"' /var/log/app/production.log

# If using a cloud log aggregator
# Filter: reqId:<id>
```

This shows every log line for that request, including breadcrumbs leading to the error.

### Step 5: Check recent deploys

Sentry shows which release the error first appeared in. Compare that to your deploy timeline. If the error started after deploy 42, the bug is likely in that deploy.

### Step 6: Reproduce or fix

- If the error is clear (e.g., "Cannot read property of null"), read the code path and fix the null check.
- If the error is intermittent, add more logging, deploy, and wait for the next occurrence.

---

## 13. What Good Looks Like

### Sentry event (investigation view)

```
Issue: TypeError: Cannot read properties of null (reading 'price')
Level: Error
Count: 47 occurrences in the last hour
Affected users: 12

Tags:
  environment: production
  release:    a1b2c3d4e5f6
  reqId:      abc-123-def-456
  module:     order

User:
  id:    user_42
  role:  customer

Breadcrumbs:
  [info]  17:30:00 — express.middleware (auth) — 1.2ms
  [info]  17:30:00 — db.query (Prisma — findOrder) — 42ms
  [info]  17:30:00 — express.middleware (order.show) — 0.1ms
  [error] 17:30:00 — TypeError: Cannot read properties of null (reading 'price')
```

From this single event you know:
- What broke (reading `price` on null)
- Which user (user_42)
- Which request (reqId abc-123-def-456)
- Which module (order)
- What happened before (auth middleware, then a DB query, then the handler)

### Health check responses

```json
// GET /api/health
{ "status": "ok", "uptime": 3600.42 }

// GET /api/ready — everything healthy
{
  "status": "ok",
  "checks": {
    "database": "ok",
    "redis": "ok"
  }
}

// GET /api/ready — database is down
{
  "status": "degraded",
  "checks": {
    "database": "error",
    "redis": "ok"
  }
}
```

---

## 14. Additional Resources

- [Sentry Node.js documentation](https://docs.sentry.io/platforms/javascript/guides/node/)
- [Sentry Express integration](https://docs.sentry.io/platforms/javascript/guides/node/express/)
- [Sentry performance monitoring](https://docs.sentry.io/product/performance/)
- [Sentry alerting](https://docs.sentry.io/product/alerts/)
- [The Three Pillars of Observability (SRE book)](https://www.oreilly.com/library/view/observability-engineering/9781492076438/)
- [Google SRE Book — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)

---

*See `logging.md` for the structured logging setup that pairs with this plan.*
