# Research: Customer Cart

## Decisions

### Cart Display: Dedicated Page (Primary) + Drawer (Secondary)

**Decision**: Cart is a dedicated page at `/app/(store)/cart/page.tsx`. An optional slide-over drawer (shadcn Sheet) can be used as a quick-preview entry point from the header icon on mobile.

**Rationale**:
- Spec language consistently refers to "cart view" as a location with items, order summary, and checkout button — implying a page, not just a transient overlay
- "Proceed to Checkout" navigation to `/checkout` is more natural from a page than a drawer
- Dedicated page enables deep-linking, SSR of cart data, and consistent layout (header + footer)
- Sheet drawer already exists as shadcn component (`src/components/ui/sheet.tsx`) and can be layered on later without breaking the page architecture

**Alternatives considered**:
- Slide-over drawer only: Removes deep-linking capability, makes empty-state navigation awkward, limits space for order summary + coupon input
- Quick-add toast/notification: Insufficient for managing items, quantities, and coupons

### Cart State: Full Zustand Store with Persist

**Decision**: Replace existing `cartStore` (itemCount only) with a full-featured Zustand store using persist middleware.

**Rationale**:
- Exisiting pattern (`create<Interface>()(persist(...))`) used by theme and i18n stores
- Cross-session persistence required by spec (FR-011)
- Store holds: `items`, `coupon`, `subtotal`, `discount`, `total`, `version`, `isLoading`, `error`
- Actions: `fetchCart`, `addItem`, `updateItemQty`, `removeItem`, `applyCoupon`, `removeCoupon`, `reset`
- Exposes `itemCount` getter for header badge compatibility

**Alternatives considered**:
- React Query for server state + Zustand for UI state: Adds complexity; cart is primarily user-owned state that needs to persist across sessions and be available before server fetch completes
- Context API: No persistence, re-render performance considerations at scale

### API Client: Request.ts (Existing)

**Decision**: Use the existing `Request.ts` class-based API client (`.get<T>()`, `.post<T>()`, `.put<T>()`, `.delete<T>()`).

**Rationale**:
- Same pattern used in Phase 5 (`src/lib/api/product.ts`, `src/lib/api/categories.ts`) and Phase 6 (`src/lib/api/reviews.ts`)
- Consistent error handling through interceptors (auth refresh queue, error transformation)
- `withCredentials: true` for cookie-based auth

### Auth Enforcement

**Decision**: Cart operations require authentication enforced at the API level (backend returns 401). Frontend redirects unauthenticated users to `/login?next=/cart` for page access and shows toast for Add to Cart attempts.

**Rationale**:
- Spec explicitly states "no guest cart"
- Backend already requires auth for all `/api/cart/*` endpoints
- Auth check at page level (route guard) and action level (store guard)

### Price Change Detection

**Decision**: Backend-driven — the API response includes `current_price` and `price_changed` boolean per item. Frontend only renders the warning badge when `price_changed === true`.

**Rationale**:
- Backend has authoritative knowledge of current prices; no need for frontend to diff
- Spec FR-002 matches this pattern
- Same approach as reviews Phase 6

### Optimistic UI Strategy

**Decision**: Implement optimistic updates for add/update/remove actions. On failure: toast error + rollback to previous state.

**Rationale**:
- Spec FR-013 requires rollback on failure
- Existing pattern: none yet — this is the first optimistic UI feature, but the pattern is standard for e-commerce carts
- Zustand's `get()` for snapshot before mutation, restore snapshot on error

### No Dependency Additions

**Decision**: All required dependencies are already in `package.json`. Zero new dependencies needed.

**Rationale**:
- Zustand: installed
- React Query: installed
- sonner (toasts): installed (used through `useToast` from `@/stores/toast`)
- lucide-react (icons): installed
- shadcn/ui Sheet: already exists at `src/components/ui/sheet.tsx`
- shadcn/ui Button, Badge, Input, Skeleton, Separator: already exist
