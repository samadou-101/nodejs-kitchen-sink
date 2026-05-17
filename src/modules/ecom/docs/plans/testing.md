# Testing Plan — From Zero to a Tested Ecom Module

> Written for someone new to testing in Node.js/TypeScript. Covers the why,
> the types of tests, framework choices, mocking strategies, and a concrete
> plan to add tests to the `modules/ecom` directory — which currently has
> zero test coverage across ~50 source files.

---

## 1. Why Test? (When You Have Zero Tests and It "Works")

Without tests, every change is a leap of faith. Here's what tests buy you:

| Problem | Without tests | With tests |
|---------|--------------|------------|
| **Refactoring** | "I'm scared to touch this function — I might break something" | You change the code, run tests, see instantly if something broke |
| **Regressions** | A bugfix in `order.service.ts` silently breaks `customer.service.ts` | Tests catch the regression before you deploy |
| **Documentation** | New dev reads the function and guesses what it should do | Tests show exactly what inputs produce what outputs |
| **Onboarding** | "Set up the whole project and hit the API with curl to test" | `pnpm test` tells you everything works |
| **Deploy confidence** | You manual-test a few flows and pray | CI runs 200 tests in 30 seconds — red or green |

### The goal

Not 100% coverage. The goal is **confidence** — enough tests that you can make changes without fear. For this module, that means:

- **Validators and policies** → fully tested (cheap, high ROI)
- **Service logic** → tested with mocked dependencies (catches business logic bugs)
- **Error handling** → tested (consistent response format)
- **Critical flows** → integration tested against a real database (order lifecycle, auth)

---

## 2. The Testing Pyramid (Applied to This Codebase)

```
       ┌──────────┐
       │   API    │  Few — supertest + real DB
       │  (E2E)   │  Critical flows: auth, order lifecycle
      ├──────────┤
      │ Integ.   │  Some — real DB, real Redis
      │          │  Service-level flows
     ├──────────┤
     │  Unit    │  Many — fast, isolated, no IO
     │          │  Validators, policies, errors, helpers
    └──────────┘
```

| Layer | Speed | Dependencies | Count target | Covers |
|-------|-------|-------------|--------------|--------|
| **Unit** | ~1ms per test | None (pure functions) | 100+ | Schemas, policies, errors, response helpers |
| **Service (mocked)** | ~5ms per test | Mocked prisma, mocked redis | 50+ | Business logic in order/auth/employee/customer services |
| **Integration** | ~1-5s per test | Real Postgres (Testcontainers) | 10-20 | Full flows: register → login → order lifecycle |
| **API/E2E** | ~10-100ms per test | Full app + real DB | 15-25 | HTTP layer, auth middleware, error responses |

---

## 3. Framework Choices

| Decision | Choice | Why |
|----------|--------|-----|
| **Test runner** | Vitest | Same API as Jest, ESM-native, TS support built-in, faster watch mode |
| **HTTP testing** | Supertest | Express-compatible API, no real port needed (`app.listen`), widely used |
| **Mocking** | `vi.mock` | Built into Vitest, hoisted to top, no extra dependency |
| **DB integration** | Testcontainers | Real Postgres in Docker — production-faithful, no adapter differences |
| **Assertions** | Vitest built-in `expect` | Matchers for everything needed, no chai/sinon required |
| **Coverage** | `@vitest/coverage/v8` | Built-in, uses V8's native coverage — fast, no Istanbul config |

### Why Vitest over Jest

- **ESM-native** — this project uses `"type": "module"` and ESM imports everywhere. Jest requires heavy configuration to work with ESM. Vitest handles it out of the box.
- **TS support** — no `babel-jest` or `ts-jest` needed. Vitest transpiles TypeScript directly.
- **Path aliases** — Vitest automatically resolves `@/` and `@db` etc. if pointed at `tsconfig.json`.
- **Faster watch mode** — Vitest's watch is incremental and near-instant.

### Why Supertest over `node:http`

