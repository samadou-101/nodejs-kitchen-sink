# Manage Inventory

## Actors

- Admin

## Description

Admin manages categories, products, and stock levels.

## Preconditions

- Admin is authenticated
- Admin role assigned

## Trigger

- Admin chooses to manage inventory

---

## Main Flow

1. Admin selects action:
   - Add/Update Category
   - Add/Update Product
   - Update Stock Quantity

2. System displays relevant fom

3. Admin enters required data

4. Admin submits

5. System validates:
   - Required fields
   - No duplicates (category/product)
   - Product linked to valid category
   - Quantity ≥ 0

6. System saves changes

---

## Alternate Flows

- Invalid data → reject + show errors
- Product without valid category → reject

---

## Postconditions

- Inventory updated correctly
- Data remains consistent and valid
