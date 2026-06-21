# Feature Specification: Customer Notifications

**Feature Branch**: `011-customer-notifications`

**Created**: 2026-06-20

**Status**: Draft

**Input**: Phase 11 from frontend-spec.md

## Clarifications

### Session 2026-06-21

- Q: Pagination page size — how many notifications per page on `/notifications`? → A: 20 per page.
- Q: What level of accessibility is required for the notification components? → A: WCAG 2.1 Level AA.
- Q: What's the expected maximum number of notifications a customer could accumulate? → A: Hundreds (< 1000).
- Q: What should the bell icon display if the initial unread count API call fails? → A: Show bell with "0" badge.
- Q: Should notification API errors be logged/monitored for debugging? → A: Console log + toast on user-initiated actions; silent on background fetches.
- Q: Does the notifications endpoint include `unread_count` in its `meta` response? → A: Yes — confirmed from Postman collection response body (`"unread_count": 5` in `meta`). The frontend should read `meta.unread_count` directly instead of deriving from `data`.

---

## User Scenarios & Testing

### User Story 1 — View Notifications from Header (Priority: P1)

Customers can see a notification bell icon in the header with an unread count badge, and view their 5 most recent notifications in a dropdown panel.

**Why this priority**: The notification bell is the primary entry point for customers to discover new notifications. Without it, customers have no way of knowing they have unread notifications.

**Independent Test**: An authenticated customer with one unread notification sees the bell icon with a "1" badge. Clicking the bell opens a dropdown showing the notification. Opening the dropdown marks the notification as read (badge updates to 0).

**Acceptance Scenarios**:

1. **Given** an authenticated customer has unread notifications, **When** they look at the header, **Then** they see a bell icon with a badge showing the unread count.
2. **Given** an authenticated customer clicks the bell icon, **When** the dropdown opens, **Then** they see up to 5 most recent notifications, each showing the title, message preview, and relative time.
3. **Given** a customer clicks a notification in the dropdown that has a link, **When** the notification opens, **Then** they are taken to the linked page after the notification is marked as read.
4. **Given** a customer views the dropdown, **When** they click "View all", **Then** they navigate to the `/notifications` page.
5. **Given** an unauthenticated customer, **When** they view the page, **Then** the notification bell is not displayed.

---

### User Story 2 — Full Notifications List Page (Priority: P2)

Customers can view all their notifications on a dedicated page, mark individual notifications as read, and mark all as read at once.

**Why this priority**: The dropdown only shows recent notifications. A full page is needed for browsing history and managing all notifications.

**Independent Test**: An authenticated customer visits `/notifications`, sees a paginated list of all notifications. They click one with a link and are navigated to the target. They click "Mark all as read" and all notifications show as read with the badge updating to zero.

**Acceptance Scenarios**:

1. **Given** an authenticated customer visits `/notifications`, **When** the page loads, **Then** they see a paginated list of notifications showing title, message, relative time, and read/unread indicator.
2. **Given** a customer clicks a notification that has a link, **When** the notification is opened, **Then** it is marked as read and the customer is navigated to the linked page.
3. **Given** a customer views the notifications page, **When** they click "Mark all as read", **Then** all notifications display as read, the unread badge in the header updates to 0, and a success message is shown.
4. **Given** a customer has no notifications, **When** they visit `/notifications`, **Then** they see an empty state with a message that they have no notifications yet.

---

### Edge Cases

- What happens when the notifications API returns an error? The bell icon still shows but the dropdown shows an error message; the notifications page shows an error state with a retry button.
- What happens when there are more than 99 unread notifications? The badge shows "99+" to avoid layout issues.
- What happens when the user is on the notifications page and a new notification arrives? Only updated on next page load or manual refresh (real-time updates deferred).
- What happens when the customer clicks a notification without a link? It is marked as read and the dropdown/page stays open — no navigation occurs.
- What happens on the notifications page when there are more notifications than the page limit? Pagination controls appear at the bottom.
- What happens when the initial unread count fetch fails on page load? The bell icon still shows with a badge of "0". The count retries on next navigation or manual refresh.
- What is the error logging policy? API failures on user-initiated actions (mark as read, mark all as read) show a toast error and log to console. Background fetch failures (initial count poll, page load) are logged to console only — no user-facing notification.