- Supertest lets you pass an Express `app` directly — no need to listen on a port.
- Chainable API: `request(app).get("/api/ecom/orders").expect(200)`.
- Integrates with Vitest seamlessly (`await request(app).get(...)`).

### Dependencies to install

```bash
# Test runner + HTTP testing
pnpm add -D vitest @vitest/coverage-v8 supertest @types/supertest

# Integration testing with real Postgres
pnpm add -D testcontainers @testcontainers/postgresql
```

---

## 4. Test Types — What to Test at Each Layer

### A. Unit Tests — Fast, isolated, no DB/network

These are the highest ROI because they're easy to write, instantly fast, and catch real bugs.

#### What to unit test

| Module | What to test | Example test |
|--------|-------------|--------------|
| `validation/schemas/*.schema.ts` | Every schema: valid input passes, invalid input fails with correct error messages | `orderSchema.parse({...})` succeeds, `orderSchema.parse({})` throws ZodError |
| `auth/policies/resources/*.policy.ts` | Each policy action with every role (admin, employee, customer, unauthenticated) | `OrderPolicies.create().evaluate(adminContext)` → `true`, `OrderPolicies.create().evaluate(customerContext)` → `false` |
| `auth/policies/rules.ts` | Combinators: `and`, `or`, `not`, `isRole` | `isRole("admin")(adminContext)` → `true` |
| `auth/policies/ownership.ts` | Ownership checks: `isOwner`, `isOrderOwner` | `isOwner(userId)({ auth: { userId } })` → `true` |
| `shared/response.ts` | `sendSuccess`, `sendError`, `sendPaginated` produce correct JSON shape | `sendSuccess(res, { orderId: 1 })` writes `{ success: true, data: { orderId: 1 } }` |
| `shared/errors.ts` | `AppError` and subclasses: name, message, statusCode, serialization | `new NotFoundError("Order").statusCode` → `404` |
| `shared/response.types.ts` | Type guards if any | Runtime validation if applicable |

#### Example unit test — Zod schema

```typescript
import { describe, it, expect } from "vitest"
import { orderSchema } from "../schemas/order.schema"

describe("orderSchema", () => {
  it("accepts a valid order", () => {
    const result = orderSchema.parse({
      items: [{ productId: 1, quantity: 2 }],
      notes: "Leave at door",
    })
    expect(result.items).toHaveLength(1)
    expect(result.items[0].quantity).toBe(2)
  })

  it("rejects an order with no items", () => {
    expect(() => orderSchema.parse({})).toThrow()
  })

  it("rejects an order with zero quantity", () => {
    expect(() =>
      orderSchema.parse({
        items: [{ productId: 1, quantity: 0 }],
      }),
    ).toThrow(/quantity/)
  })

  it("rejects negative quantity", () => {
    expect(() =>
      orderSchema.parse({
        items: [{ productId: 1, quantity: -1 }],
      }),
    ).toThrow()
  })
})
```

#### Example unit test — policy

```typescript
import { describe, it, expect } from "vitest"
import { OrderPolicies } from "../auth/policies/resources/order.policy"
import type { AuthContext } from "../auth/rbac/rbac.types"

function adminContext(): AuthContext {
  return { userId: 1, role: "admin", permissions: ["order:*"] }
}

function employeeContext(): AuthContext {
  return { userId: 2, role: "employee", permissions: ["order:view"] }
}

function customerContext(): AuthContext {
  return { userId: 3, role: "customer", permissions: [] }
}

describe("OrderPolicies", () => {
  describe("create", () => {
    it("allows admin to create any order", () => {
      expect(OrderPolicies.create().evaluate(adminContext())).toBe(true)
    })

    it("allows employee to create orders", () => {
      expect(OrderPolicies.create().evaluate(employeeContext())).toBe(true)
    })

    it("denies customer from creating orders through admin API", () => {
      expect(OrderPolicies.create().evaluate(customerContext())).toBe(false)
    })
  })

  describe("view", () => {
    it("allows admin to view any order", () => {
      expect(OrderPolicies.view().evaluate(adminContext())).toBe(true)
    })

    it("allows employee to view assigned orders", () => {
      expect(OrderPolicies.viewAssigned().evaluate(employeeContext())).toBe(true)
    })
  })
})
```

