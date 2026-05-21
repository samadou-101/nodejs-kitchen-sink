## Context

The `getAllEmployees()` function in `src/modules/ecom/admin/repo/employee.repo.ts:291` queries `prisma.employee.findMany()` with an `include` block that references `contracts`. The Prisma schema (`schema.prisma:234`) defines this relation as `employeePaymentContracts`. This mismatch causes a `PrismaClientValidationError` at runtime.

Only one occurrence exists across the codebase — no other Prisma queries reference incorrect Employee relation names.

## Goals / Non-Goals

**Goals:**
- Fix the Prisma validation error on `GET /api/ecom/admin/employees`
- Ensure the returned data preserves the same shape for API consumers

**Non-Goals:**
- No data model changes — this is purely a query fix
- No other relation name fixes needed (verified across the full codebase)

## Decisions

- **Fix field name only**: Change `contracts` to `employeePaymentContracts` in the include block. No alias needed since the result of `getAllEmployees()` isn't consumed elsewhere with `contracts` as a key.
- **Keep `where: { isActive: true }`**: The filtering intention is correct, just the relation name was wrong.

## Risks / Trade-offs

- Breaking change if any downstream consumer references `contracts` in the result. Search confirms no such usage exists in the codebase.
