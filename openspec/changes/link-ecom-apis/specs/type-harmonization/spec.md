## ADDED Requirements

### Requirement: Product type matches API response
The system SHALL define the `Product` type to match the shape returned by `GET /products` and `GET /product/:id`, which includes `productId` (not `id`), and nested `inventory` and `category` relations.

#### Scenario: Product list type
- **WHEN** the frontend receives a product list from `GET /api/ecom/products`
- **THEN** each product object has fields: `productId`, `name`, `description`, `price`, `imageUrl`, `categoryId`, `inventory` (with `inventoryId`, `productId`, `quantityAvailable`, `lastUpdated`), and `category` (with `categoryId`, `name`, `description`)

#### Scenario: Product detail type
- **WHEN** the frontend receives a product from `GET /api/ecom/product/:id`
- **THEN** the product object has fields: `productId`, `name`, `description`, `price`, `imageUrl`, `categoryId`, `inventory` (with `inventoryId`, `productId`, `quantityAvailable`, `lastUpdated`)

### Requirement: Order type matches API response for list vs detail
The system SHALL define the `Order` type accounting for the fact that `GET /orders` returns a rich object with nested relations, while `GET /order/:id` returns a flat order row.

#### Scenario: Admin order list type
- **WHEN** the frontend receives an order list from `GET /api/ecom/orders`
- **THEN** each order object has: `orderId`, `customerId`, `orderDate`, `orderStatusId`, `employeeId`, `notes`, plus nested `customer` (full Customer), `status` (OrderStatus), `employee` (with `user: { name }`), and `orderItems` (each with `productId`, `quantity`, `price`, and nested `product`)

#### Scenario: Admin single order type
- **WHEN** the frontend receives an order from `GET /api/ecom/order/:id`
- **THEN** the order object has ONLY flat fields: `orderId`, `customerId`, `orderDate`, `orderStatusId`, `employeeId?`, `notes?` — no nested relations

#### Scenario: Employee order type
- **WHEN** the frontend receives an order from `GET /api/ecom/employee/orders/:id`
- **THEN** the order object has: `orderId`, `customerId`, `orderDate`, `orderStatusId`, `employeeId`, `notes`, plus nested `customer`, `status`, and `orderItems` with nested `product`

### Requirement: AuthContext type matches backend req.auth shape
The system SHALL define the `AuthContext` type as `{ userId, employeeId, roleNames, permissions, isSuperAdmin }` — matching the shape returned by `GET /api/ecom/auth/me`.

#### Scenario: AuthContext from session restore
- **WHEN** the frontend calls `GET /api/ecom/auth/me`
- **THEN** the returned `AuthContext` has: `userId` (number), `employeeId` (number | null), `roleNames` (string[]), `permissions` (string[]), `isSuperAdmin` (boolean)

### Requirement: Types use exact Prisma field names
All frontend types SHALL use the same field names as the Prisma models: `productId`, `orderId`, `categoryId`, `customerId`, `employeeId`, `inventoryId`, `orderItemId`, `paymentTypeId`, `payrollRunId`, `payrollRunItemId`.

#### Scenario: Category type
- **WHEN** the frontend receives a category from `GET /api/ecom/categories`
- **THEN** the category object has fields: `categoryId`, `name`, `description`

#### Scenario: OrderItem type
- **WHEN** the frontend receives order items
- **THEN** each item has: `orderItemId`, `orderId`, `productId`, `quantity`, `price`, plus optional `product` relation when included