### B. Service Tests — Logic with mocked dependencies

Services import `prisma` and `redis` as singletons. We mock those modules to test business logic in isolation.

#### What to mock

| Import | Mock strategy |
|--------|--------------|
| `@/config/db.config` | `vi.mock("@/config/db.config", () => ({ prisma: mockPrisma }))` |
| `@/config/redis.config` | `vi.mock("@/config/redis.config", () => ({ redisClient: mockRedis }))` |
| `@/api/auth/auth.utils` | `vi.mock("@/api/auth/auth.utils", () => ({ hashPassword: vi.fn(), verifyPassword: vi.fn() }))` |

#### Which services to test

| Service | Key functions to test | Business logic to verify |
|---------|----------------------|------------------------|
| `order/order.service.ts` | `placeOrder`, `getOrderById`, `updateOrder`, `cancelOrder` | Stock deduction, status transitions, authorization |
| `customer/customer.service.ts` | `checkout`, `browseProducts`, `trackOrders` | Cart validation, order creation from customer context |
| `admin/services/auth.service.ts` | `registerAdmin`, `loginAdmin` | Pending list check, password hashing, duplicate email |
| `employee/services/auth.service.ts` | `registerEmployee`, `loginEmployee` | Admin approval check, role assignment |
| `admin/services/employee.service.ts` | `assignOrders`, `confirmPayroll`, `updateContract` | Payroll calculation, contract validation (large file — high ROI) |
| `auth/rbac/rbac.service.ts` | `resolveAuthContext`, `cacheAuth` | Redis caching logic, permission merging |

#### Example service test — mocked prisma

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"
import { placeOrder } from "./order.service"

const mockPrisma = {
  product: { findMany: vi.fn(), update: vi.fn() },
  order: { create: vi.fn() },
  orderItem: { createMany: vi.fn() },
  $transaction: vi.fn(),
}

vi.mock("@/config/db.config", () => ({ prisma: mockPrisma }))

describe("order.service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.$transaction.mockImplementation(
      (fn: (tx: any) => Promise<any>) => fn(mockPrisma),
    )
  })

  it("rejects if stock is insufficient", async () => {
    mockPrisma.product.findMany.mockResolvedValue([
      { id: 1, stock: 1, price: 100 },
    ])

    const orderData = {
      items: [{ productId: 1, quantity: 5 }],
    }
    const auth = { userId: 1, role: "admin" }

    await expect(placeOrder(orderData, auth)).rejects.toThrow(/stock/)
    expect(mockPrisma.order.create).not.toHaveBeenCalled()
  })

  it("deducts stock and creates order on success", async () => {
    mockPrisma.product.findMany.mockResolvedValue([
      { id: 1, stock: 10, price: 100 },
    ])
    mockPrisma.order.create.mockResolvedValue({ id: 1 })
    mockPrisma.orderItem.createMany.mockResolvedValue({ count: 1 })

    const orderData = {
      items: [{ productId: 1, quantity: 2 }],
    }
    const auth = { userId: 1, role: "admin" }

    const result = await placeOrder(orderData, auth)
    expect(result.id).toBe(1)
    expect(mockPrisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: { stock: { decrement: 2 } },
      }),
    )
  })
})
```

### C. Integration Tests — Real DB, Real Redis

Integration tests catch what unit tests miss: transaction behavior, database constraints, and the interaction between services.

#### What to test with integration tests

| Flow | Steps |
|------|-------|
| **Auth lifecycle** | Register admin → login → get JWT → use JWT to call protected route |
| **Order lifecycle** | Create product → create order → confirm order → update status → cancel |
| **Employee management** | Register admin → register employee → assign orders → confirm payroll |
| **RBAC enforcement** | Login as customer → try to access admin endpoint → get 403 |

#### Integration test setup with Testcontainers

```typescript
import { describe, beforeAll, afterAll, it, expect } from "vitest"
import { PostgreSqlContainer } from "@testcontainers/postgresql"
import { PrismaClient } from "@/generated/prisma/client"

