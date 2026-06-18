# Marketplace Frontend — Spec-Driven Development Document

> **Stack:** Next.js (App Router) · shadcn/ui · Zustand · Tailwind CSS
> **API:** REST calls to the Express backend documented in `backend-spec.md`
> **Auth:** JWT stored in an `httpOnly` cookie or `localStorage` — **ask which the project uses before starting Phase 1**
> **What this document covers:** Every page, component, and state slice needed for both the customer-facing storefront and the admin panel.
> **How to read this document:** Each phase is one focused feature. Read the entire spec before writing any code. If anything is ambiguous or unspecified, **stop and ask a clarifying question** before proceeding. Do not assume.

---

## Project Context

Single-vendor marketplace. Two surfaces: a **storefront** (public + authenticated customers) and an **admin panel** (admin-only, separate layout). Both live in the same Next.js app under different route groups: `(store)` and `(admin)`.

shadcn/ui is already installed. Zustand is used for global client state. Server-side data fetching uses Next.js Server Components where possible; client interactivity uses React hooks and Zustand slices.

---

## Folder Structure Convention

```
app/
  (store)/          ← customer-facing pages
  (admin)/          ← admin panel pages
  api/              ← Next.js route handlers if needed (e.g. for cookie auth)
components/
  ui/               ← shadcn primitives (auto-generated, do not edit)
  store/            ← storefront-specific components
  admin/            ← admin panel components
  shared/           ← shared across both surfaces
lib/
  api/              ← typed fetch wrappers per domain (auth.ts, products.ts, etc.)
  stores/           ← Zustand slices
  utils/            ← helpers (formatPrice, formatDate, slugify, etc.)
  types/            ← TypeScript interfaces matching the backend schema
```

> If the project uses a different folder structure, **ask before creating any files**.

---

## Phase 1 — Foundation & Auth (Customer)

### Goal
Set up the API client layer, Zustand auth store, and all customer authentication pages.

### Scope

**API layer (`lib/api/auth.ts`)**
- `register(data)` → POST `/api/auth/register`
- `verifyEmail(code)` → POST `/api/auth/verify-email`
- `resendVerification(email)` → POST `/api/auth/resend-verification`
- `login(email, password)` → POST `/api/auth/login` → store returned token
- `getMe()` → GET `/api/auth/me`
- `updateMe(data)` → PUT `/api/auth/me`
- `logout()` → POST `/api/auth/logout` → clear token
- `forgotPassword(email)` → POST `/api/auth/forgot-password`
- `resetPassword(code, password)` → POST `/api/auth/reset-password`

**Zustand slice (`lib/stores/authStore.ts`)**
- State: `user`, `token`, `isAuthenticated`, `isLoading`
- Actions: `setUser`, `setToken`, `logout`, `hydrateFromStorage`
- On app load, hydrate the store from wherever the token is persisted (cookie or localStorage — **ask**)

**Pages**
- `/register` — registration form: full_name, email, phone, password, confirm_password
- `/verify-email` — 6-digit code input with resend button and 60s countdown
- `/login` — email + password form with "Forgot password?" link
- `/forgot-password` — email input, submit sends reset code
- `/reset-password` — code input + new password + confirm
- `/account` — view and edit profile (protected, redirect to /login if not authenticated)

### Constraints
- All forms use `react-hook-form` with `zod` validation — **ask if these are installed**
- Show inline field errors from both client-side validation and server error responses
- After login, redirect to the page the user was trying to reach (use `next` query param) or to `/` by default
- Protected pages must redirect to `/login?next=<current_path>` if the user is not authenticated
- Use shadcn `Form`, `Input`, `Button`, `Label` components for all form elements
- Loading states must disable the submit button and show a spinner
- Token persistence: **ask whether to use httpOnly cookie (via Next.js route handler) or localStorage**

### Expected questions the AI should ask before starting
1. Should the JWT be stored in an `httpOnly` cookie (more secure, needs a Next.js API route to set it) or `localStorage` (simpler)?
2. Are `react-hook-form` and `zod` already installed?
3. Is there a global API client (e.g. axios instance with base URL and auth header injection) already set up, or does this phase create it?
4. What is the base URL for the backend API (env variable name)?

---

## Phase 2 — Layout, Navigation & Design System

### Goal
Build the persistent shell for the storefront: header, footer, mobile nav, and the admin panel sidebar layout.

### Scope

