# Quickstart: Customer Order History & Detail

## Prerequisites

- Branch: `009-customer-order-history`
- Phase 8 (Customer Checkout) fully implemented — provides `src/lib/types/order.ts`, `src/lib/api/orders.ts`, `src/lib/api/payments.ts`, order confirmation page
- Backend running with order endpoints (`GET /api/orders`, `GET /api/orders/:id`, `POST /api/orders/:id/cancel`)
- Authenticated user session

## Key Files

| File | Action |
|------|--------|
| `src/lib/types/order.ts` | ENHANCE — Add `OrdersListResponse`, `OrdersQueryParams`, `OrderListItem`, `Meta` types |
| `src/lib/api/orders.ts` | ENHANCE — Update `getOrders` to accept `OrdersQueryParams`, add paginated response type |
| `src/app/(store)/orders/page.tsx` | ENHANCE — Add status filter tabs (`OrderStatusTabs`), pagination, order card thumbnails, item count |
| `src/app/(store)/orders/[id]/page.tsx` | ENHANCE — Replace basic timeline with `OrderStatusTimeline`, replace `confirm()` with AlertDialog, add review prompts for delivered items, add stale data detection via Page Visibility API |
| `src/components/store/OrderCard.tsx` | CREATE — Order list card with thumbnail, status badge, order number, date, total, item count |
| `src/components/store/OrderStatusTimeline.tsx` | CREATE — Vertical visual step tracker with hidden accessible `<ol>` list |
| `src/components/store/OrderStatusTabs.tsx` | CREATE — Horizontal tab bar with All/Pending/Confirmed/Processing/Shipped/Delivered/Cancelled/Refunded |

## Implementation Order

1. **Types** (`src/lib/types/order.ts`) — Add `OrdersListResponse`, `OrdersQueryParams`, `OrderListItem`, `Meta`
2. **API** (`src/lib/api/orders.ts`) — Update `getOrders()` to accept query params and return paginated response
3. **OrderStatusTabs** (`src/components/store/OrderStatusTabs.tsx`) — Tab bar component with active state
4. **OrderCard** (`src/components/store/OrderCard.tsx`) — List card component with thumbnail, badge, details
5. **Order list page** (`src/app/(store)/orders/page.tsx`) — Integrate tabs, cards, pagination, loading/empty/error states
6. **OrderStatusTimeline** (`src/components/store/OrderStatusTimeline.tsx`) — Visual step tracker with accessibility
7. **Order detail page** (`src/app/(store)/orders/[id]/page.tsx`) — Integrate timeline, add AlertDialog cancel, review prompts, stale data detection

## Verification

```bash
git status                            # Only intended files changed
npm run lint                          # No lint errors
npm run build                         # No build errors
```

## Testing Commands

```bash
npm run test                          # Unit tests (Vitest)
npx playwright test                   # E2E tests (if order history E2E tests exist)
```

## Rollback

If the feature needs to be reverted:

```bash
git checkout main -- src/lib/types/order.ts
git checkout main -- src/lib/api/orders.ts
git checkout main -- src/components/store/OrderCard.tsx
git checkout main -- src/components/store/OrderStatusTimeline.tsx
git checkout main -- src/components/store/OrderStatusTabs.tsx
git checkout main -- src/app/\(store\)/orders/page.tsx
git checkout main -- src/app/\(store\)/orders/\[id\]/page.tsx
```