let container: PostgreSqlContainer
let prisma: PrismaClient

beforeAll(async () => {
  container = await new PostgreSqlContainer().start()
  prisma = new PrismaClient({
    datasources: { db: { url: container.getConnectionUri() } },
  })
  await prisma.$executeRawUnsafe(`CREATE SCHEMA public`)
  await prisma.$executeRawUnsafe(/* your migration SQL or run prisma migrate */)
})

afterAll(async () => {
  await prisma.$disconnect()
  await container.stop()
})
```

**Important:** Testcontainers requires Docker to be running on the machine. For CI, Docker is typically available on GitHub Actions runners. For local development, developers need Docker Desktop or Docker Engine.

#### Rollback strategy

For test isolation, wrap each test in a Prisma transaction that rolls back at the end:

```typescript
it("creates an order end-to-end", async () => {
  await prisma.$transaction(
    async (tx) => {
      // Arrange: seed product
      const product = await tx.product.create({
        data: { name: "Test", price: 100, stock: 10 },
      })

      // Act: place order (using real service with tx-bound client)
      const order = await placeOrderWithTx(
        { items: [{ productId: product.id, quantity: 2 }] },
        adminAuth,
        tx,
      )

      // Assert
      expect(order.id).toBeDefined()
      const updated = await tx.product.findUnique({
        where: { id: product.id },
      })
      expect(updated!.stock).toBe(8)

      // Throw to roll back — test data never persists
      throw new Error("ROLLBACK")
    },
    { timeout: 10_000 },
  )
}).catch(() => {}) // Swallow the rollback error
```

### D. API Tests — HTTP Layer via Supertest

API tests exercise the full Express stack: middleware (cookie-parser, auth), routing, controllers, and response formatting.

#### What to test

| Endpoint | Scenarios |
|----------|-----------|
| `POST /api/ecom/admin/signup` | Valid body → 201, missing fields → 400, duplicate → 409 |
| `POST /api/ecom/admin/login` | Correct credentials → 200 + JWT, wrong password → 401, missing body → 400 |
| `GET /api/ecom/orders` | Authenticated → 200 + paginated orders, no token → 401, wrong role → 403 |
| `POST /api/ecom/order` | Valid order → 201, insufficient stock → 400, no items → 400 |
| `*` | Unknown route → 404, internal error → 500 with standardized envelope |

#### Example API test

```typescript
import { describe, it, expect, beforeAll } from "vitest"
import request from "supertest"
import { app } from "@/app"

let adminToken: string

describe("POST /api/ecom/admin/login", () => {
  it("returns 200 with JWT for valid credentials", async () => {
    const res = await request(app)
      .post("/api/ecom/admin/login")
      .send({ email: "admin@test.com", password: "password123" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBeDefined()
    adminToken = res.body.data.token
  })

  it("returns 401 for wrong password", async () => {
    const res = await request(app)
      .post("/api/ecom/admin/login")
      .send({ email: "admin@test.com", password: "wrong" })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it("returns 400 for missing fields", async () => {
    const res = await request(app)
      .post("/api/ecom/admin/login")
      .send({})

    expect(res.status).toBe(400)
  })
})

describe("GET /api/ecom/orders", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/ecom/orders")
    expect(res.status).toBe(401)
  })

  it("returns 200 with paginated data when authenticated", async () => {
    const res = await request(app)
      .get("/api/ecom/orders")
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.meta).toHaveProperty("total")
    expect(res.body.meta).toHaveProperty("page")
  })
})
```

---

## 5. Mocking Strategy — Detailed

### A. Mocking Prisma

Prisma is imported as a singleton in every service:

```typescript
// order.service.ts
import { prisma } from "@/config/db.config"
```

To mock it in tests:

```typescript
// __tests__/order.service.test.ts
import { vi } from "vitest"
import { createMockPrisma } from "./mocks/prisma"