**Storefront layout (`app/(store)/layout.tsx`)**
- Header:
  - Logo (left) — links to `/`
  - Search bar (center, desktop) — navigates to `/search?q=`
  - Cart icon with item count badge (Zustand cartStore)
  - Wishlist icon with count badge
  - Auth state: show "Login / Register" buttons if not authenticated; show user avatar dropdown (My Orders, My Account, Logout) if authenticated
  - Mobile: hamburger menu with full-screen overlay nav
- Footer:
  - Site name, tagline
  - Links: About, Contact, FAQs, Privacy Policy, Terms
  - Social links from site settings
  - Copyright line

**Admin layout (`app/(admin)/layout.tsx`)**
- Sidebar (collapsible on mobile) with nav links:
  - Dashboard, Products, Categories, Brands, Tags, Orders, Coupons, Banners, Delivery Zones, Settings, Admins
- Top bar: admin name, role, logout button
- Content area with breadcrumbs

**Zustand stores to create in this phase**
- `cartStore`: `itemCount` (just the count for the badge — full cart data loaded in Phase 7)
- `settingsStore`: `siteName`, `logoUrl`, `currencyCode` — loaded once from `/api/settings/public` at app boot

### Constraints
- Storefront layout must fetch public settings once on the server and pass to the client store via a hydration component
- Admin layout must check admin auth — redirect to `/admin/login` if not authenticated
- Admin panel is under `/admin/...` routes
- Use shadcn `Sheet` for the mobile nav overlay
- The header cart count must update reactively when items are added/removed in any phase

### Expected questions the AI should ask before starting
1. Is there a logo file already in the project, or should the site name text be used as a placeholder?
2. Should the admin sidebar be a fixed sidebar on desktop or a collapsible drawer on all screen sizes?

---

## Phase 3 — Homepage

### Goal
Build the storefront homepage using live data from the backend.

### Scope
- Hero banner section — fetch active banners with `position = "hero"` from `/api/banners`
- Featured products section — fetch `GET /api/products?is_featured=true&limit=8`
- Category grid — fetch `/api/categories` and display top-level categories with images
- Mid-page banner — fetch active banners with `position = "mid_page"`
- "New Arrivals" section — fetch `GET /api/products?sort=newest&limit=8`

### Components to build
- `HeroBanner` — auto-playing carousel using shadcn or a lightweight carousel lib — **ask if a carousel library is installed (embla-carousel is included with shadcn by default)**
- `ProductCard` — reusable card showing: primary image, name, brand, rating stars, price with discount badge, add-to-wishlist button
- `CategoryCard` — image + category name, links to `/category/:slug`
- `SectionHeader` — title + "View All" link

### Constraints
- Homepage data is fetched on the server (Server Component) for SEO
- `ProductCard` must show the discounted price and the original crossed-out price when `discount_percent > 0`
- Rating stars display: use filled/half/empty star icons — not a third-party library
- Images use `next/image` with proper `width`, `height`, and `priority` on hero images
- Skeleton loaders must be shown for all sections while data loads (use shadcn `Skeleton`)

---

## Phase 4 — Product Listing & Search

### Goal
Category pages and search results with filters and sorting.

### Scope
- `/category/:slug` — product listing for a category
- `/search?q=` — search results page

**Shared listing page features**
- Filter sidebar (desktop) / filter sheet (mobile):
  - Category (when on search page)
  - Brand (multi-select checkboxes)
  - Price range (min/max inputs or range slider)
  - Minimum rating (star selector)
  - In-stock only toggle
- Sort dropdown: Newest, Price Low→High, Price High→Low, Top Rated
- Pagination — numbered page controls
- Active filter chips at the top with individual remove buttons
- Result count ("Showing 1–20 of 143 products")

### Constraints
- All filters are reflected in the URL as query params (`?brand=nike&min_price=100`) — use `useSearchParams` and `useRouter`
- Changing a filter resets to page 1
- Filter state is NOT in Zustand — it lives in the URL only
- On mobile, filters open in a shadcn `Sheet` component
- Empty state: show a friendly message + "Clear filters" button when no results
- Each `ProductCard` links to `/product/:slug`

---

## Phase 5 — Product Detail Page

### Goal
Full product page matching the Amazon-style layout defined in the schema.

### Scope
**Route:** `/product/:slug`

**Layout (left to right on desktop, stacked on mobile)**

Left column — Image gallery:
- Primary image (large)
- Thumbnail row — clicking changes the primary image
- Variant-specific images swap in when a variant is selected

