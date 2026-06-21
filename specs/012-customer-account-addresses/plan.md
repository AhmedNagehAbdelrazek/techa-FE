# Implementation Plan: Customer Account & Addresses

**Branch**: `012-customer-account-addresses` | **Date**: 2026-06-21 | **Spec**: `specs/012-customer-account-addresses/spec.md`

**Input**: Feature specification from `/specs/012-customer-account-addresses/spec.md`

## Summary

Customer profile management and address CRUD on a single `/account` page with tabbed navigation (Profile, Addresses). Profile tab extends the existing `ProfileForm` with avatar upload. Addresses tab provides full CRUD with delivery zone selection, 10-address limit, and set-default. Auth-protected via `ProtectedRoute`.

## Technical Context

**Language/Version**: TypeScript 5 (strict: true)

**Framework**: Next.js 15 (App Router, `"use client"` based)

**Primary Dependencies**: React 19, Tailwind CSS 4, shadcn/ui (button, badge, skeleton), Radix UI, Zustand, react-hook-form + zod, sonner, lucide-react (User, MapPin icons)

**Storage**: N/A — fully API-driven (no local persistence beyond Zustand auth store)

**Testing**: Vitest 2 + @testing-library/react + @testing-library/jest-dom

**Target Platform**: Web — Next.js SSR + client-side rendering (Arabic-first, RTL)

**Performance Goals**: Profile form loads within 2s (SC-001); address list renders within 2s (SC-002); avatar upload preview shows within 3s (SC-007)

**Constraints**: 10-address limit enforced client-side (FR-002); tab state in URL only (`?tab=profile|addresses`); password change out of scope; Arabic-first RTL layout

**Scale/Scope**: 2 tabs on one page, 5 address API calls (all wrappers exist), avatar upload via existing `uploadFile()` in payments.ts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Justification |
|------|--------|---------------|
| Does this need to exist? | ✅ PASS | Clearly specified feature (Phase 12 of frontend-spec.md) with 3 user scenarios, 4 FRs, acceptance criteria |
| Does stdlib do it? | ✅ PASS | Not applicable — feature requires UI components and API integration, not algorithmic |
| Is it a native platform API? | ✅ PASS | No — requires external API calls via existing Request.ts client |
| Is it an installed dependency? | ✅ PASS | All needed dependencies already present: react-hook-form, zod, sonner, shadcn/ui |
| Can it be written in one line? | ✅ PASS | No — multi-component feature with page, tabs, forms, address CRUD, and avatar upload |
| No new dependency without justification | ✅ PASS | No new dependencies needed; uses existing components and patterns |
| Follows existing patterns | ✅ PASS | Uses Request.ts API pattern, ProtectedRoute, `"use client"` components, cn() class merging, sonner toasts, react-hook-form with zod |

**No violations.** The feature maps cleanly onto existing architecture. Many API wrappers and types already exist from prior phases.

## Project Structure

### Documentation (this feature)

```text
specs/012-customer-account-addresses/
├── plan.md              # This file
├── research.md          # Phase 0 — research decisions
├── data-model.md        # Phase 1 — types & data structures
├── quickstart.md        # Phase 1 — setup guide
├── contracts/           # Phase 1 — API contracts
│   └── account-api.md
└── tasks.md             # Phase 2 — generated tasks (not created by /speckit.plan)
```

### Source Code

```text
src/
├── components/
│   ├── auth/
│   │   └── ProfileForm.tsx       # Already exists — extend with avatar upload
│   └── store/
│       ├── AccountAddresses.tsx   # NEW — Address list + add/edit/delete/default
│       ├── AccountAddressForm.tsx # NEW — Address create/edit form with zone dropdown
│       └── AccountTabs.tsx        # NEW — Tab navigation for /account page
│   └── auth/
│       └── LogoutButton.tsx       # Already exists — no changes needed
└── app/
    └── (store)/
        └── account/
            └── page.tsx            # Already exists — convert to tabbed layout
```

**Structure Decision**: Single-project Next.js app (existing pattern). Follows existing `src/components/store/`, `src/components/auth/`, `src/components/ui/` layout. New components are store-specific (AccountAddresses, AccountAddressForm, AccountTabs). Existing `ProfileForm` and `page.tsx` are extended, not replaced.

## Implementation Order

1. Update `src/app/(store)/account/page.tsx` — convert to tabbed layout with AccountTabs, integrate both ProfileForm and AccountAddresses
2. Create `src/components/store/AccountTabs.tsx` — tab navigation component (URL-driven via `?tab=`)
3. Update `src/components/auth/ProfileForm.tsx` — add avatar upload (file input → uploadFile → updateMe)
4. Create `src/components/store/AccountAddressForm.tsx` — address create/edit form with delivery zone dropdown
5. Create `src/components/store/AccountAddresses.tsx` — address list with Edit, Delete, Set as Default actions

## Complexity Tracking

No constitution violations — section intentionally empty.