// Create a mock that returns the same shapes Prisma would
const mockPrisma = createMockPrisma()

// Vitest hoists this to the top of the file automatically
vi.mock("@/config/db.config", () => ({ prisma: mockPrisma }))
```

The mock factory (`__mocks__/prisma.ts`):

```typescript
import { vi } from "vitest"

export function createMockPrisma() {
  return {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    orderItem: {
      createMany: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    admin: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    employee: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    role: { findUnique: vi.fn() },
    permission: { findMany: vi.fn() },
    $transaction: vi.fn(),
    $disconnect: vi.fn(),
  }
}
```

### B. Mocking `$transaction`

The pattern in services is:

```typescript
return await prisma.$transaction(async (tx) => {
  const db = bind(tx)
  // ...
})
```

In tests, the mock `$transaction` should execute the callback with the mock prisma instance:

```typescript
mockPrisma.$transaction.mockImplementation(
  (fn: (tx: typeof mockPrisma) => Promise<any>) => fn(mockPrisma),
)
```

This way, the callback receives a mock `tx` that behaves like the mock prisma — and `bind(tx)` returns a mock repo.

### C. Using the `bind()` Pattern for Testing

The repo layer's `bind()` function is already test-friendly:

```typescript
// order.repo.ts
export function bind(tx: DbClient) {
  return {
    insertOrder: (data: OrderData) => tx.order.create({ data }),
    findOrderById: (id: number) => tx.order.findUnique({ where: { id } }),
    // ...
  }
}
```

Because `bind` accepts any `DbClient` (union of `PrismaClient | Prisma.TransactionClient`), you can pass a mock:

```typescript
const mockTx = createMockPrisma()
const repo = bind(mockTx as any)
await repo.insertOrder(orderData)
expect(mockTx.order.create).toHaveBeenCalled()
```

Or better yet, test `bind` itself by passing actual Prisma methods and verifying they're called correctly:

```typescript
it("bind calls prisma.order.create with correct data", () => {
  const tx = { order: { create: vi.fn() } }
  const repo = bind(tx as any)
  repo.insertOrder({ items: [] })
  expect(tx.order.create).toHaveBeenCalledWith({ data: { items: [] } })
})
```

### D. Mocking Redis

```typescript
import { vi } from "vitest"

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  quit: vi.fn(),
  ping: vi.fn(),
}

vi.mock("@/config/redis.config", () => ({ redisClient: mockRedis }))
```

### E. Mocking Auth Utils

```typescript
import { vi } from "vitest"

vi.mock("@/api/auth/auth.utils", () => ({
  hashPassword: vi.fn((p) => Promise.resolve(`hashed_${p}`)),
  verifyPassword: vi.fn((p, h) => Promise.resolve(h === `hashed_${p}`)),
}))
```

---

## 6. Project Structure for Tests

### Recommended layout

Place tests next to the module they test — co-located, not in a separate `__tests__` root.

```
src/modules/ecom/
  order/
    order.service.ts
    order.service.test.ts       # Unit tests with mocked prisma
    order.service.integration.test.ts  # Integration with real DB
    order.controller.ts
    order.repo.ts
    order.repo.test.ts          # Test bind() creates correct queries
    __snapshots__/
      order.service.test.ts.snap
  validation/
    schemas/
      order.schema.ts
      order.schema.test.ts      # Pure unit tests
      admin.schema.ts
      admin.schema.test.ts
      customer.schema.ts
      customer.schema.test.ts
    validators/
      order.validator.ts
      order.validator.test.ts
  auth/
    policies/
      resources/
        order.policy.ts
        order.policy.test.ts
        product.policy.ts
        product.policy.test.ts
        employee.policy.ts
        employee.policy.test.ts
      rules.test.ts
      ownership.test.ts
    casl/
      ability.factory.test.ts
  shared/
    response.test.ts
    errors.test.ts
   __mocks__/
    prisma.ts                   # Shared prisma mock factory
    redis.ts                    # Shared redis mock factory
