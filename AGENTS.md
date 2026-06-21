<!-- SPECKIT START -->

## Pre-Flight Checklist (MANDATORY — run before EVERY code decision)

Before writing any code, answering any task, or making any decision — run this checklist in order. Stop at the first rule that applies and act on it. Do not continue down the list.

```
1. Does this need to exist?       → If no clear requirement drives it, skip it entirely. (YAGNI)
2. Does the stdlib do it?         → Use it. No import needed.
3. Is it a native platform API?   → Use it. (Node built-ins, browser APIs, Next.js built-ins)
4. Is it an installed dependency? → Use it. Check package.json first.
5. Can it be written in one line? → Write one line.
6. Only then: write the minimum code that makes it work. Nothing more.
```

This checklist is not optional and is not a suggestion. It runs before every function, every file, every component, every utility. If you catch yourself about to write something without having run this checklist first, stop and run it now.

### What this looks like in practice

| Situation | Wrong | Right |
|---|---|---|
| Need to capitalize a string | Install `lodash` | `str[0].toUpperCase() + str.slice(1)` |
| Need to generate a UUID | Write a UUID function | `crypto.randomUUID()` (Node 14.17+) |
| Need to check if array is empty | `_.isEmpty(arr)` | `arr.length === 0` |
| Need to deep clone an object | Write a recursive clone | `structuredClone(obj)` (Node 17+) |
| Need to parse a URL | Install `url-parse` | `new URL(str)` |
| Need to format a date | Install `moment` | `new Intl.DateTimeFormat(...)` or `date.toLocaleDateString()` |
| Need to sleep/delay | Write a sleep utility | `await new Promise(r => setTimeout(r, ms))` |
| Need to flatten an array one level | Write a reduce | `arr.flat()` |
| Need to get unique values | Write a filter loop | `[...new Set(arr)]` |
| Need to read an env variable | Abstract it into a helper | `process.env.VAR_NAME` |

### The only valid reasons to add a new dependency

- The task is genuinely complex and the library solves a hard, well-defined problem (e.g. parsing multipart form data, JWT signing, bcrypt hashing)
- The library is already in `package.json` — it costs nothing to use it
- Writing it from scratch would take more than 20 lines and is not core business logic

If none of these apply, do not add the dependency. Ask first.

## Current Plan

**Feature**: Customer Notifications
**Branch**: `011-customer-notifications`
**Plan file**: `specs/011-customer-notifications/plan.md`
**Spec file**: `specs/011-customer-notifications/spec.md`

### Key Artifacts

- [spec.md](specs/011-customer-notifications/spec.md) — Feature specification
- [plan.md](specs/011-customer-notifications/plan.md) — Implementation plan
- [research.md](specs/011-customer-notifications/research.md) — Research decisions
- [data-model.md](specs/011-customer-notifications/data-model.md) — Data model
- [quickstart.md](specs/011-customer-notifications/quickstart.md) — Setup guide
- [contracts/notifications-api.md](specs/011-customer-notifications/contracts/notifications-api.md) — API contracts

### Implementation Order

1. Create `src/lib/types/notification.ts` — Add `Notification`, `NotificationsListResponse`, `NotificationsQueryParams`, `Meta` types (with `unread_count`)
2. Create `src/lib/api/notifications.ts` — Add `getNotifications()`, `markAsRead()`, `markAllAsRead()` API wrappers
3. Create `src/components/store/NotificationBell.tsx` — Bell icon with unread count badge (follows cart/wishlist badge pattern)
4. Create `src/components/store/NotificationDropdown.tsx` — Custom positioned dropdown panel showing 5 most recent notifications (not shadcn DropdownMenu — rich card-like items)
5. Create `src/components/store/NotificationList.tsx` — Full paginated list component for /notifications page
6. Create `src/app/(store)/notifications/page.tsx` — Notifications page with ProtectedRoute, pagination, empty/error/loading states
7. Update `src/components/layout/Header.tsx` — Integrate NotificationBell into header nav
8. Verify: build passes with `npm run build`

### Critical Patterns (enforced)

- **No direct `request` calls in UI components**: All API access through `src/lib/api/notifications.ts`, consumed by components via async `useState`/`useEffect` pattern (no TanStack Query for this feature — too simple)
- **Auth guard**: All notification pages use `<ProtectedRoute>` wrapper
- **Unread count**: Read from `meta.unread_count` (confirmed in Postman collection response — not derived from `data` array)
- **Accessibility**: WCAG 2.1 Level AA — aria-labels, keyboard nav, focus management, screen reader announcements for unread count, RTL-compatible positioning
- **Badge display**: Follow existing pattern: `{count > 99 ? "99+" : count}` with `<Badge variant="secondary">`
- **Notifications dropdown**: Custom positioned panel (div + click-outside handler), not Popover or DropdownMenu. Rich content: title, message preview, relative timestamp, read/unread indicator
- **Error logging**: Console error on background fetches; console error + sonner toast on user-initiated actions (mark read, mark all read)
- **Stale data**: Notifications re-fetched on page load/navigation only (real-time updates deferred)

### Completed (Phases 7-10, from prior features)

- Customer Cart, Checkout, Order History, and prior features completed.

<!-- SPECKIT END -->
