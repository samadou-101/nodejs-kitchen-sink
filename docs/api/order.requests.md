# Order API Sample Requests

## Base URL
```
http://localhost:3000/api/ecom
```

## Order Status IDs
| orderStatusId | name |
|---------------|------|
| 1 | pending |
| 2 | confirmed |
| 3 | canceled |

---

## 1. Create Order (POST /order/create)

Create a new order with customer and order items.

```http
POST http://localhost:3000/api/ecom/order/create
Content-Type: application/json

{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, Country"
  },
  "orderItems": [
    {
      "productId": 1,
      "price": 29.99,
      "quantity": 2
    },
    {
      "productId": 3,
      "price": 49.99,
      "quantity": 1
    }
  ],
  "orderDate": "2026-05-04T10:00:00Z",
  "orderStatusId": 1,
  "employeeId": null,
  "notes": "Please deliver before 5 PM"
}
```

**Success Response (201):**
```json
{
  "orderId": 10,
  "customerId": 5,
  "notes": "Please deliver before 5 PM",
  "orderDate": "2026-05-04T10:00:00Z",
  "orderStatusId": 1
}
```

**Error Response - Insufficient Stock (400):**
```json
{
  "message": "Insufficient stock for product 1: requested 10, available 5"
}
```

---

## 2. Get Order by ID (GET /order/:id)

Retrieve a specific order by its ID.

```http
GET http://localhost:3000/api/ecom/order/10
```

**Success Response (200):**
```json
{
  "orderId": 10,
  "customerId": 5,
  "employeeId": null,
  "orderDate": "2026-05-04T10:00:00Z",
  "orderStatusId": 1,
  "notes": "Please deliver before 5 PM"
}
```

**Error Response - Not Found (404):**
```json
{
  "message": "Order 999 not found"
}
```

---

## 3. Update Order (PATCH /order/:id)

Update order details including status, notes, employee, and customer info.

```http
PATCH http://localhost:3000/api/ecom/order/10
Content-Type: application/json

{
  "customer": {
    "name": "John Updated",
    "email": "john.updated@example.com",
    "phone": "+0987654321",
    "address": "456 New St, New City, Country"
  },
  "orderStatusId": 2,
  "employeeId": 3,
  "notes": "Order confirmed, please ship",
  "orderItems": [
    {
      "productId": 1,
      "price": 29.99,
      "quantity": 3
    }
  ]
}
```

**Success Response (200):**
```json
{
  "orderId": 10,
  "customerId": 5,
  "employeeId": 3,
  "orderDate": "2026-05-04T10:00:00Z",
  "orderStatusId": 2,
  "notes": "Order confirmed, please ship"
}
```

**Error Response - Not Found (404):**
```json
{
  "message": "Order 999 not found"
}
```

---

## 4. Delete Order (DELETE /order/:id)

Delete an order by its ID.

```http
DELETE http://localhost:3000/api/ecom/order/10
```

**Success Response (204):** No content

**Error Response - Not Found (404):**
```json
{
  "message": "Order 999 not found"
}
```

---

## 5. Update Order Status (PATCH /order/:id/status)

Update only the status of an order.

```http
PATCH http://localhost:3000/api/ecom/order/10/status
Content-Type: application/json

{
  "statusId": 2
}
```

**Success Response (200):**
```json
{
  "orderId": 10,
  "customerId": 5,
  "employeeId": null,
  "orderDate": "2026-05-04T10:00:00Z",
  "orderStatusId": 2,
  "notes": "Please deliver before 5 PM"
}
```

**Error Response - Invalid (400):**
```json
{
  "message": "Invalid order ID or status ID"
}
```

---

## 6. Assign Employee to Order (PATCH /order/:id/employee)

Assign an employee to handle an order.

```http
PATCH http://localhost:3000/api/ecom/order/10/employee
Content-Type: application/json

{
  "employeeId": 5
}
```

**Success Response (200):**
```json
{
  "orderId": 10,
  "customerId": 5,
  "employeeId": 5,
  "orderDate": "2026-05-04T10:00:00Z",
  "orderStatusId": 1,
  "notes": "Please deliver before 5 PM"
}
```

---

## 7. Remove Employee from Order (PATCH /order/:id/employee/remove)

Unassign the employee from an order.

```http
PATCH http://localhost:3000/api/ecom/order/10/employee/remove
```

**Success Response (200):**
```json
{
  "orderId": 10,
  "customerId": 5,
  "employeeId": null,
  "orderDate": "2026-05-04T10:00:00Z",
  "orderStatusId": 1,
  "notes": "Please deliver before 5 PM"
}
```

---

## Common Error Responses

**Invalid Order ID (400):**
```json
{
  "message": "Invalid order ID"
}
```

**Internal Server Error (500):**
```json
{
  "message": "Internal server error"
}
```

**Route Not Found (404):**
```json
{
  "message": "Route not found"
}
```