```

### Alternative: colocated `__tests__/` folder

If you prefer keeping the module directory uncluttered:

```
src/modules/ecom/order/
  __tests__/
    order.service.test.ts
    order.service.integration.test.ts
    order.repo.test.ts
  order.service.ts
  order.controller.ts
  order.repo.ts
  order.types.ts
  order.errors.ts
```

Either works. Vitest's default discovery (`**/*.test.ts`) handles both.

---

## 7. Setting Up Vitest

### Step 1 — Install dependencies

```bash
pnpm add -D vitest @vitest/coverage-v8 supertest @types/supertest
pnpm add -D testcontainers @testcontainers/postgresql  # For integration tests
```

### Step 2 — Create `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@db": path.resolve(__dirname, "./src/lib/prisma"),
      "@config": path.resolve(__dirname, "./src/config"),
      "@generated": path.resolve(__dirname, "./src/generated"),
    },
  },
  test: {
    globals: false, // prefer explicit imports from vitest
    environment: "node",
    include: ["src/modules/ecom/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/integration.test.ts"], // run integration separately
    coverage: {
      provider: "v8",
      include: ["src/modules/ecom/**"],
      exclude: [
        "**/*.test.ts",
        "**/*.types.ts",
        "**/generated/**",
        "**/docs/**",
      ],
    },
    // Slow integration tests get a longer timeout
    testTimeout: 10_000,
  },
})
```

### Step 3 — Add scripts to `package.json`

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "check": "pnpm exec tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:integration": "vitest run --include='**/*.integration.test.ts' --testTimeout=30000"
  }
}
```

### Step 4 — Run tests

```bash
# Run all unit + mocked service tests
pnpm test

# Watch mode during development
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run integration tests (requires Docker)
pnpm test:integration
```

---

## 8. What NOT to Test

Not everything deserves a test. Here's what to skip:

| Don't test | Why |
|-----------|-----|
| **Barrel exports** (`index.ts`) | Just re-exports — tested through consumer tests |
| **Type definitions** (`.types.ts`) | Types are compile-time, no runtime behavior |
| **Prisma generated code** | It's Prisma's job to test their client |
| **Third-party library calls** | Trust that `argon2.verify` works — test that *your code* calls it correctly |
| **Simple getters/setters** | No logic to test |
| **Error message exact wording** | Test that it throws, not the exact string (brittle) |

---

## 9. Implementation Plan — Phased

### Phase 1 — Foundation

| Step | What | File |
|------|------|------|
| 1 | Install vitest + supertest + testcontainers | `package.json` |
| 2 | Create `vitest.config.ts` | Root |
| 3 | Add test scripts to `package.json` | `package.json` |
| 4 | Create shared mock factories | `src/modules/ecom/__mocks__/prisma.ts`, `redis.ts` |
| 5 | Create test setup file (global config) | `src/modules/ecom/shared/test-setup.ts` |

### Phase 2 — Unit Tests (Pure Functions, No Mocks)

| Step | File to test | Tests per file |
|------|-------------|---------------|
| 6 | `validation/schemas/order.schema.ts` | 5-8 tests |
| 7 | `validation/schemas/admin.schema.ts` | 5-8 tests |
| 8 | `validation/schemas/employee.schema.ts` | 5-8 tests |
| 9 | `validation/schemas/customer.schema.ts` | 5-8 tests |
| 10 | `validation/schemas/product.schema.ts` | 5-8 tests |
| 11 | `validation/schemas/inventory.schema.ts` | 5-8 tests |
| 12 | `validation/schemas/shared.schema.ts` | 3-5 tests |
| 13 | `auth/policies/resources/order.policy.ts` | 10-15 tests |
| 14 | `auth/policies/resources/product.policy.ts` | 8-10 tests |
| 15 | `auth/policies/resources/employee.policy.ts` | 8-10 tests |
| 16 | `auth/policies/resources/customer.policy.ts` | 5-8 tests |
| 17 | `auth/policies/resources/payroll.policy.ts` | 5-8 tests |
| 18 | `auth/policies/rules.ts` | 5-8 tests |
| 19 | `auth/policies/ownership.ts` | 5-8 tests |
| 20 | `shared/errors.ts` | 5-8 tests |
| 21 | `shared/response.ts` | 5-8 tests |

