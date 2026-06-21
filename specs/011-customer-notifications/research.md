# Research: Customer Notifications

## Decision: Notification Dropdown Component

**Decision**: Build a custom positioned panel (div with absolute positioning + click-outside handling) rather than using shadcn DropdownMenu or installing Popover.

**Rationale**: 
- DropdownMenu is designed for menu-item lists (text + icons), not rich card-like notification items with title, message preview, timestamp, and read/unread indicator.
- shadcn Popover is not installed — installing it via CLI would add a dependency for a single use case.
- A custom panel is ~50 lines, uses existing patterns, and gives full control over RTL positioning, keyboard accessibility, and WCAG 2.1 AA compliance.

**Alternatives considered**:
- DropdownMenu: too constrained for rich content; would need significant CSS overrides.
- Popover (shadcn): would need `npx shadcn@latest add popover` — unnecessary dependency.
- Sheet (drawer): wrong UX pattern for a lightweight dropdown.

## Decision: Unread Count Strategy

**Decision**: Read `meta.unread_count` from the paginated notifications list response directly.

**Rationale**: Postman collection confirms `"unread_count": 5` is returned in the `meta` object of `GET /api/notifications?page=1&limit=20`. No need to derive from `data` array. This is simpler, more accurate, and avoids edge cases where all items on page 1 are already read.

**Alternatives considered**:
- Derive from `data` array's `is_read` fields: more complex, inaccurate for pages beyond 1, extra computation.
- Dedicated unread-count endpoint: doesn't exist yet; can adopt later as optimization.

## Decision: Bell Badge Display Pattern

**Decision**: Follow existing cart/wishlist badge pattern exactly.

**Rationale**:
- Existing pattern in `Header.tsx`: `{itemCount > 0 && <Badge variant="secondary">...</Badge>}` with `{itemCount > 99 ? "99+" : itemCount}`.
- Consistent UX — customers already familiar with this pattern for cart and wishlist.
- Bell icon uses `lucide-react` `Bell` component.

## Decision: API Call Approach

**Decision**: Use direct `useState`/`useCallback`/`useEffect` pattern (no TanStack React Query for this feature).

**Rationale**:
- The existing orders page (`src/app/(store)/orders/page.tsx`) uses this pattern successfully.
- Notifications have minimal mutation patterns (mark read, mark all read) — no complex caching or invalidation needs.
- TanStack Query would add boilerplate for little benefit given the simple CRUD surface.
- Exception: If the dropdown needs frequent polling, TanStack Query's `refetchInterval` could be used — but spec defers real-time updates.

**Alternatives considered**:
- TanStack React Query: overkill for 3 endpoints with no caching dependencies.
- Zustand store: unnecessary global state; notifications are page-local data.

## Decision: Notification Type Handling

**Decision**: Frontend treats all notification types equally — renders `title` and `message` from the API response. No type-specific icons or formatting.

**Rationale**: Spec explicitly states "The frontend treats all types equally — rendering the title and message." (Assumptions section). Types include "system", "order_placed", "order_confirmed", "order_shipped", "order_delivered".

## Decision: Empty/Loading/Error States

**Decision**: Use existing `LoadingState`, `ErrorState`, `EmptyState` from `src/components/ui/`. 

**Rationale**: These components already exist and are used in other store pages. Consistent UX.

## Decision: RTL & Accessibility

**Decision**: All new components follow existing RTL patterns (Arabic-first) and WCAG 2.1 Level AA per FR-015.

**Specifics**:
- Bell badge uses `aria-label` for screen readers (e.g., "3 unread notifications").
- Dropdown uses `role="dialog"` or `role="menu"` with `aria-labelledby`.
- Escape closes dropdown; focus traps within dropdown.
- Relative timestamps use `Intl.RelativeTimeFormat` for Arabic locale.
- Keyboard navigation: Enter/Space to open, arrow keys to navigate, Enter to select, Escape to close.
- Color contrast: Badge meets AA contrast ratio against header background.
