# Product Scope

> Historical baseline. The MVP later moved to digital-first commerce. Use
> `docs/brain/current-state.md` for current scope.

## Product Vision

IOH is a boutique author-brand commerce experience for Samet Yurttas. The site should sell books, but it should not feel like a generic marketplace. It should feel like an entry point into a dark, cosmic, technology-driven literary universe.

The public site builds desire and trust. The admin side manages real commerce operations.

## Brand Direction

Core identity:

- Author: Samet Yurttas
- Brand/universe: IOH
- Tone: premium, dark, cosmic, technological, mysterious
- Base palette: black, deep night, ivory, metallic highlights

Book accents:

- CODE GOD: gold and yellow energy
- SYS GOD: blue and cyan energy
- CODE WAR: red and orange energy

## MVP Audience

Primary users:

- Readers who want to buy a physical book quickly.
- Fans who want signed or limited editions.
- Returning customers who want to track orders.
- The owner or small operations team managing products and shipments.

Secondary later users:

- Digital readers.
- Collectors using wallet or NFT features.
- Mobile app users.

## MVP Pages

### Public

- Home
- Books
- Book detail
- Cart
- Checkout
- Order confirmation
- Author/about
- Contact
- Legal pages

### Customer Account

- Sign in
- Profile
- Addresses
- Orders
- Order detail

### Admin

- Dashboard
- Products
- Product create/edit
- Variants and stock
- Orders
- Order detail
- Fulfillment update
- Content pages
- Media
- Audit log

## MVP Features

### Storefront

- IOH hero section.
- Featured books.
- Book listing.
- Book detail with cover, description, variants, price, stock, and shipping notes.
- Variant selection for standard, signed, limited, boxed, or preorder editions.
- Cart add, remove, quantity update, and order summary.
- Checkout with address, delivery summary, legal summary, and hosted payment start.

### Commerce

- Physical products.
- Product variants.
- Stock tracking.
- Basic stock validation before checkout.
- Draft or pending order before payment.
- Paid order only after backend payment verification.
- Shipment status and tracking code fields.

### Admin

- Create and edit products.
- Create and edit variants.
- Manage price, SKU, stock, status, and media.
- View and filter orders.
- Update fulfillment status.
- Add tracking code.
- Record important admin actions in audit logs.

### Content

- Editable home sections.
- Author/about content.
- Campaign or announcement blocks.
- Legal page placeholders.

## Future Features

### Digital Products

- Phase two supports ebook/private digital files through digital variants.
- Entitlements are created only after backend payment verification.
- Secure download URLs are generated per request with short-lived signed URLs.
- Customer digital library lives under `/account/downloads`.

### NFT-Ready

- Wallet linking.
- NFT gallery.
- Claim or allowlist preparation.
- Metadata storage.

No NFT mint sale, paid mint, or token payment should be enabled without legal approval.

### Mobile

- Expo app shell.
- Catalog, account, and order views.
- Web checkout handoff if needed.

## Out Of Scope

MVP does not include:

- Token or coin sale.
- Crypto payment.
- NFT mint sale.
- Native mobile app.
- Digital download delivery.
- Marketplace/vendor features.
- Multi-language support.
- Full ERP or accounting integration.
- Live payment credentials.
- Final legal advice or official legal text.

## Key User Flow

Reader flow:

1. User lands on the IOH home page.
2. User explores the books.
3. User opens a book detail page.
4. User selects a variant.
5. User adds the book to cart.
6. User reviews cart.
7. User enters checkout details.
8. User starts hosted iyzico payment.
9. Backend verifies payment.
10. User sees confirmation and can track the order.

Admin flow:

1. Admin signs in.
2. Admin creates or updates a product.
3. Admin creates variants and stock records.
4. Admin publishes the product.
5. Admin receives paid orders.
6. Admin prepares shipment.
7. Admin adds tracking and updates status.
8. System records critical actions in audit logs.

## Success Criteria

MVP is successful when:

- A visitor can understand the IOH universe and the three-book direction.
- A visitor can select a physical book variant and complete a sandbox checkout path.
- A paid order is represented only after backend verification.
- Admin can manage products, variants, inventory, and basic order fulfillment.
- The architecture leaves room for digital products and NFT-ready features without rebuilding the commerce core.

## Risks

- Overdesigning the public site can delay the commerce core.
- Underdesigning admin can create operational debt.
- Weak stock logic can oversell limited editions.
- Payment shortcuts can corrupt order state.
- Legal and consent placeholders must not be mistaken for final reviewed documents.
- NFT/token language must remain careful until legal review.

## Definition Of Done

Product scope is done when:

- MVP pages and features are listed.
- Future phases are separated from MVP.
- Out-of-scope items are explicit.
- Public, account, and admin flows are described.
- Success criteria and product risks are documented.
