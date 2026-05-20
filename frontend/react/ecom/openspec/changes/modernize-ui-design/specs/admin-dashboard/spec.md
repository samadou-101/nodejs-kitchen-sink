## ADDED Requirements

### Requirement: Dashboard shows KPI metric cards
The system SHALL display summary metric cards at the top of the admin dashboard overview page.

#### Scenario: KPI cards display key metrics
- **WHEN** the admin navigates to the dashboard
- **THEN** the overview page displays four KPI cards: Total Products, Pending Orders, Low Stock Items, and Active Employees, each with an icon and count

#### Scenario: KPI card loading state
- **WHEN** KPI data is loading
- **THEN** each KPI card shows a Skeleton shimmer placeholder

### Requirement: Admin CRUD lists use Table component
The system SHALL render all admin CRUD data lists (products, categories, orders, employees, inventory, payroll) using the shadcn Table component.

#### Scenario: Product list uses Table
- **WHEN** the admin views the product management page
- **THEN** products are displayed in a shadcn Table with columns for image thumbnail, name, price, category, and actions

#### Scenario: Order list uses Table
- **WHEN** the admin views the order management page
- **THEN** orders are displayed in a shadcn Table with columns for order ID, customer, status Badge, assigned employee, and actions

#### Scenario: Employee list uses Table
- **WHEN** the admin views the employee management page
- **THEN** employees are displayed in a shadcn Table with columns for name, email, payment type, and actions

### Requirement: Admin product form includes image URL
The system SHALL allow admins to set a product image URL when creating or editing a product.

#### Scenario: Create product with image URL
- **WHEN** the admin creates a product
- **THEN** the form includes an "Image URL" text input and a preview thumbnail that updates as the URL is typed

### Requirement: Admin sidebar is responsive
The system SHALL adapt the admin sidebar to smaller viewports.

#### Scenario: Collapsible sidebar
- **WHEN** the viewport is below 1024px
- **THEN** the sidebar collapses to show only icons with tooltips
- **WHEN** the viewport is above 1024px
- **THEN** the sidebar shows icons with labels

### Requirement: Tables horizontally scroll on mobile
The system SHALL allow admin tables to scroll horizontally on small viewports.

#### Scenario: Table horizontal scroll
- **WHEN** the viewport is below 768px and a Table has many columns
- **THEN** the Table container enables horizontal scrolling with visible scrollbar
