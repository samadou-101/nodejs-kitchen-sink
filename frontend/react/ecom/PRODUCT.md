# Product

## Register

product

Note: Customer-facing storefront pages may use `brand` register override when the task calls for it.

## Users

### Customers (Public, No Auth)
Algerian shoppers browsing products on desktop or mobile. They value clarity, simplicity, and trust. Context: COD-only means they need to feel confident their order will actually arrive. Job to be done: Find products, place orders quickly, track order status by phone number.

### Employees (Order Confirmation Staff)
Internal staff working at desks during daytime hours. They process many orders per day via phone calls outside the system. Job to be done: See assigned orders clearly, confirm/reject quickly with minimal friction, add notes when needed. Efficiency is everything.

### Admins (System Owners)
Business owners or operations managers managing the entire e-commerce operation. They need visibility and control. Job to be done: Manage products/categories, monitor order flow, oversee employees and payroll, maintain inventory levels. Trust in data is critical.

## Product Purpose

A Cash on Delivery (COD) e-commerce platform built for the Algerian market, combining a customer-facing storefront with internal operations management. The system intentionally defers stock decrement until order confirmation (after phone verification), handles multiple payment models for employees (salary + per-order commission), and tracks everything without requiring customer accounts.

Success means:
- Customers can browse and checkout in under 60 seconds
- Employees process orders without fighting the UI
- Admins have one source of truth for orders, stock, and payroll

## Brand Personality

**Modern, Minimal, Trustworthy**

Linear-inspired restraint for the admin/employee tools (clarity, efficiency, no decoration), Shopify-inspired product clarity for the storefront (product-first, readable, calm). 

The interface should disappear when users are working. No animation for animation's sake. No decorative elements that compete with the actual content.

Tone: Direct, confident, quiet. Not loud, not cute, not overly clever.

## Anti-References

**SaaS bloat patterns to avoid:**
- Identical card grids repeated across dashboard pages
- Gradient accents used decoratively
- The "hero metric" template (big number + small label + supporting stat + gradient accent)
- Glassmorphism cards for no reason
- Side-stripe colored borders on list items or alerts

**Cheap e-commerce patterns to avoid:**
- Countdown timers and fake urgency tactics
- Overly aggressive "Add to Cart" animations
- Floating chat widgets that block content
- Overcrowded product pages with 10+ information sections
- Star ratings and review widgets that look like Amazon clones

## Design Principles

1. **Content first, always** — Layout serves the information hierarchy, not the other way around. If something doesn't help the user read or act, remove it.

2. **Consistent restraint** — One accent color used sparingly. One weight for body text. One card style. Consistency beats inventiveness when trust is the product.

3. **Speed as a feature** — No heavy animations. No loading states that pretend to be fancy. Show data as fast as possible. Skeletons are fine; animated progress indicators are not.

4. **Clear over clever** — "Orders" not "Orders Hub". "Inventory" not "Stock Intelligence". Labels should read like a spreadsheet, not a marketing page.

5. **Mobile gets equal care** — The storefront works on phones. The admin flows don't break when squashed. Touch targets are sized for real fingers.

## Accessibility & Inclusion

- Basic keyboard navigation support (focus visible, tab order follows visual flow)
- Reasonable color contrast (avoid edge cases where contrast dips too low)
- Reduced motion respected (no critical information conveyed only through animation)
- Touch targets minimum 44px on mobile