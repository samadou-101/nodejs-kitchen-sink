# Product API Sample Requests

## Base URL
```
http://localhost:3000/api/ecom
```

---

## 1. Create Product (POST /product/create)

Create a new product. Inventory is automatically created with the product.

```http
POST http://localhost:3000/api/ecom/product/create
Content-Type: application/json

{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with USB receiver",
  "price": 29.99,
  "categoryId": 1,
  "initialStock": 100
}
```

**Success Response (201):**
```json
{
  "id": 5,
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with USB receiver",
  "price": 29.99,
  "categoryId": 1
}
```

**Note:** The `initialStock` field is optional. If not provided, inventory starts at 0.

**Error Response (409):**
```json
Invalid Data
```

---

## 2. Get Product by ID (GET /product/:id)

Retrieve a specific product by its ID.

```http
GET http://localhost:3000/api/ecom/product/1
```

**Success Response (200):**
```json
{
  "id": 1,
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "categoryId": 1
}
```

**Error Response - Invalid ID (400):**
```
Invalid Product ID
```

**Error Response - Not Found (400):**
```
No prdouct found
```

---

## 3. Get All Products (GET /products)

Retrieve all products.

```http
GET http://localhost:3000/api/ecom/products
```

**Success Response (200):**
```json
[
  {
    "id": 1,
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "categoryId": 1
  },
  {
    "id": 2,
    "name": "Keyboard",
    "description": "Mechanical keyboard",
    "price": 89.99,
    "categoryId": 1
  }
]
```

**Error Response (400):**
```
No products found
```

---

## 4. Update Product (POST /product/update)

Update an existing product.

```http
POST http://localhost:3000/api/ecom/product/update
Content-Type: application/json

{
  "id": 1,
  "name": "Gaming Laptop",
  "description": "High-performance gaming laptop with RGB",
  "price": 1299.99,
  "categoryId": 1
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "name": "Gaming Laptop",
  "description": "High-performance gaming laptop with RGB",
  "price": 1299.99,
  "categoryId": 1
}
```

---

## 5. Delete Product (DELETE /product/:id)

Delete a product by its ID.

```http
DELETE http://localhost:3000/api/ecom/product/1
```

**Success Response (200):**
```
Product deleted successffully
```

**Error Response - Not Found (400):**
```
No product found
```

**Error Response - Internal (500):**
```
Internal server error
```

---

## Common Error Responses

**Internal Server Error (500):**
```json
{
  "message": "Internal server error"
}
```

**Invalid Data (409):**
```
Invalid Data
```