**Estimated:** 80-130 unit tests, all fast (<1ms each).

### Phase 3 — Mocked Service Tests

| Step | File to test | Mock deps |
|------|-------------|-----------|
| 22 | `order/order.service.ts` | prisma |
| 23 | `customer/customer.service.ts` | prisma |
| 24 | `admin/services/auth.service.ts` | prisma, auth.utils |
| 25 | `employee/services/auth.service.ts` | prisma, auth.utils |
| 26 | `admin/services/employee.service.ts` | prisma (largest file — 554 lines, highest ROI) |
| 27 | `admin/services/inventory.service.ts` | prisma |
| 28 | `auth/rbac/rbac.service.ts` | prisma, redis |
| 29 | `employee/services/order.service.ts` | prisma |
| 30 | `product/product.admin.service.ts` | prisma |
| 31 | `product/product.public.service.ts` | prisma |
| 32 | `order/order.repo.ts` | Tests bind() independently |
| 33 | `admin/repo/employee.repo.ts` | Tests bind() independently |

**Estimated:** 50-80 service tests.

### Phase 4 — Integration Tests

| Step | Flow | Files involved |
|------|------|---------------|
| 34 | Auth lifecycle: signup → login → token usage | admin/services/auth, rbac, session |
| 35 | Order lifecycle: create → confirm → update status → cancel | order/service, customer/service, employee/service |
| 36 | Employee lifecycle: admin creates employee → employee logs in → assigned orders | admin/services/employee, employee/services |
| 37 | RBAC enforcement: wrong role gets 403 | All policy + guard code |

**Estimated:** 10-20 integration tests.

### Phase 5 — API / E2E Tests

| Step | Endpoints | Tests |
|------|-----------|-------|
| 38 | Auth endpoints (admin + employee signup/login) | 8-12 tests |
| 39 | Order endpoints (CRUD) | 8-12 tests |
| 40 | Product endpoints (CRUD) | 6-8 tests |
| 41 | Customer endpoints (browse, checkout, track) | 6-8 tests |
| 42 | Error format (400, 401, 403, 404, 500) | 5-8 tests |

**Estimated:** 33-48 API tests.

---

## 10. Migration Checklist

### Phase 1 — Foundation
- [ ] Install `vitest`, `@vitest/coverage-v8`, `supertest`, `@types/supertest`
- [ ] Install `testcontainers`, `@testcontainers/postgresql`
- [ ] Create `vitest.config.ts` with path alias resolution
- [ ] Add `test`, `test:watch`, `test:coverage`, `test:integration` scripts
- [ ] Create `src/modules/ecom/__mocks__/prisma.ts`
- [ ] Create `src/modules/ecom/__mocks__/redis.ts`

### Phase 2 — Unit Tests (80-130 tests)
- [ ] `order.schema.test.ts` — validate order input
- [ ] `admin.schema.test.ts` — validate admin input
- [ ] `employee.schema.test.ts` — validate employee input
- [ ] `customer.schema.test.ts` — validate customer input
- [ ] `product.schema.test.ts` — validate product input
- [ ] `inventory.schema.test.ts` — validate inventory input
- [ ] `shared.schema.test.ts` — validate shared schemas
- [ ] `order.policy.test.ts` — test all role combinations
- [ ] `product.policy.test.ts` — test all role combinations
- [ ] `employee.policy.test.ts` — test all role combinations
- [ ] `customer.policy.test.ts` — test all role combinations
- [ ] `payroll.policy.test.ts` — test all role combinations
- [ ] `rules.test.ts` — test combinator functions
- [ ] `ownership.test.ts` — test ownership checks
- [ ] `errors.test.ts` — test AppError hierarchy
- [ ] `response.test.ts` — test sendSuccess/sendError/sendPaginated

