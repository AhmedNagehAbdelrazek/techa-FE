# Research: Customer Order History & Detail

## Decisions

### Enhance, Don't Rewrite

**Decision**: The existing order list and detail pages from Phase 8 (checkout scaffolding) are enhanced rather than rewritten. The list page gets pagination, status filter tabs, thumbnails, and item counts. The detail page gets a proper visual timeline, review prompts, AlertDialog cancel, and stale data detection.

**Rationale**: The scaffolding already works — it fetches and displays orders. Rewriting would duplicate effort and risk regression. The enhancements map directly to spec requirements (FR-001 through FR-018).

### Pagination: Page-Based with Status Query Params

**Decision**: Use standard page-based pagination (page number + limit). Status filter is passed as a query parameter to the API (`GET /api/orders?status=pending&page=1&limit=20`). Pagination state and active filter live in local `useState`.

**Rationale**: Page-based matches the existing API response structure (`meta: { page, limit, total, totalPages }`). URL-based filters were considered but rejected because the Phase 8 API wrapper doesn't use URL-based state for this page — local state is simpler and consistent with the existing pattern.

**Alternatives considered**:
- URL query params for filter state: More shareable but adds complexity for a single-page feature
- Infinite scroll: API doesn't support cursor-based pagination

### Status Filter: Tab-Style with All Default

**Decision**: A horizontal tab bar with 8 options: All, Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, Refunded. "All" is selected by default. Active tab is visually highlighted. Changing tabs re-fetches the order list.

**Rationale**: Per spec clarification (Clarifications Q1). Tabs map directly to API status values. No multi-select needed — orders have exactly one status.

### Status Timeline: Vertical Stepper with Hidden Accessible List

**Decision**: The visual step tracker is a vertical list with colored dots and connecting lines. Each step shows the status name and date. A visually hidden `<ol>` provides screen reader text: "Step N: [Status] — [date]". The current status is highlighted with the primary color; future steps are grayed out.

**Rationale**: Per spec clarification (Q3 — accessibility). Vertical stepper is the most readable on mobile. The hidden ordered list ensures WCAG compliance without visual clutter.

**Alternatives considered**:
- Horizontal stepper: Doesn't fit well on mobile (375px)
- Single status badge only: Loses historical context

### AlertDialog for Cancel Confirmation

**Decision**: Use Radix UI's `AlertDialog` (via shadcn `ui/alert-dialog`) for the cancel confirmation dialog. It matches the pattern specified in Phase 9 constraints of `frontend-spec.md`.

**Rationale**: Already available in the project (shadcn/ui includes AlertDialog). Provides proper focus trapping, keyboard escape, and ARIA attributes. Better UX than `window.confirm()`.

### Review Prompt: Navigate to Product Page

**Decision**: When a customer clicks "Write a Review" on a delivered item, navigate to the product detail page with the review section auto-opened and `order_item_id` passed as a query parameter.

**Rationale**: Per spec clarification (Q2). The product page already has a review section (Phase 6). Pre-filling `order_item_id` ensures the review is linked to the verified purchase.

### Stale Data Detection: Tab Visibility Toast

**Decision**: Use the Page Visibility API (`visibilitychange` event) to detect when a user returns to the order detail tab. If the order status was fetched more than 30 seconds ago, silently re-fetch and show a toast if the status changed.

**Rationale**: Per spec clarification (Q4). Polling or WebSockets would be over-engineered. Tab-visibility detection is lightweight and user-friendly — the toast gives context for the UI update.

### No New Dependencies

**Decision**: All components use existing shadcn/ui primitives: `button`, `badge`, `skeleton`, `separator`, `alert-dialog`, `input`, `label`. No new packages needed.

**Rationale**: Confirmed against `package.json` — all primitives are available.

### API Extensions Needed

**Decision**: The existing `getOrders()` function and `Order` type need minor enhancements:

- `getOrders()` needs to accept `params?: { status?: string; page?: number; limit?: number }` and return the full `OrdersListResponse` with `data` + `meta`
- The `Order` list type (`data[]`) needs `item_count` and `first_item_thumbnail` fields for the order card display
- A new `OrdersListResponse` type with `meta` (page, limit, total, totalPages)

**Rationale**: The existing wrappers were created in Phase 8 for checkout (single order detail and cancel). Phase 9 needs list-level pagination and filtering capabilities.

### Status Badge Colors

**Decision**: Status badges follow a consistent color scheme matching the Phase 9 spec:

| Status | Color |
|--------|-------|
| Pending | Yellow |
| Confirmed | Blue |
| Processing | Indigo |
| Shipped | Cyan |
| Delivered | Green |
| Cancelled | Red |
| Refunded | Orange |

**Rationale**: Uses Tailwind color classes as specified in `frontend-spec.md` Phase 9 constraints.
