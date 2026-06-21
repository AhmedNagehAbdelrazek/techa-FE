# Quickstart: Customer Notifications

## Prerequisites

- Feature branch: `011-customer-notifications`
- Backend API running with notifications endpoints
- Postman collection: `Techa Auth API.postman_collection.json` (includes notification examples)

## Files to Create

| Step | File | Purpose |
|------|------|---------|
| 1 | `src/lib/types/notification.ts` | TypeScript interfaces for Notification, NotificationsListResponse, NotificationsQueryParams, Meta |
| 2 | `src/lib/api/notifications.ts` | API wrapper: getNotifications, markAsRead, markAllAsRead |
| 3 | `src/components/store/NotificationBell.tsx` | Bell icon + unread badge (reads count from parent or fetches independently) |
| 4 | `src/components/store/NotificationDropdown.tsx` | Positioned panel showing 5 most recent notifications |
| 5 | `src/components/store/NotificationList.tsx` | Full paginated list for /notifications page |
| 6 | `src/app/(store)/notifications/page.tsx` | Dedicated notifications page with ProtectedRoute |
| 7 | Edit `src/components/layout/Header.tsx` | Add NotificationBell into header nav (near cart/wishlist) |

## Key API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/notifications?page=1&limit=20` | List notifications (meta includes `unread_count`) |
| PATCH | `/api/notifications/:id/read` | Mark single notification as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |

## Design Decisions

See `research.md` for full rationale. Key decisions:
- Custom positioned dropdown (not shadcn popover or dropdown-menu)
- Read `meta.unread_count` directly (don't derive from data array)
- Follow existing cart/wishlist badge pattern in header
- Direct `useState` + `useEffect` fetch pattern (no TanStack Query)
- Use existing LoadingState, ErrorState, EmptyState components

## Accessibility (WCAG 2.1 AA)

- `aria-label` on bell badge with dynamic count
- Keyboard nav: Enter/Space opens dropdown, Escape closes, arrow keys navigate
- Focus trap inside dropdown
- Screen reader announcements on count changes
- RTL-compatible positioning

## Verification

- Build: `npm run build`
- Lint: `npm run lint`
- Test: `npx vitest run` (if tests added)
