## ADDED Requirements

### Requirement: Customer can browse paginated product list
The system SHALL display products with pagination, showing page metadata (current page, total count, total pages). Default page is 1, default limit is 20 (max 100).

#### Scenario: View first page of products
- **WHEN** the customer opens the products page
- **THEN** the system fetches `GET /api/ecom/products?page=1&limit=20` and displays the product grid with pagination controls

#### Scenario: Navigate to next page
- **WHEN** the customer clicks the "Next" pagination button
- **THEN** the system fetches the next page and updates the product grid

#### Scenario: Empty catalog
- **WHEN** no products exist
- **THEN** the system displays "No products found"

#### Scenario: Loading state
- **WHEN** products are being fetched
- **THEN** the system shows a skeleton/grid placeholder

### Requirement: Customer can search products by name or description
The system SHALL allow customers to search products using a text query, sent as `search` query parameter.

#### Scenario: Search by product name
- **WHEN** the customer types in the search bar and submits
- **THEN** the system fetches `GET /api/ecom/products/search?q=<query>` and displays matching results

#### Scenario: No results for search
- **WHEN** the search query returns no products
- **THEN** the system displays "No products match your search"

### Requirement: Customer can filter products by category
The system SHALL allow customers to filter the product list by selecting a category, sent as `categoryId` query parameter.

#### Scenario: Filter by category
- **WHEN** the customer selects a category from the filter dropdown
- **THEN** the system fetches `GET /api/ecom/products?categoryId=<id>` and displays only products in that category

#### Scenario: View category list
- **WHEN** the customer opens the category filter
- **THEN** the system fetches `GET /api/ecom/categories` and populates the filter options

### Requirement: Customer can view product details
The system SHALL display full product information on a dedicated detail page.

#### Scenario: View product detail by ID
- **WHEN** the customer clicks a product card
- **THEN** the system fetches `GET /api/ecom/product/:id` and displays the product name, description, price, category, and image

#### Scenario: Product not found
- **WHEN** the product ID does not exist
- **THEN** the system shows a 404/not-found page with "Product not found"

### Requirement: Pagination metadata is displayed
The system SHALL extract `page`, `limit`, and `total` from the API response `meta` field and display current page info.

#### Scenario: Page info display
- **WHEN** the product list is displayed
- **THEN** the system shows "Page X of Y" and total product count
