# Feature Specification: Layout, Navigation & Design System

**Feature Branch**: `002-layout-navigation-design`

**Created**: 2026-06-19

**Status**: Draft

**Input**: Phase 2 of the frontend spec — build the persistent shell for the storefront (header, footer, mobile nav) and the admin panel sidebar layout, with Zustand stores for cart count and public site settings.

## Clarifications

### Session 2026-06-19

- Q: Should Phase 2 include a wishlistStore with a count badge? → A: Yes, include wishlistStore now, fetching from GET /api/wishlist.

---

## User Scenarios & Testing

### User Story 1 — Storefront Header & Footer Shell (Priority: P1)

A visitor can navigate the store via header and footer on desktop and mobile.

**Why this priority**: The header and footer are the most visible navigation elements on every page. Without them, users cannot browse categories, search products, access their cart, or reach account pages. This is the foundation for all storefront interactions.

**Independent Test**: Navigate to the homepage. The header shows the logo, search bar, and cart icon. The footer shows site links and copyright. Clicking the logo returns to the homepage. The search bar accepts text input.

**Acceptance Scenarios**:

1. **Given** a visitor is on any storefront page, **When** they view the top of the page, **Then** they see a header containing: site logo (links to `/`), a search bar, cart icon with item count badge (shows 0 when empty), wishlist icon with item count badge (shows 0 when empty), and login/register buttons when unauthenticated.

2. **Given** an authenticated customer is on any storefront page, **When** they view the header, **Then** they see a user avatar dropdown with links to My Orders, My Account, and Logout instead of login/register buttons.

3. **Given** a visitor is on any storefront page, **When** they scroll to the bottom, **Then** they see a footer containing: site name and tagline, navigation links (About, Contact, FAQs, Privacy Policy, Terms), social media links, and a copyright notice.

4. **Given** a visitor clicks the cart icon in the header, **When** the cart has items, **Then** the badge shows the exact item count and updates immediately when items are added or removed.

---

### User Story 2 — Admin Panel Layout (Priority: P1)

An admin can navigate the admin panel via sidebar and top bar.

**Why this priority**: The admin panel cannot be used without navigation. The sidebar provides access to all management features. Admin auth must be verified on every admin page.

**Independent Test**: Log into the admin panel. The sidebar displays all management sections. Clicking each nav link navigates to the correct section. The sidebar shows the active section. The top bar shows the admin name and a logout button.

**Acceptance Scenarios**:

1. **Given** an authenticated admin loads any admin page, **When** the page renders, **Then** they see a sidebar with navigation links for: Dashboard, Products, Categories, Brands, Tags, Orders, Coupons, Banners, Delivery Zones, Settings, and Admins.

2. **Given** an unauthenticated user navigates to any `/admin` route, **When** the page loads, **Then** they are redirected to `/admin/login`.

3. **Given** an admin is on the admin panel, **When** they view the top bar, **Then** they see their name, role, and a logout button.

4. **Given** an admin clicks a sidebar navigation link, **When** the target page loads, **Then** the corresponding sidebar item is highlighted as active and breadcrumbs show the current path.

---

### User Story 3 — Mobile Navigation (Priority: P2)

A visitor on a mobile device can navigate the storefront via a hamburger menu.

**Why this priority**: Mobile users represent a significant portion of traffic. Desktop-first navigation (search bar, all links visible) does not fit small screens. The hamburger menu with full-screen overlay ensures mobile users have equal access to navigation.

**Independent Test**: Resize the browser to 375px width. The header shows a hamburger icon instead of full navigation. Tapping it opens a full-screen overlay with all nav links. Tapping a link navigates and closes the overlay.

**Acceptance Scenarios**:

1. **Given** a visitor is on a screen narrower than 768px, **When** they view the header, **Then** they see a hamburger menu icon where the desktop nav links would be.

2. **Given** a visitor taps the hamburger icon, **When** the overlay opens, **Then** it covers the full screen and displays: navigation links, search input, and auth state (login/register or user menu).

3. **Given** a visitor has the mobile overlay open, **When** they tap a navigation link, **Then** the overlay closes and they are taken to the target page.

4. **Given** a visitor has the mobile overlay open, **When** they tap outside the menu or the close button, **Then** the overlay closes.

---

### Edge Cases

