# Quickstart: Customer Account & Addresses

## Prerequisites

- Running backend API at the URL configured in `NEXT_PUBLIC_API_URL` (or `NEXT_PUBLIC_BACKEND_URL`)
- Customer auth token (must be logged in to access `/account`)
- Delivery zones must be seeded in the backend (for zone dropdown in address form)

## What's Already Done

These files exist from prior phases and need no changes:

| File | Purpose |
|------|---------|
| `src/lib/api/addresses.ts` | All 5 address API wrappers + `getDeliveryZones` |
| `src/lib/api/auth.ts` | `getMe`, `updateMe` (profile) |
| `src/lib/api/payments.ts` | `uploadFile` for avatar upload |
| `src/lib/types/auth.ts` | `User`, `UpdateProfilePayload` |
| `src/lib/types/order.ts` | `Address`, `DeliveryZone`, `CreateAddressRequest`, `UpdateAddressRequest` |
| `src/components/auth/ProfileForm.tsx` | Profile editing form (needs avatar upload added) |
| `src/app/(store)/account/page.tsx` | Account page shell (needs tabbed layout) |

## What Needs to Be Built

| File | Purpose |
|------|---------|
| `src/components/store/AccountTabs.tsx` | Tab navigation (Profile / Addresses) driven by `?tab=` URL param |
| `src/components/store/AccountAddressForm.tsx` | Address create/edit form with delivery zone dropdown |
| `src/components/store/AccountAddresses.tsx` | Address list with Edit, Delete, Set as Default |

## What Needs to Be Updated

| File | Change |
|------|--------|
| `src/app/(store)/account/page.tsx` | Add tabbed layout with `AccountTabs`, conditionally render `ProfileForm` or `AccountAddresses` |
| `src/components/auth/ProfileForm.tsx` | Add avatar upload (file input → `uploadFile()` → `updateMe({ avatar_url })`) |

## Build Order

1. `AccountTabs.tsx` — URL-driven tab bar (Profile / Addresses)
2. Update `account/page.tsx` — tabbed layout with `AccountTabs`
3. Update `ProfileForm.tsx` — add avatar upload
4. `AccountAddressForm.tsx` — address form with zone dropdown
5. `AccountAddresses.tsx` — address list with actions
6. Verify: `npm run build` passes

## Key Patterns to Follow

- All interactive components: `"use client"` directive
- Imports: `@/` alias (e.g. `@/lib/api/addresses`, `@/components/forms/Input`)
- Forms: `react-hook-form` + `zod` with `@hookform/resolvers`
- Class merging: `cn("base-styles", { conditional: bool }, className)`
- API calls: via `Request.ts` (class-based), not `client.ts`
- Auth guard: `<ProtectedRoute>` wrapper in page
- RTL: Test with Arabic content
