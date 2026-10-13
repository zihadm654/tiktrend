# Glossary

Canonical vocabulary for the TikTrend watch store. Read this before adding terms; edit it when the domain changes.

## Core entities

- **Product** — a sellable watch sold by the store. Has a name, slug (URL identifier, kebab-case, unique), SKU (auto-generated, unique), description, price, optional compare-at price, current stock, image URLs, category, attributes, and a featured flag.
- **Category** — a single-level grouping of products (Analog, Chronograph, Automatic, Diving, Smart, Luxury). The store is single-brand; categories replace any concept of "brands".
- **Attributes** — a JSONB spec map on a Product (movement, case diameter, water resistance, strap material, case material, glass, warranty). Displayed on the product detail page; not filterable in v1.
- **Compare-at price** — the "was" price shown struck-through next to the current price on sale products.
- **Stock** — integer quantity of a Product available to sell. Out-of-stock products cannot be added to a cart.

## Shopping

- **Cart / CartItem** — line items (product + quantity) a shopper is about to buy. Guests keep a cart in localStorage; signed-in customers get a server cart keyed to their user account.
- **Cart merge** — the operation at sign-in that folds guest cart items into the server cart, keeping the higher quantity per line and clamping to available stock.
- **Wishlist** — a signed-in customer's saved products, one row per product per customer.

## Purchasing

- **Checkout** — the event that turns a Cart into an Order. Requires sign-in and validated shipping information (name, phone, city, address, optional note). Payment is Cash on Delivery only.
- **Order** — a purchase record, always owned by a Customer. Carries a snapshot of the shipping details entered at checkout and a short human-friendly **order reference** code (`TT-XXXXXX`) plus an internal UUID key.
- **OrderItem** — a line of an Order. Snapshots the product's **name and unit price at purchase time**, so changing product prices never rewrites order history.
- **Order lifecycle** — `pending → confirmed → shipped → delivered`, plus `cancelled`. A customer may cancel only while `pending`; an admin may cancel any time before `delivered`. Cancelling restores stock.
- **Popularity** — the sort metric for a product: total quantity of that product sold in Delivered orders.

## People

- **Customer** — a signed-in user who can shop. Order history, cart, wishlist, and reviews are keyed to the customer.
- **Admin** — a user whose `role` is `admin`, granted automatically at sign-up when their email matches the `ADMIN_EMAILS` allowlist. Administrators manage products, categories, orders, and reviews.

## Feedback

- **Review / Rating** — a 1–5 star rating with optional text a Customer leaves on a Product. One review per Product per Customer; editable. Auto-published.
- **Verified purchase** — a badge shown on a review when that customer has a Delivered order containing the reviewed product. Computed at read time, not stored.

## Money

- **Minor units** — all money is stored as integer poisha (৳1 = 100 poisha). No floating-point prices anywhere in the data model; the client only formats.