Right column — Product info:
- Brand name (links to brand filter)
- Product name (h1)
- Rating summary: stars + count + link to reviews section
- Price block: discounted price (large) + original price crossed out + discount % badge
- Variant selectors:
  - Group options by `option_name` (e.g. "Color", "Size")
  - Color: swatch buttons; Size: pill buttons
  - Out-of-stock variants: shown but disabled with a strikethrough
- Stock status indicator: "In Stock", "Only 3 left", "Out of Stock"
- Quantity selector (1 to min(10, stock_qty))
- "Add to Cart" button (disabled if out of stock)
- "Add to Wishlist" button (toggles)
- Coupon input field with "Apply" button (calls `/api/coupons/validate`)

Below the fold:
- About this item — bullet points from `about_points`
- Product Details table — `ProductAttributes` where `section = "details"`
- Product Information table — `ProductAttributes` where `section = "specs"`
- Reviews section (see Phase 6)

### Constraints
- Page is a Server Component (fetch by slug server-side for SEO and Open Graph meta tags)
- Variant selection is client-side state (useState, not Zustand)
- When a variant is selected, update: price, stock status, images, quantity max
- When no variant is selected and the product has variants, "Add to Cart" must be disabled with message "Please select options"
- Open Graph tags: `og:title`, `og:description`, `og:image` from the product's primary image
- Coupon validation result must show computed discount amount and expiry, not just success/fail

---

## Phase 6 — Reviews

### Goal
Display, write, edit, and delete reviews on the product detail page.

### Scope
**Review list section (on product page)**
- Rating distribution bar chart (5★ count, 4★ count, etc.)
- Average rating with large star display
- Individual review cards: rating stars, title, body, user name, date, "Verified Purchase" badge
- Pagination (load more button or numbered pages — **ask which style**)

**Write a review (authenticated customer)**
- Appears only if user is logged in and has a delivered order containing this product
- Form: star rating selector, title input, body textarea
- If the user already has a review, show it in edit mode instead of the creation form

### Constraints
- Review form only shows when `order_item_id` can be provided — the frontend must look up the user's delivered order items to find a matching `order_item_id` for this product before showing the form
- Use optimistic UI: after submitting, add the review to the list immediately and roll back if the request fails
- Editing updates the existing card in place without a page reload
- Deleting asks for confirmation using shadcn `AlertDialog`

---

## Phase 7 — Cart

### Goal
Full cart experience: slide-over panel on desktop, full page on mobile (or always a page — **ask**).

### Scope
**Zustand `cartStore` (full slice)**
- State: `items[]`, `coupon`, `subtotal`, `discountAmount`, `total`, `isLoading`
- Actions: `fetchCart`, `addItem`, `updateQty`, `removeItem`, `applyCoupon`, `removeCoupon`, `clearCart`
- On mount: fetch `/api/cart` and populate the store

**Cart UI**
- Item rows: thumbnail, name, variant label, unit price, quantity stepper, line total, remove button
- Price-changed indicator: if `current_price !== unit_price` on a cart item, show a warning badge
- Coupon section: code input + "Apply" button, applied coupon shown as a chip with a remove button
- Order summary sidebar:
  - Subtotal
  - Discount (if coupon applied)
  - Shipping: "Calculated at checkout"
  - Total
  - "Proceed to Checkout" button

### Constraints
- Quantity stepper must check stock in real time — disable "+" if at max stock
- "Proceed to Checkout" redirects to `/checkout` (Phase 8) — requires authentication
- Cart icon in the header badge updates reactively via `cartStore.items.length`
- Empty cart state: illustration + "Continue Shopping" button linking to `/`

### Expected questions the AI should ask before starting
1. Should the cart be a slide-over drawer or a dedicated `/cart` page?

---

## Phase 8 — Checkout

### Goal
Multi-step checkout: address selection → order review → payment.

### Scope
**Route:** `/checkout` (protected)