## Requirements

### Functional Requirements

- **FR-001**: The header MUST display a notification bell icon with an unread count badge when the customer is authenticated.
- **FR-002**: The notification bell icon MUST NOT be displayed when the customer is not authenticated.
- **FR-003**: Clicking the bell icon MUST open a dropdown panel showing up to the 5 most recent notifications.
- **FR-004**: Each notification in the dropdown MUST show the title, a preview of the message, and a relative timestamp.
- **FR-005**: The dropdown MUST include a "View all" link that navigates to `/notifications`.
- **FR-006**: Clicking a notification that has a link MUST mark it as read and navigate to the linked page.
- **FR-007**: Clicking a notification without a link MUST mark it as read without navigation.
- **FR-008**: The unread count badge MUST update reactively when notifications are read (individually or all).
- **FR-009**: Customers MUST be able to view all notifications on a dedicated `/notifications` page with pagination.
- **FR-010**: The notifications page MUST display each notification with its title, message, timestamp, and read/unread status.
- **FR-011**: Customers MUST be able to mark all notifications as read with a single "Mark all as read" action.
- **FR-012**: The `/notifications` page MUST show a meaningful empty state when the customer has no notifications.
- **FR-013**: The `/notifications` page MUST redirect unauthenticated users to the login page via the existing ProtectedRoute pattern.
- **FR-014**: The unread count MUST be fetched on app load when the customer is authenticated and after any notification mutation.
- **FR-015**: All notification UI components MUST meet WCAG 2.1 Level AA standards — including aria labels on the bell badge for unread count, keyboard-accessible dropdown (Enter/Space to open, Escape to close, arrow key navigation), visible focus indicators, screen reader announcements when unread count changes, and color contrast compliance for badge and read/unread indicators.

### Key Entities

- **Notification**: Represents a message sent to a customer. Contains an id, type (system, order_confirmed, order_shipped, etc.), title, message, optional link URL, read status, and creation timestamp. The `id` identifies a specific notification. The `is_read` boolean tracks whether the customer has viewed it. The optional `link` URL lets the notification navigate to a relevant page when clicked.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Customers can discover their unread notification count immediately upon any authenticated page load — the badge reflects the server count within 2 seconds.
- **SC-002**: Customers can open the notification dropdown within 1 click and view the 5 most recent notifications without a page navigation.
- **SC-003**: Customers can mark all notifications as read in a single action and see the badge update to zero within 1 second.
- **SC-004**: The full notifications page loads and displays all notifications within 2 seconds on a standard connection.

## Assumptions

- The notifications API returns notification data with `is_read` status, `title`, `message`, optional `link`, and timestamps. The `meta.total` field in the paginated response gives the total count of all notifications (not unread-only).
- The API paginates notifications with a default page size of 20 items per page. The frontend sends `?per_page=20` (or the API's default if the frontend omits the param) and uses `meta` to render pagination controls.
- For the unread count, the frontend reads `meta.unread_count` from the paginated notifications list response. The API returns this field directly — no derivation from `data` is needed.
- Notification types include "system" for admin-created and broadcast messages, plus order-related types (e.g., `order_confirmed`, `order_shipped`, `order_delivered`) generated by the backend. The frontend treats all types equally — rendering the title and message.
- Customers are expected to accumulate at most a few hundred notifications (< 1000) over their account lifetime. The "99+" badge ceiling is adequate; simple client-side pagination (20 per page) is sufficient without virtual scrolling.
- The notification bell and dropdown live in the existing storefront header (`src/components/layout/Header.tsx`). The dropdown renders as a positioned panel (not a modal) anchored to the bell icon.
- Real-time notification updates via WebSocket/Socket.IO are deferred to a later phase. The customer must refresh or navigate to see new notifications.
- All notification API calls use the existing `Request.ts` class-based client with JWT auth injection.
