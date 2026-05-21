## 1. Backend Controller Fix

- [x] 1.1 Replace `req.query.employeeId` with `req.auth.employeeId` on line 24 of `src/modules/ecom/employee/controllers/order.controller.ts`
- [x] 1.2 Update the validation check on line 25 to validate `req.auth.employeeId` instead of the removed query param
- [x] 1.3 Update the `getAssignedOrders` call on line 30 to pass `employeeId` directly (no `Number()` cast needed if typed as number)
- [x] 1.4 Restart dev server and verify `http://localhost:5173/employee` loads without the validation error
