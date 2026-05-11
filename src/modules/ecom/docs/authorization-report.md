# E-commerce Authorization System Report

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Authorization Flow](#authorization-flow)
3. [Authentication Layer](#authentication-layer)
4. [Authorization Layers](#authorization-layers)
5. [Roles & Permissions Matrix](#roles--permissions-matrix)
6. [What We're Doing Right](#what-were-doing-right)
7. [Issues & Improvements](#issues--improvements)
8. [Usage Examples](#usage-examples)

---

## Executive Summary

The e-commerce module implements a **centralized policy-based authorization system**:

1. **Authentication** - Session-based via cookies + Redis caching
2. **Authorization** - Route guards (coarse) + `authorize()` function with policies (fine-grained)

The system uses a single `authorize(auth, policy)` function that applies policies consistently across all services. Enforcements in the service layer are **mandatory and non-optional** - there is no fallback path if authorization is skipped.

---

## Authorization Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REQUEST LIFECYCLE                                │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌────────────┐
  │  Client  │────▶│   Middleware │────▶│   Route     │────▶│  Service   │
  │ Request  │     │  (authenticate)   │   (guards)   │     │(authorize) │
  └──────────┘     └──────────────┘     └─────────────┘     └────────────┘
                       │                     │                   │
                       ▼                     ▼                   ▼
                  ┌─────────┐          ┌──────────┐        ┌──────────┐
                  │ Session │          │  Roles/  │        │ authorize│
                  │ Check   │          │Perms Check│        │(mandatory)│
                  └─────────┘          └──────────┘        └──────────┘
                       │                                        │
                       ▼                                        ▼
                   ┌─────────┐                              ┌──────────┐
                   │  Redis  │                              │  Policy  │
                   │  Cache  │                              │(auth)=>bool│
                   └─────────┘                              └──────────┘
                       │                                        │
                       ▼                                   ┌──────────┐
                   ┌─────────┐                              │  throws  │
                   │  Prisma │                              │Forbidden │
                   │   DB    │                              │  Error   │
                   └─────────┘                              └──────────┘
```

### Step-by-Step Flow

1. **Request arrives** with `sid` cookie
2. **Session validation** (`rbac.context.ts:authenticate`):
   - Check Redis cache for session
   - Fall back to DB if not cached
   - Validate session not revoked/not expired
   - Auto-extend session if near expiry
3. **AuthContext resolution** (`rbac.service.ts:resolveAuthContext`):
   - Check Redis cache for user roles/permissions
   - Fall back to DB query if not cached (15 min TTL)
   - Build AuthContext with resolved permissions
4. **Route guards** (`guards/permission.guard.ts`, `guards/role.guard.ts`):
   - Check if user has required role OR permission
   - Return 401/403 if fails
   - **This is defense-in-depth only** - never the sole authorization layer
5. **Service-level authorization** (`authorize()` function):
   - Service fetches resource from DB (if needed)
   - Service passes policy to `authorize(auth, policy)`
   - Policy is a function `(auth: AuthContext) => boolean`
   - Throws `AuthorizationError` if policy returns false
   - **This is MANDATORY and cannot be skipped**

---

## Authentication Layer

### Files Involved
- `rbac/rbac.context.ts` - Middleware for session authentication
- `rbac/rbac.service.ts` - AuthContext resolution + caching
- `rbac/rbac.repo.ts` - Database queries for roles/permissions

### Session Handling

```typescript
// rbac.context.ts:22-36
const session = await checkCachedSession(sid) ?? await getUseSessionFromDB(sid);
if (!session || session.revoked) {
  res.status(401).json({ error: "Invalid or expired session" });
  return;
}
const authContext = await resolveAuthContext(session.userId);
req.auth = authContext;
```

### AuthContext Structure

```typescript
// rbac.types.ts:35-41
interface AuthContext {
  userId: number;           // User's database ID
  employeeId: number | null; // Linked employee (if any)
  roleNames: RoleName[];     // ["ADMIN"], ["EMPLOYEE"], etc.
  permissions: string[];     // ["product:read", "order:*", ...]
  isSuperAdmin: boolean;     // Quick check for wildcard access
}
```

### Caching Strategy

| Cache | Key Pattern | TTL | Purpose |
|-------|-------------|-----|---------|
| Session | `session:{sid}` | 15 days (auto-extend) | Session validity |
| Auth | `auth:user:{userId}` | 15 minutes | Roles + permissions |

```typescript
// rbac.service.ts:50-72
const key = `auth:user:${userId}`;
await redisClient.set(key, JSON.stringify(data), {
  expiration: { type: "EX", value: AUTH_CACHE_TTL }, // 15 minutes
});
```

**Issue**: No cache invalidation when roles/permissions change in real-time. Manual invalidation exists but may not be called consistently.

---

## Authorization Layers

### Layer 1: Route Guards (Coarse-Grained - Defense in Depth)

Located in `guards/`:

| Guard | File | Check |
|-------|------|-------|
| `requireRole()` | `role.guard.ts` | User has ANY of the specified roles |
| `requireSuperAdmin()` | `role.guard.ts` | User has SUPERADMIN role |
| `requirePermission()` | `permission.guard.ts` | User has ALL specified permissions |
| `requireAnyPermission()` | `permission.guard.ts` | User has ANY of specified permissions |

**Example Usage:**
```typescript
// In router or controller
router.get('/orders', requireRole('ADMIN'), orderHandler);
router.post('/products', requirePermission('product:create'), productHandler);
```

> **IMPORTANT**: Route guards alone are NOT sufficient. They provide quick rejection at routing level but **cannot** check resource-level ownership or fine-grained business logic. The service layer MUST enforce authorization.

### Layer 2: Centralized `authorize()` Function (Fine-Grained - MANDATORY)

Located in `auth/authorize.ts`:

```typescript
// auth/authorize.ts
export function authorize(auth: AuthContext, policy: Policy): void {
  if (!policy(auth)) {
    throw new AuthorizationError("Access denied");
  }
}
```

#### Policy Type

A **Policy** is a simple function:

```typescript
// auth/policies/rules.ts
type Policy = (auth: AuthContext) => boolean;
```

The policy receives only the `AuthContext` - it does not take a resource parameter directly. Instead, services follow this pattern:

1. **Fetch resource first** from the database
2. **Build context** with relevant resource data
3. **Pass to policy** which checks authorization

#### Policy Structure: Global vs Resource

Policies are organized into two categories:

```
auth/policies/
├── rules.ts              # Rule builders (isSuperAdmin, isRole, and, or, not)
├── ownership.ts          # Ownership helpers
├── index.ts              # Exports all policies
└── resources/
    ├── order.policy.ts   # create(): Policy (global), view(order): Policy (resource)
    ├── product.policy.ts
    ├── customer.policy.ts
    ├── employee.policy.ts
    └── payroll.policy.ts
```

**Global Policies** (no resource context required):
```typescript
// Global - no arguments needed
OrderPolicies.create()    // Can create orders?
OrderPolicies.delete()    // Can delete orders?
ProductPolicies.viewAll() // Can view all products?
```

**Resource Policies** (require resource context):
```typescript
// Resource - requires context object
OrderPolicies.view(orderContext)     // Can view this specific order?
OrderPolicies.update(orderContext)  // Can update this specific order?
EmployeePolicies.view(employeeContext) // Can view this employee?
```

#### Policy Definition Pattern

```typescript
// auth/policies/resources/order.policy.ts

// Global policies - no resource context needed
export const OrderPolicies = {
  create: (): Policy => and(isSuperAdmin(), isRole("ADMIN")),
  delete: (): Policy => or(isSuperAdmin(), isRole("ADMIN")),
  viewAll: (): Policy => or(isSuperAdmin(), isRole("ADMIN"), isRole("EMPLOYEE")),
  assign: (): Policy => or(isSuperAdmin(), isRole("ADMIN")),

  // Resource policies - require context
  view: (order: OrderContext): Policy => or(
    isSuperAdmin(),
    and(isRole("ADMIN")),
    and(isRole("EMPLOYEE"), isOwnedByEmployee(order.employeeId))
  ),
  update: (order: OrderContext): Policy => or(
    isSuperAdmin(),
    and(isRole("ADMIN")),
    and(isRole("EMPLOYEE"), isOwnedByEmployee(order.employeeId))
  ),
  confirm: (order: OrderContext): Policy => or(
    isSuperAdmin(),
    and(isRole("EMPLOYEE"), isOwnedByEmployee(order.employeeId))
  ),
} as const;
```

#### Rule Builders (auth/policies/rules.ts)

```typescript
// Core rule builders
isSuperAdmin(): Policy           // True if auth.isSuperAdmin
isRole(role: string): Policy     // True if auth has this role
and(...policies: Policy[]): Policy   // All must pass
or(...policies: Policy[]): Policy    // Any must pass
not(policy: Policy): Policy      // Negates the policy
```

#### Integration in Services (MANDATORY)

```typescript
// order.service.ts
import { authorize } from "../auth";
import { OrderPolicies } from "../auth/policies";

export async function getOrderById(orderId: number, auth: unknown) {
  assertAuth(auth);

  // 1. Fetch the resource
  const order = await db.findOrderById(orderId);
  if (!order) throw new OrderNotFoundError(orderId);

  // 2. Build context
  const orderContext = {
    orderId: order.orderId,
    employeeId: order.employeeId,
    customerId: order.customerId,
  };

  // 3. MANDATORY authorization - cannot be skipped!
  authorize(auth, OrderPolicies.view(orderContext));

  return order;
}

export async function createOrder(data: CreateOrderInput, auth: unknown) {
  assertAuth(auth);

  // Global policy - no resource needed
  authorize(auth, OrderPolicies.create());

  // ... create order
}
```

> **CRITICAL**: The `authorize()` call is **MANDATORY and non-optional**. There is no code path that skips authorization. If the service does not call `authorize()`, the request is NOT authorized. This is enforced by design - there is no fallback.

#### Context Types

Each resource policy defines its own context type:

```typescript
// auth/policies/resources/order.policy.ts
interface OrderContext {
  orderId: number;
  employeeId: number | null;
  customerId: number;
}

// auth/policies/resources/employee.policy.ts
interface EmployeeContext {
  employeeId: number;
  userId: number;
  isActive: boolean;
}
```

The service builds these context objects after fetching the resource from the database.

---

## Roles & Permissions Matrix

### Roles Defined in `rbac.types.ts`

```typescript
export const RoleName = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  EMPLOYEE: "EMPLOYEE",
} as const;
```

### Seed Data (`rbac.seed.ts`)

| Role | Permissions |
|------|-------------|
| **SUPERADMIN** | `*:*` (wildcard - full access) |
| **ADMIN** | `product:*`, `order:*`, `inventory:*`, `employee:*`, `payroll:*`, `customer:*` |
| **EMPLOYEE** | `order:read`, `order:update`, `order:confirm` |

### Permission Resolution (`rbac.matcher.ts`)

Wildcard permissions are expanded at runtime:

```typescript
// rbac.matcher.ts:16-38
export function resolvePermissions(permissions: string[]): string[] {
  for (const perm of permissions) {
    if (perm === "*") {
      resolved.push("*");
      continue;
    }
    if (perm.endsWith(":*")) {
      const resource = perm.slice(0, -2);
      resolved.push(`${resource}:create`);
      resolved.push(`${resource}:read`);
      resolved.push(`${resource}:update`);
      resolved.push(`${resource}:delete`);
      continue;
    }
    resolved.push(perm);
  }
  return resolved;
}
```

### Permissions Available (Database Seed)

| Resource | Actions |
|----------|---------|
| product | create, read, update, delete |
| order | create, read, update, confirm, delete |
| inventory | create, read, update, delete |
| employee | create, read, update, delete |
| payroll | create, read, update |
| customer | create, read, update, delete |

---

## What We're Doing Right

### 1. **Two-Layer Authorization**
Separating coarse route guards from fine-grained resource policies is a solid pattern. It allows:
- Quick rejection at routing level
- Business-logic-aware checks at service level

### 2. **Wildcard Permission Support**
The `resolvePermissions` function properly expands `resource:*` into individual actions, enabling ADMIN to have full CRUD without listing each action.

### 3. **Ownership-Based Policies**
Policies like `canViewOrder` check not just role but also `employeeId` match, preventing employees from viewing each other's orders.

### 4. **Session Auto-Extension**
The session cache logic extends TTL automatically when nearing expiry, providing better UX without compromising security significantly.

### 5. **Caching Strategy**
- 15-minute auth cache reduces DB load
- Session cache in Redis with fallback to DB
- Proper cache invalidation function available

### 6. **Transaction Support**
Enforcers accept `PrismaClient | Prisma.TransactionClient`, allowing authorization checks within transactions.

### 7. **Error Hierarchy**
Custom errors (`ForbiddenError`, `UnauthorizedError`, `NotFoundError`) with proper handling in controllers.

### 8. **SuperAdmin Bypass**
The `isSuperAdmin` flag provides a fast-path for full access without role iteration.

---

## Issues & Improvements

### Critical Issues

#### 1. **Inconsistent Use of Guards vs Enforcers**
Some routes use guards only, some use enforcers, some use neither.

```typescript
// order.controller.ts - mixes approaches
router.post('/order/create', /* no guard */, orderHandler);  // Relies on enforcer inside service
router.get('/orders', /* no guard */, orderHandler);        // Relies on enforcer inside service
```

**Risk**: If service forgets to call enforcer, unauthorized access occurs.

**Recommendation**: Add guards at route level as defense-in-depth:
```typescript
router.get('/orders', requirePermission('order:read'), orderHandler);
```

#### 2. **No Audit Logging**
Authorization decisions (especially denials) are not logged anywhere.

**Risk**: Impossible to detect attacks or debug authorization issues.

**Recommendation**: Add logging:
```typescript
export function logAuthz(result: AuthorizationResult, ctx: AuthContext, resource: string) {
  if (!result.allowed) {
    logger.warn({
      userId: ctx.userId,
      roles: ctx.roleNames,
      resource,
      reason: result.reason,
      timestamp: new Date(),
    });
  }
}
```

#### 3. **Cache Invalidation Not Automatic**
When admin changes a user's role, the cache isn't automatically invalidated.

**Risk**: User retains old permissions for up to 15 minutes.

**Recommendation**: Add trigger-based invalidation:
```typescript
// In rbac.repo.ts - after role changes
export async function assignRoleToUser(...) {
  // ... existing code ...
  await invalidateAuthCache(userId); // Add this
}
```

### Medium Issues

#### 4. **Missing Input Validation on Role Guards**
`requireRole()` doesn't validate against the RoleName enum - accepts any string.

```typescript
// role.guard.ts:4 - vulnerable to typos
export function requireRole(...requiredRoles: RoleName[]) {
  // RoleName is just a type, not runtime validation
  // "ADMIN " (with space) would pass type check but fail logic
}
```

**Risk**: TypeScript only validates at compile time; runtime accepts any string.

**Recommendation**: Runtime validation:
```typescript
const VALID_ROLES = new Set(['SUPERADMIN', 'ADMIN', 'EMPLOYEE']);
function isValidRole(role: string): role is RoleName {
  return VALID_ROLES.has(role);
}
```

#### 5. **Session Extension Race Condition**
The session auto-extension logic reads and writes without atomicity.

```typescript
// rbac.context.ts:52-61
if (expiresAt.getTime() - now <= EXTEND_THRESHOLD_MS) {
  session.expires_at = newExpiresAt;  // Race: concurrent requests
  await redisClient.set(key, JSON.stringify(session));  // Could overwrite each other
}
```

**Risk**: Under high concurrency, extension might be lost or session could be extended multiple times.

**Recommendation**: Use Redis transactions or Lua scripts:
```typescript
await redisClient.watch(key); // Optimistic locking
// Or use INCR to track extensions
```

#### 6. **Incomplete Permission Coverage**
EMPLOYEE role gets `order:confirm` but this action isn't in the standard Action enum.

```typescript
// rbac.types.ts - standard actions
export const Action = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  ALL: "*",
} as const;

// rbac.seed.ts - non-standard action
{ resource: "order", action: "confirm" } // "confirm" not in enum!
```

**Risk**: Inconsistent enum vs actual values; matcher may not handle it properly.

**Recommendation**: Either add to enum or remove from seed:
```typescript
export const Action = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  CONFIRM: "confirm", // Add this
  ALL: "*",
} as const;
```

#### 7. **No Permission Deny List**
Currently only allows (whitelist), cannot explicitly deny.

**Risk**: Cannot implement "deny EMPLOYEE from viewing customers" without creating a new role.

#### 8. **Missing Resource-Level Ownership for Other Resources**
While Order has ownership checks, other resources may not:

- `product.policy.ts` - only checks role, not ownership
- `customer.policy.ts` - only checks role
- `employee.policy.ts` - only checks role

**Risk**: For resources that could have ownership (e.g., products assigned to employees), there's no fine-grained control.

### Minor Issues

#### 9. **No Rate Limiting on Auth**
Auth endpoints (login, session validation) aren't rate-limited.

**Risk**: Brute-force attacks on authentication.

#### 10. **Hardcoded Magic Numbers**
```typescript
const AUTH_CACHE_TTL = 60 * 15;        // Should be env variable
const EXTEND_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;  // 3 days
const EXTENSION_MS = 7 * 24 * 60 * 60 * 1000;         // 7 days
```

#### 11. **No Multi-Role Logic Documentation**
When a user has multiple roles (e.g., ADMIN + EMPLOYEE), policy logic doesn't specify priority.

---

## Usage Examples

### Example 1: Route Guard (Defense-in-Depth)

```typescript
// router.ts
import { requireRole, requirePermission } from "@/modules/ecom/auth";

router.get(
  "/admin/employees",
  requireRole("ADMIN"),  // First check - coarse-grained
  employeeController.list
);

// Note: Route guard alone is NOT sufficient - ownership cannot be checked here
```

### Example 2: Service-Level Authorization (MANDATORY)

```typescript
// order.service.ts
import { authorize } from "../auth";
import { OrderPolicies } from "../auth/policies";

export async function getOrderById(orderId: number, auth: unknown) {
  assertAuth(auth);

  // Step 1: Fetch the resource from DB
  const order = await db.findOrderById(orderId);
  if (!order) throw new OrderNotFoundError(orderId);

  // Step 2: Build context
  const orderContext = {
    orderId: order.orderId,
    employeeId: order.employeeId,
    customerId: order.customerId,
  };

  // Step 3: MANDATORY authorization - throws AuthorizationError if denied
  authorize(auth, OrderPolicies.view(orderContext));

  return order;
}

export async function createOrder(data: CreateOrderInput, auth: unknown) {
  assertAuth(auth);

  // Global policy - no resource needed
  authorize(auth, OrderPolicies.create());

  // ... create order logic
}

export async function deleteOrder(orderId: number, auth: unknown) {
  assertAuth(auth);

  // Global policy for delete
  authorize(auth, OrderPolicies.delete());

  // ... delete logic
}
```

### Example 3: Employee Owns Order Check

```typescript
// employee/order.service.ts - Employee viewing their assigned orders
import { authorize } from "../../auth";
import { OrderPolicies } from "../../auth/policies";

export async function getMyOrders(auth: unknown) {
  assertAuth(auth);

  // Employee can view orders assigned to them
  authorize(auth, OrderPolicies.viewAssigned());

  return prisma.order.findMany({
    where: { employeeId: auth.employeeId },
  });
}

export async function confirmOrder(orderId: number, auth: unknown) {
  assertAuth(auth);

  // Must fetch order first to check ownership
  const order = await db.findOrderById(orderId);
  if (!order) throw new OrderNotFoundError(orderId);

  // Employee can only confirm their own orders
  authorize(auth, OrderPolicies.confirm({
    orderId: order.orderId,
    employeeId: order.employeeId,
    customerId: order.customerId,
  }));

  // ... confirmation logic
}
```

### Example 4: Complete Flow Diagram

```
Request: GET /orders/123
         │
         ▼
┌────────────────────────┐
│  Middleware (auth)    │  - Validates session
│  req.auth populated   │  - Resolves AuthContext
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│  Route Guard          │  - requirePermission('order:read')
│  (optional, defense)  │  - Quick rejection if missing permission
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│  Service Layer         │
│  getOrderById()        │
│                        │
│  1. Fetch order from  │
│     DB (orderId=123)  │
│                        │
│  2. Build context:    │
│     { orderId: 123,   │
│       employeeId: 5,  │
│       customerId: 10 }│
│                        │
│  3. authorize(auth,   │
│     OrderPolicies.    │
│     view(context))    │◄── MANDATORY, non-optional
│                        │
│  4. If allowed:       │
│     return order       │
│     If denied:        │
│     throw AuthError   │
└────────────────────────┘
         │
         ▼
Response: 200 OK with order OR 403 Forbidden
```

### Example 5: Anti-Pattern (NEVER DO THIS)

```typescript
// WRONG - Missing authorize() call
async function getOrder(orderId: number, auth: AuthContext) {
  const order = await prisma.order.findUnique({ where: { orderId } });
  return order;  // No authorization! Anyone can view any order
}

// WRONG - Fetching resource AFTER authorization check
async function getOrder(orderId: number, auth: AuthContext) {
  authorize(auth, OrderPolicies.view());  // Policy has no context!
  const order = await prisma.order.findUnique({ where: { orderId } });
  return order;  // Policy couldn't check ownership because
                  // order wasn't fetched yet
}

// CORRECT - Fetch first, then authorize
async function getOrder(orderId: number, auth: AuthContext) {
  const order = await prisma.order.findUnique({ where: { orderId } });
  if (!order) throw new NotFoundError();

  authorize(auth, OrderPolicies.view({
    orderId: order.orderId,
    employeeId: order.employeeId,
    customerId: order.customerId,
  }));

  return order;
}
```

---

## Summary

### Strengths
- ✅ Two-layer authorization architecture
- ✅ Ownership-based fine-grained controls
- ✅ Wildcard permission expansion
- ✅ Caching for performance
- ✅ Clear error hierarchy

### Weaknesses
- ❌ Inconsistent application of guards vs enforcers
- ❌ No audit logging
- ❌ Cache invalidation gaps
- ❌ Race conditions in session extension
- ❌ Non-standard permission actions
- ❌ No input validation at runtime

### Recommended Action Items
1. Audit all routes to ensure both guards AND enforcers are used
2. Add authorization audit logging
3. Implement automatic cache invalidation on role changes
4. Add `confirm` to Action enum
5. Fix session extension with atomic operations
6. Add rate limiting on auth endpoints

---

*Generated: May 2026*
*Files Analyzed: 22 authorization-related files in `src/modules/ecom/auth/`*