### Phase 3 — Mocked Service Tests (50-80 tests)
- [ ] `order.service.test.ts`
- [ ] `customer.service.test.ts`
- [ ] `admin/auth.service.test.ts`
- [ ] `employee/auth.service.test.ts`
- [ ] `admin/employee.service.test.ts`
- [ ] `admin/inventory.service.test.ts`
- [ ] `rbac/rbac.service.test.ts`
- [ ] `employee/order.service.test.ts`
- [ ] `product.admin.service.test.ts`
- [ ] `product.public.service.test.ts`
- [ ] `order.repo.test.ts`
- [ ] `employee.repo.test.ts`

### Phase 4 — Integration Tests (10-20 tests)
- [ ] Auth lifecycle integration test
- [ ] Order lifecycle integration test
- [ ] Employee lifecycle integration test
- [ ] RBAC enforcement integration test

### Phase 5 — API Tests (30-50 tests)
- [ ] Admin auth API tests
- [ ] Employee auth API tests
- [ ] Order API tests
- [ ] Product API tests
- [ ] Customer API tests
- [ ] Error format API tests

---

## 11. What Good Looks Like

### Test output

```
 ✓ src/modules/ecom/validation/schemas/order.schema.test.ts (6 tests)  12ms
 ✓ src/modules/ecom/auth/policies/resources/order.policy.test.ts (8 tests)  3ms
 ✓ src/modules/ecom/shared/errors.test.ts (5 tests)  2ms
 ✓ src/modules/ecom/shared/response.test.ts (4 tests)  5ms
 ✓ src/modules/ecom/order/__tests__/order.service.test.ts (6 tests)  42ms
 ✓ src/modules/ecom/admin/services/__tests__/auth.service.test.ts (4 tests)  18ms

 Test Files  6 passed (6)
      Tests  33 passed (33)
   Start at  10:30:00
   Duration  142ms (transform 28ms, setup 0ms, collect 61ms, tests 82ms)
```

### CI output (GitHub Actions)

```
Run pnpm test
  vitest run --coverage
  ✓ 128 tests passed (33 files)
  -----------------------|---------|----------|---------|---------|
  File                  | % Stmts | % Branch | % Funcs | % Lines |
  -----------------------|---------|----------|---------|---------|
  modules/ecom/order/   |   92.3  |    85.7  |   90.0  |   92.3  |
  modules/ecom/auth/    |   95.0  |    90.2  |   94.1  |   95.0  |
  modules/ecom/shared/  |  100.0  |   100.0  |  100.0  |  100.0  |
  modules/ecom/admin/   |   78.5  |    70.0  |   76.9  |   78.5  |
  modules/ecom/product/ |   65.2  |    60.0  |   62.5  |   65.2  |
  modules/ecom/customer/|   80.0  |    75.0  |   80.0  |   80.0  |
  -----------------------|---------|----------|---------|---------|
  Total                 |   85.1  |    80.2  |   83.9  |   85.1  |
```

### Confidence checklist

- **You change a Zod schema** → `pnpm test` fails with 6 expected failures in 2 seconds
- **You refactor a service** → tests pass or fail, telling you exactly what broke
- **You add a new policy** → you write the policy + test it in 5 minutes, both in the same PR
- **You deploy** → CI runs 128 tests, all green, you merge with confidence

---

## 12. Additional Resources

- [Vitest documentation](https://vitest.dev/guide/)
- [Supertest documentation](https://github.com/ladjs/supertest)
- [Testcontainers for Node.js](https://node.testcontainers.org/)
- [Testing Express with Supertest + Vitest](https://www.prisma.io/blog/testing-with-vitest-and-supertest-1n8c2o2p1o1r)
- [Prisma testing recommendations](https://www.prisma.io/docs/guides/testing/unit-testing)

---

*Start with Phase 2 (unit tests for validators + policies) — they're the fastest to write, require no mocks, and catch real bugs immediately.*
