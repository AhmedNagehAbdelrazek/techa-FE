# Research: Customer Account & Addresses

## Decision: Avatar Upload Flow

**Decision**: Two-step flow — upload file to `POST /api/upload`, then pass returned URL to `PATCH /api/auth/me`.

**Rationale**:
- Confirmed via clarification session: Q2 → A
- Matches existing pattern in `payments.ts` (`uploadFile` function already exists)
- Keeps profile update endpoint clean (receives URL, not multipart)
- `uploadFile()` returns `{ url, filename, cached }` — the `url` is passed as `avatar_url`

**Alternatives considered**:
- Direct multipart to profile endpoint: would require changing `PATCH /api/auth/me` contract — no backend support.

## Decision: Tab Navigation Pattern

**Decision**: Use URL search param (`?tab=profile|addresses`) for tab state, rendered via a simple custom tab bar (not shadcn Tabs).

**Rationale**:
- shadcn `Tabs` component is not installed — would need `npx shadcn@latest add tabs`
- Custom tab bar with URL-driven active state is ~40 lines and matches the existing `OrderStatusTabs` pattern
- URL state is already required by spec (FR-003): "Tab selection is reflected in the URL as `?tab=profile|addresses`"
- No need for shadcn Tabs when the tab bar is just a horizontal row of buttons

**Alternatives considered**:
- shadcn Tabs: would work but adds an unnecessary dependency for a 2-tab layout
- Zustand tab state: violates spec requirement for URL-based tab state

## Decision: Address Form UX

**Decision**: Use inline form (expands in-place) rather than a modal/dialog for address creation and editing.

**Rationale**:
- The address form has 10+ fields — a modal would be tall and require scrolling on mobile
- Inline expand/collapse pattern is simpler and more accessible
- shadcn `Dialog` is already installed but a tall scrolling modal is poor UX on 375px mobile
- Follows the "mobile-first" global constraint

**Alternatives considered**:
- shadcn Dialog: would work but creates mobile UX issues with long forms
- Separate page: violates the single-tabbed-page spec requirement

## Decision: API Wrappers

**Decision**: All required API wrappers already exist — no new API files needed.

**Rationale**:
- `src/lib/api/addresses.ts`: `listAddresses`, `createAddress`, `updateAddress`, `setDefaultAddress`, `deleteAddress`, `getDeliveryZones` — all exist
- `src/lib/api/auth.ts`: `getMe`, `updateMe` — both exist with `UpdateProfilePayload` supporting `name`, `phone`, `avatar_url`
- `src/lib/api/payments.ts`: `uploadFile` — exists for file uploads
- `src/lib/types/order.ts`: `Address`, `DeliveryZone`, `CreateAddressRequest`, `UpdateAddressRequest` — all exist
- `src/lib/types/auth.ts`: `User`, `UpdateProfilePayload` — both exist

## Decision: Optimistic UI for Address Operations

**Decision**: Use optimistic UI for add/edit/delete/set-default operations with rollback on error.

**Rationale**:
- Spec requires it (FR-002): "Optimistic UI: address list updates immediately on add/edit/delete with rollback on failure"
- Follows pattern used in Wishlist and Cart features
- Provides instant feedback on all address mutations
- Use `useState` with local snapshot, revert on catch