- What happens when the cart API is unreachable on page load? The cart badge should show 0 gracefully without breaking the header.
- What happens when the settings API is unreachable on app boot? The header/footer should render with sensible defaults (site name as fallback text, no logo, minimal footer).
- What happens when an admin session expires while on an admin page? The user should be redirected to `/admin/login` without a broken layout.
- How does the header respond when there are 3-digit+ cart counts (e.g., 100+)? The badge should truncate to "99+" beyond 99 items.
- How does the mobile nav behave during a slow network transition? The overlay should remain open until the next page starts loading.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a storefront header on all public and customer pages containing: site logo (links to `/`), search bar, cart icon with reactive item count badge, wishlist icon with reactive item count badge, and auth-state-aware user controls.

- **FR-002**: System MUST display a storefront footer on all public and customer pages containing: site name/tagline, navigation links (About, Contact, FAQs, Privacy Policy, Terms), social media links, and copyright notice.

- **FR-003**: System MUST display an admin panel sidebar on all admin pages containing navigation links for: Dashboard, Products, Categories, Brands, Tags, Orders, Coupons, Banners, Delivery Zones, Settings, Admins.

- **FR-004**: System MUST display an admin top bar showing the current admin's name, role, and a logout button.

- **FR-005**: System MUST redirect unauthenticated users to `/admin/login` when they attempt to access any `/admin` route.

- **FR-006**: System MUST display the cart badge count reactively — updating immediately when items are added or removed from any page.

- **FR-007**: System MUST fetch public site settings (site name, logo URL, social links, currency code) once at application boot and make them available to all components.

- **FR-008**: System MUST show a hamburger menu on screens narrower than 768px that opens a full-screen overlay with all navigation links and search.

- **FR-009**: System MUST display breadcrumbs in the admin content area showing the current page path.

- **FR-010**: On mobile, system MUST collapse the sidebar into a collapsible drawer accessible via a menu button in the top bar.

- **FR-011**: System MUST use a reactive cart item count store that is updated by API interactions and persists for the session.

- **FR-013**: System MUST include a wishlist item count store (wishlistStore) that fetches the count from `GET /api/wishlist` at boot and after any wishlist mutation (add/remove), updating the header badge reactively.

- **FR-012**: System MUST gracefully handle failures of the settings and cart data APIs at boot — using sensible defaults rather than showing errors.

### Key Entities

- **Site Settings**: Public configuration loaded at app boot — includes site name, logo URL, currency code, social media URLs, support contact. Used by header and footer for dynamic content.

- **Cart Summary**: Minimal cart state stored client-side — tracks item count for the header badge. Full cart data is loaded later in the checkout flow.

- **Wishlist Summary**: Minimal wishlist state stored client-side — tracks item count for the header badge (fetched from `GET /api/wishlist` at boot and after mutations). Full wishlist data is loaded later.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A first-time visitor can navigate from the homepage to any section (search, cart, account) using the header in under 3 seconds.

- **SC-002**: An admin can navigate between any two admin sections in under 2 clicks using the sidebar.

- **SC-003**: Mobile users can open the navigation menu, tap a link, and reach the target page in under 3 seconds on a 3G connection.

- **SC-004**: The header and footer render within the first paint of any page — no visible layout shift after page load.

- **SC-005**: 100% of admin panel navigation links resolve to the correct management section without 404 errors.

- **SC-006**: Cart badge count updates in under 500ms after an item is added or removed from any page.

## Assumptions

- Public settings are available via a `GET /api/settings/public` endpoint returning site name, logo URL, social links, and currency code (referenced in frontend-spec.md Phase 2).

- The project already has a logo file; if not, the site name text will be used as a placeholder.

- Admin auth uses the same `access_token` httpOnly cookie pattern as customer auth, with a role-based check (admin role required).

- The admin panel uses an existing `/api/admin/auth/me` endpoint (from Postman collection) to verify admin identity and session validity.

- Social links (Facebook, Twitter, Instagram, etc.) are configured in the backend settings and fetched via the public settings endpoint.

- Breadcrumb data is derived from the route path and nav hierarchy — no dedicated breadcrumb API is needed.

- The cart count can be derived from a lightweight `GET /api/cart/count` or from the full cart response; the frontend will use whichever yields a faster initial badge display.
