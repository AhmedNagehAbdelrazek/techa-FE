<!-- SPECKIT START -->

## Current Plan

**Feature**: Customer Order History & Detail
**Branch**: `009-customer-order-history`
**Plan file**: `specs/009-customer-order-history/plan.md`
**Spec file**: `specs/009-customer-order-history/spec.md`

### Key Artifacts

- [spec.md](specs/009-customer-order-history/spec.md) — Feature specification
- [plan.md](specs/009-customer-order-history/plan.md) — Implementation plan
- [research.md](specs/009-customer-order-history/research.md) — Research decisions
- [data-model.md](specs/009-customer-order-history/data-model.md) — Data model
- [quickstart.md](specs/009-customer-order-history/quickstart.md) — Setup guide
- [contracts/orders-api.md](specs/009-customer-order-history/contracts/orders-api.md) — API contracts

### Implementation Order

1. Enhance `src/lib/types/order.ts` — Add `OrdersListResponse`, `OrdersQueryParams`, `OrderListItem`, `Meta` types
2. Enhance `src/lib/api/orders.ts` — Update `getOrders()` to accept query params and return paginated response
3. Create `src/components/store/OrderStatusTabs.tsx` — Status filter tab bar (All, Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, Refunded)
4. Create `src/components/store/OrderCard.tsx` — Order list card with thumbnail, status badge, order number, date, total, item count
5. Enhance `src/app/(store)/orders/page.tsx` — Integrate tabs, cards, pagination, loading/empty/error states
6. Create `src/components/store/OrderStatusTimeline.tsx` — Vertical visual step tracker with hidden accessible `<ol>` list
7. Enhance `src/app/(store)/orders/[id]/page.tsx` — Replace basic timeline with OrderStatusTimeline, replace `confirm()` with shadcn AlertDialog, add review prompts for delivered items, add stale data detection via Page Visibility API
8. Verify: build passes with `npm run build`

### Critical Patterns (enforced)

- **No direct `request` calls in UI components**: All API access through `src/lib/api/*.ts` wrappers, consumed by UI components via direct async calls (no Zustand stores — local state only)
- **Auth guard**: All order pages use `<ProtectedRoute>` wrapper (existing pattern from `src/app/(store)/account/page.tsx`)
- **Existing API wrappers**: Extend `orders.ts` (getOrders, getOrder, cancelOrder) from Phase 8 rather than rewriting
- **Status badge colors**: pending=yellow, confirmed=blue, processing=indigo, shipped=cyan, delivered=green, cancelled=red, refunded=orange
- **Accessibility**: StatusTimeline includes a hidden `<ol>` for screen readers reading "Step N: [Status] — [date]"
- **Stale data**: Order detail re-fetches on tab focus if >30s stale, shows toast on status change

### Completed (Phase 7 & 8)

- Customer Cart: types, API wrappers, Zustand store with persist, CartAddButton, CartEmptyState, CartItemRow, CartOrderSummary, CartCouponInput, CartDrawer, cart page, header badge
- Customer Checkout: types, API wrappers, checkout page with address step + review step + place order, confirmation page with payment proof, order detail page skeleton, order list page skeleton

<!-- SPECKIT END -->
