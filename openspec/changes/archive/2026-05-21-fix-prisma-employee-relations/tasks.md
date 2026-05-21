## 1. Fix Prisma Relation Name

- [x] 1.1 Change `contracts` to `employeePaymentContracts` in `src/modules/ecom/admin/repo/employee.repo.ts:302`
- [x] 1.2 Search for any downstream consumer of `getAllEmployees()` that references the `contracts` key and update it
- [x] 1.3 Run `pnpm dev` and verify `GET /api/ecom/admin/employees` works without PrismaClientValidationError