**Step 1 — Delivery Address**
- List saved addresses with a "Select" button on each
- "Add new address" inline form (calls Phase 12's address API)
- Selected address shows the applicable shipping rate and estimated delivery days
- "Continue" advances to Step 2

**Step 2 — Order Review**
- Cart items summary (read-only)
- Selected address summary
- Payment method selector: "Cash on Delivery" / "Instapay" / "Vodafone Cash"
- When Instapay or Vodafone Cash is selected, show the receiving account info fetched from `GET /api/payments/methods` (e.g. "Send payment to: 01xxxxxxxxx") with a copy-to-clipboard button
- Final price breakdown: subtotal, discount, shipping fee, total
- "Place Order" button

**Step 3 — Confirmation / Payment Proof**
- If Cash on Delivery: show order confirmation screen with order number and "Track My Order" link
- If Instapay or Vodafone Cash: after the order is placed, show a "Submit Payment Proof" form on the same confirmation screen:
  - Display the receiving account again as a reminder
  - Transaction reference number input (required)
  - Screenshot upload (required) — uploads via the media endpoint, then submits the returned URL
  - "Submit Proof" button calling `POST /api/payments/submit-proof`
  - After submission: show "Payment under review — we'll confirm once verified" status message
  - The order detail page (`/orders/:id`, Phase 9) must also show this same proof-submission form if the customer skips it here or needs to resubmit after a rejection

### Constraints
- All three steps live on `/checkout` as a single page with step state managed locally (useState)
- On "Place Order": call `POST /api/orders`, handle stock errors gracefully (show which items are out of stock)
- After successful order placement: clear the Zustand cartStore and navigate to `/orders/:id/confirmation`
- The confirmation page shows: order number, estimated delivery, items ordered, delivery address, and — for manual payment methods — the proof submission form described in Step 3
- If the user has no saved addresses, Step 1 forces them to add one before proceeding
- The receiving account info (Instapay handle, Vodafone Cash number) should be fetched once and cached for the checkout session — no need to refetch between steps

---

## Phase 9 — Customer Order History & Detail

### Goal
Customers can view their order history and track individual orders.

### Scope
- `/orders` — list all orders, paginated
  - Order card: order number, date, status badge, total, thumbnail of first item, item count
  - Filter by status tabs: All / Pending / Processing / Shipped / Delivered / Cancelled
- `/orders/:id` — order detail
  - Status timeline (visual step tracker showing: Pending → Confirmed → Processing → Shipped → Delivered)
  - Items list with product images, names, variant, qty, price
  - Delivery address
  - Payment info (method, status). For Instapay/Vodafone Cash: show payment review status (pending review / approved / rejected). If rejected, show the rejection note and allow resubmission of proof using the same form from checkout Step 3.
  - Cancel button (shown only if status is `pending` or `confirmed`)
  - Review prompt for each delivered item that hasn't been reviewed yet

### Constraints
- Status badge colors: use Tailwind color classes — pending=yellow, confirmed=blue, processing=indigo, shipped=cyan, delivered=green, cancelled=red, refunded=orange
- The cancel action must show a shadcn `AlertDialog` confirmation before calling the API
- After cancellation, update the order status in the UI optimistically and re-fetch to confirm

---

## Phase 10 — Wishlist

### Goal
Customers can view and manage their saved products.

### Scope
- `/wishlist` — full wishlist page (protected)
  - Grid of `ProductCard` components with an extra "Remove from Wishlist" button
  - "Add to Cart" on each card (respects variant selection)
  - Empty state with "Explore Products" CTA

**Zustand `wishlistStore`**
- State: `items[]`, `count`
- Actions: `fetchWishlist`, `addItem`, `removeItem`
- `ProductCard` and the product detail page both toggle the heart icon based on this store

### Constraints
- The wishlist heart icon on `ProductCard` must be reactive — filled if in store, outline if not
- Adding to wishlist while unauthenticated must redirect to `/login?next=<current_path>`
- Optimistic UI: toggle the heart immediately, roll back if the API call fails

---

## Phase 11 — Notifications

### Goal
Customers see their in-app notifications.

### Scope
- Notification bell icon in the header with unread count badge
- Dropdown panel (max 5 latest) with "View all" link
- `/notifications` — full list page, paginated
  - Mark as read on click (navigates to `link` if present)
  - "Mark all as read" button

**Zustand `notificationsStore`**
- State: `unreadCount`, `notifications[]`
- Actions: `fetchUnreadCount`, `markRead`, `markAllRead`

### Constraints
- `unreadCount` is fetched on app load if the user is authenticated (lightweight count endpoint — **ask if the backend exposes a count-only endpoint or if the full list is used**)
- Clicking a notification that has a `link` navigates to that link after marking it read
- Real-time updates (Socket.IO) are deferred to a later phase if not already set up

---

## Phase 12 — Customer Account & Addresses

### Goal
Customer profile management and saved address CRUD.

### Scope
**`/account`** — tabbed page with:
- Profile tab: edit full_name, phone, avatar (file upload preview)
- Addresses tab:
  - List of saved addresses, each with Edit / Delete / Set as Default buttons
  - "Add new address" button → inline form or modal
  - `zone_id` is selected via a dropdown populated from `/api/delivery-zones`
- Security tab: change password form (current password + new password + confirm)

### Constraints
- Address limit of 10 must be enforced on the frontend (hide "Add" button when at 10, show message)
- Deleting a default address must prompt the user to set another as default first
- Avatar upload sends the file to `/api/admin/media` (or a separate customer upload endpoint — **ask if customers can upload avatars directly or if they must use a URL**)
- All tab state is in the URL (`/account?tab=addresses`) so it's shareable and refresh-safe

---

## Phase 13 — Admin Panel: Dashboard

### Goal
Admin landing page with key business metrics.

### Scope
**Route:** `/admin`

**Metric cards row**
- Total Orders (today / this week / this month — tab selector)
- Total Revenue
- New Customers
- Pending Orders count (clickable, links to orders filtered by pending)

**Charts**
- Revenue over last 30 days (line chart)
- Orders by status (donut chart)
- Top 5 selling products (bar chart)

**Recent orders table**
- Order number, customer name, total, status badge, date, "View" button

### Constraints
- Use `recharts` for all charts (already available in the project)
- All data comes from `/api/admin/orders/stats` and `/api/admin/orders?limit=5&sort=newest`
- Charts must have loading skeletons
- Metric cards must show a % change vs the previous period (backend must support this — **note this in the backend spec as a required stats field**)

---

## Phase 14 — Admin Panel: Products

### Goal
Full product management UI for admins.

### Scope
**`/admin/products`** — data table with columns: image, name, category, brand, price, stock, status, actions
- Filters: category, brand, status, search by name
- Bulk actions: activate, deactivate
- Pagination

**`/admin/products/new`** and **`/admin/products/:id/edit`** — product form:
- Tab 1 — Basic Info: name, slug (auto-generated, editable), description, category (dropdown), brand (dropdown), base_price, discount_percent, is_featured, is_active
- Tab 2 — About & Attributes: `about_points` (dynamic list of string inputs with add/remove), Details attributes (key-value row editor), Specs attributes (key-value row editor)
- Tab 3 — Images: drag-and-drop multi-image uploader with reorder, set-primary button
- Tab 4 — Tags: multi-select tag picker (from existing tags, with create-new option)
- Tab 5 — Variants: variant builder
  - List of existing variants
  - "Add Variant" form: enter option key-value pairs (e.g. Color: Red, Size: XL), price, discount_percent, stock_qty
  - Each variant has its own image uploader

### Constraints
- Use shadcn `Tabs`, `Table`, `Dialog`, `Select`, `Checkbox`, `Badge` throughout
- Slug field must auto-populate from name but remain manually editable
- The variant builder must dynamically detect all unique `option_name` values across variants and render the correct selectors on the product page
- Image uploader: show preview thumbnails with a remove button — **ask what upload endpoint to use**
- Unsaved changes warning: prompt the user before navigating away from an incomplete form (use `beforeunload` + Next.js router guard)

---

## Phase 15 — Admin Panel: Orders & Payment Review

### Goal
Full order management for admins, plus manual review of Instapay/Vodafone Cash payment proofs.

### Scope
**`/admin/orders`** — data table:
- Columns: order number, customer, total, payment method, payment status, order status, date, actions
- Filters: status, payment status, date range picker, search by order number or customer email
- Export to CSV button — **ask if this is required**

**`/admin/orders/:id`** — order detail:
- Customer info card with link to customer profile
- Items table
- Status timeline
- "Update Status" button → modal with current status, next valid statuses listed as radio options, optional note field
- Payment info card — for Instapay/Vodafone Cash, this card shows the proof reference, screenshot (clickable to enlarge), submission date, and Approve/Reject buttons if still pending
- Delivery address card

**`/admin/payments`** — dedicated queue for payments awaiting review (mirrors `GET /api/admin/payments/pending`)
- List of pending payments with: order number, customer name, method, amount, proof reference, screenshot thumbnail, submitted date
- Click thumbnail to view full-size screenshot in a `Dialog`
- "Approve" button — confirms via `AlertDialog`, then calls the approve endpoint
- "Reject" button — opens a `Dialog` with a required reason textarea, then calls the reject endpoint
- This page exists so admins don't have to hunt through the full orders list to find payments needing action

### Constraints
- Status update modal must only show valid next states (no backwards transitions)
- After status update, the timeline on the page updates without a full reload
- `OrderStatusHistory` entries are displayed in the timeline in chronological order with admin name and note
- The admin dashboard (Phase 13) "Pending Orders" style metric card should have a sibling card for "Payments Awaiting Review" linking to `/admin/payments`
- Approving or rejecting a payment from either `/admin/orders/:id` or `/admin/payments` must update both views consistently — invalidate/refetch shared data after the action

---

## Phase 16 — Admin Panel: Categories, Brands & Tags

### Goal
Admin CRUD for the taxonomy.

### Scope
**`/admin/categories`**
- Tree view showing the nested category structure (expand/collapse)
- "Add Category" button — form in a shadcn `Dialog`: name, slug, parent category (dropdown), image upload, sort_order, is_active
- Edit and deactivate buttons on each node

**`/admin/brands`**
- Simple data table with name, logo, status
- Create/edit in a Dialog: name, slug, logo upload, description, is_active

**`/admin/tags`**
- Simple list with inline edit/delete

### Constraints
- Category tree must visually indent by nesting level
- Adding a subcategory from within the tree must pre-fill the parent_id
- Deactivating a category that has active products shows a warning but uses the backend's `409` response to block it

---

## Phase 17 — Admin Panel: Coupons & Delivery Zones

### Goal
Admin management for discount codes and delivery configuration.

### Scope
**`/admin/coupons`**
- Table: code, product (if scoped), type, value, usage (used/max), expiry, status
- Create/edit in a Dialog: code, product selector (searchable), discount_type, discount_value, min_order_amount, max_uses, expires_at, is_active

**`/admin/delivery-zones`**
- Table of zones: name, city, region, status
- Expandable row showing shipping rates for that zone
- "Add Zone" Dialog + "Add Rate" Dialog per zone

### Constraints
- Product selector in coupon form must be a searchable combobox (shadcn `Combobox`) fetching from `/api/admin/products?search=`
- Zone deactivation must warn that all its rates will also be deactivated

---

## Phase 18 — Admin Panel: Banners, Settings & Media

### Goal
Complete admin configuration surface.

### Scope
**`/admin/banners`**
- Table with image preview, position, active period, status
- Create/edit Dialog: title, image upload, link URL, position (dropdown), sort_order, starts_at, ends_at, is_active

**`/admin/settings`**
- Grouped form sections (General, Appearance, SEO, Payment, Social)
- Each setting renders the correct input based on its `type` field: text → Input, textarea → Textarea, boolean → Switch, image → image upload with preview, color → color picker input, number → number Input
- Single "Save All" button per group

**`/admin/media`**
- Grid view of uploaded files with thumbnail, file name, size
- Upload button (drag-and-drop area)
- Copy URL button on each file
- Delete button (shows warning if file is in use)

---

## Phase 19 — Admin Panel: Admins Management

### Goal
Super-admin can manage admin accounts and roles.

### Scope
**`/admin/admins`** (super-admin only)
- Table: name, email, role, status, last login
- "Create Admin" Dialog: full_name, email, password, role (dropdown from admin_roles)
- Deactivate / Reactivate buttons (no hard delete)

**`/admin/roles`** (super-admin only, optional — **ask if role creation via UI is needed or if roles are code-managed**)

---

## Global Frontend Constraints (Apply to All Phases)

- **TypeScript is mandatory** — every API response must have a typed interface in `lib/types/`
- **All API calls** go through typed wrapper functions in `lib/api/` — no inline `fetch()` calls in components
- **Error handling:** all API errors must be caught and shown via shadcn `toast` (sonner or shadcn's toast — **ask which is installed**)
- **Loading states:** every data-fetching operation must show a skeleton or spinner — never a blank screen
- **Empty states:** every list/table must have a designed empty state (not just "No data")
- **Mobile-first:** all pages must be fully usable on 375px width
- **Accessibility:** all interactive elements must be keyboard-navigable and have `aria-label` where needed
- **Environment variables:** the backend API base URL must come from `NEXT_PUBLIC_API_URL`
- **No hardcoded strings** for currency — always use `currencyCode` from `settingsStore`
- **Price formatting:** use a `formatPrice(amount, currency)` utility function, never format inline
- **Date formatting:** use a `formatDate(timestamp)` utility, always display in user-local timezone
- **Admin pages** must check the logged-in admin's `permissions` array before rendering action buttons (e.g. hide "Delete" if `products.delete` is not in permissions) — permission check is a client-side UX guard only, the real check is on the server
