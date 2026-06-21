# Feature Specification: Admin Dashboard

**Feature Branch**: `013-admin-dashboard`

**Created**: 2026-06-21

**Status**: Draft

**Input**: User description: "start phase 13 from the file frontend-spec.md and use the endpoint refrence from Techa Auth API.postman_collection.json"

## Clarifications

### Session 2026-06-21

- Q: Should the "Pending Orders" metric card show `by_status.pending` or `pending_payments` from the stats endpoint? → A: `by_status.pending` — consistent with the card's link to `/admin/orders?status=pending`

## User Scenarios & Testing

### User Story 1 — View Dashboard Metrics at a Glance (Priority: P1)

An admin logs into the admin panel and lands on `/admin`. They see a row of metric cards showing key business numbers: total orders, total revenue, new customers, and pending orders. Each card shows the current figure and a percentage change vs the previous period.

**Why this priority**: The dashboard is the admin landing page; metrics at a glance are the primary purpose. Without them, the page serves no value.

**Independent Test**: Can be fully tested by navigating to `/admin` after logging in as an admin. The four metric cards render with numeric values and no error states.

**Acceptance Scenarios**:

1. **Given** the admin is authenticated and navigates to `/admin`, **When** the page loads, **Then** four metric cards are displayed: Total Orders, Total Revenue, New Customers, Pending Orders
2. **Given** the order stats API returns data, **When** the metrics render, **Then** each card shows a numeric value and a percentage change indicator
3. **Given** the page is loading data, **When** the user first lands on `/admin`, **Then** skeleton loaders are shown for all metric cards
4. **Given** the API returns an error, **When** the page attempts to load metrics, **Then** an error state with a retry mechanism is displayed

---

### User Story 2 — Visualize Order Distribution (Priority: P2)

An admin sees a donut chart breaking down orders by their current status (pending, confirmed, processing, shipped, delivered, cancelled, refunded). This helps them quickly understand the order pipeline balance.

**Why this priority**: Charts add significant analytical value over raw numbers. The donut chart uses data from the same stats endpoint already fetched for metric cards.

**Independent Test**: Can be tested independently by checking that the donut chart renders with segments matching the `by_status` response from the stats endpoint.

**Acceptance Scenarios**:

1. **Given** the stats API returns `by_status` data, **When** the page renders, **Then** a donut chart shows each order status as a colored segment
2. **Given** a status has zero orders, **When** the chart renders, **That** status segment is either omitted or shown as a zero-width segment
3. **Given** the stats data is loading, **When** the chart area renders, **Then** a skeleton placeholder is shown

---

### User Story 3 — Review Recent Orders (Priority: P3)

An admin sees a table of the 5 most recent orders below the charts. Each row shows the order number, customer name, total, status badge, date, and a "View" button linking to the order detail page.

**Why this priority**: The recent orders table provides actionable context to the metrics above. It is a secondary feature but useful for daily workflows.

**Independent Test**: Can be tested independently by verifying the table renders 5 rows matching the response from the orders endpoint with `limit=5&sort=newest`.

**Acceptance Scenarios**:

1. **Given** the orders API returns recent orders, **When** the table renders, **Then** each row shows order number, customer name, total, status badge, date, and a "View" link
2. **Given** there are fewer than 5 orders, **When** the table renders, **Then** only the available orders are shown (no empty filler rows)
3. **Given** the page is loading, **When** the table area renders, **Then** skeleton rows are shown
4. **Given** the API returns an error, **When** the table area renders, **Then** an error state with retry is displayed

---

### Edge Cases

- **Empty store**: If no orders exist, metric cards show zero values, the donut chart shows a single "No orders" state, and the recent orders table shows an empty state message
- **Loading failure**: If the stats API succeeds but orders API fails (or vice versa), each section handles errors independently — a failed chart does not block the metric cards
- **Very large numbers**: Metric card values over 9999 are formatted with abbreviations (e.g., 12.5K, 1.2M) to prevent layout breakage

## Requirements

### Functional Requirements

- **FR-001**: Admin dashboard MUST load as the landing page at `/admin` when the admin is authenticated and visits the admin root
- **FR-002**: System MUST fetch dashboard metrics from `GET /api/admin/orders/stats` on page load, passing a `period` query parameter the user can switch between (`7d`, `30d`, `90d`, `this_month`, `last_month`)
- **FR-003**: System MUST fetch recent orders from `GET /api/admin/orders?limit=5&sort=newest` on page load
- **FR-004**: Metric cards MUST display: Total Orders, Total Revenue, New Customers, and Pending Orders (`by_status.pending`) — each with the current value, the previous period value, and a percentage change indicator
- **FR-005**: Metric cards MUST include a period selector (e.g., tab buttons or dropdown) to switch between `7d`, `30d`, `90d`, `this_month`, `last_month`. Changing the period re-fetches the stats endpoint with the new `period` param and updates all cards
- **FR-006**: System MUST display a donut chart showing order distribution by status using the `by_status` field from the stats endpoint
- **FR-007**: System MUST display a recent orders table with columns: order number, customer name, total, status, date, and a "View" action linking to `/admin/orders/:id`
- **FR-008**: All data sections (metrics, charts, table) MUST show loading skeletons while fetching data
- **FR-009**: Failed data fetches MUST show an error state with a retry button, scoped per section
- **FR-010**: The Pending Orders metric card MUST link to `/admin/orders?status=pending`
- **FR-011**: The dashboard MUST be accessible only to authenticated admin users; unauthenticated users are redirected to `/admin/login`

### Key Entities

- **Dashboard Metric**: Aggregated business figure (total orders, total revenue, new customers, pending orders, orders by status) derived from the orders statistics endpoint
- **Recent Order**: A lightweight order representation (order number, customer, total, status, date) for the recent orders table, sourced from the orders list endpoint with `limit=5`

## Success Criteria

### Measurable Outcomes

- **SC-001**: Admin dashboard fully renders with all sections within 3 seconds on a typical broadband connection
- **SC-002**: All data sections gracefully handle API errors independently — a failure in one section does not block the others
- **SC-003**: The dashboard is navigable and readable via keyboard alone (Tab, Enter, arrow keys) without focus traps
- **SC-004**: Metric card values are formatted for readability with thousands separators and abbreviation for large numbers

## Assumptions

- The admin layout (`AdminSidebar`, `AdminTopBar`, `Breadcrumbs`) is already in place from Phase 2; only the dashboard page content is created in this phase
- `recharts` is already available in the project; no new charting library is required
- The stats endpoint (`GET /api/admin/orders/stats`) returns all data needed for metrics and the donut chart; data for a revenue-over-time line chart or top-5-products bar chart is not currently available from this endpoint and is excluded from scope
- No authentication/login page is built in this phase — the admin login is assumed to exist from prior phases
- The stats endpoint (`GET /api/admin/orders/stats`) accepts a `?period=7d|30d|90d|this_month|last_month` query param and returns `total_orders`, `total_revenue`, `new_customers`, `pending_orders`, each with `current`, `previous`, and `change_pct` fields, plus `by_status` and `pending_payments`
