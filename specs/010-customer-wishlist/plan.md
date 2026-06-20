# Implementation Plan: Customer Wishlist

**Branch**: `010-customer-wishlist` | **Date**: 2026-06-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/010-customer-wishlist/spec.md`

## Summary

Allow customers to save products to a wishlist from product cards and product detail pages, view all saved items on a dedicated `/wishlist` page, remove items, and add items to cart directly from the wishlist. The feature builds on existing `WishlistButton`, `useWishlistStore`, and `src/lib/api/wishlist.ts` infrastructure.

## Technical Context

**Language/Version**: TypeScript 5 (`strict: true`), Next.js 15 (App Router), React 19

**Primary Dependencies**: Next.js, React, Zustand, Tailwind CSS 4, shadcn/ui (Badge, Button, Skeleton), lucide-react, sonner (toast), @tanstack/react-query

**Storage**: Zustand persist (localStorage key: `"wishlist-storage"`) for item count; backend database for full wishlist state

**Testing**: Vitest 2 + @testing-library/react (unit), Playwright (E2E)

**Target Platform**: Web — modern browsers, Arabic-first RTL (`dir="rtl"`, `lang="ar"`)

**Project Type**: Web application — Next.js 15 App Router with `"use client"` interactive components

**Performance Goals**: Optimistic UI updates in <100ms (icon fill/empty, card removal), page load <2s on standard connection, badge count reactive without full-page reload

**Constraints**: No direct `request` calls in UI components (use `src/lib/api/*.ts` wrappers), Arabic-first RTL layout, auth-gated pages via `<ProtectedRoute>`, Tailwind v4 CSS-first config (no `tailwind.config.*`)

**Scale/Scope**: Single feature (Customer Wishlist) within larger e-commerce storefront — ~5 new/modified files (types, API wrapper enhancements, wishlist page, store update, agent context)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Rationale |
|------|--------|-----------|
| 1. Does this need to exist? | **PASS** | Spec requires it (FR-001 through FR-011). Clear user stories with acceptance criteria. |
| 2. Does the stdlib do it? | **PASS** | Not applicable — wishlist persistence requires server storage, UI requires React components. |
| 3. Is it a native platform API? | **PASS** | No native API exists for e-commerce wishlist management. |
| 4. Is it an installed dependency? | **PASS** | All required deps are already in `package.json`: React, Zustand, shadcn/ui, lucide-react, sonner, next, tailwind-merge/clsx. |
| 5. Can it be written in one line? | **PASS** | Multiple files needed: types, API wrapper enhancements, store update, page + components. |
| 6. Write minimum code | **PASS** | Builds on existing `WishlistButton`, `useWishlistStore`, and `src/lib/api/wishlist.ts`. Reuses `ProductCard`, `ProtectedRoute`, `EmptyState`, `ErrorState`. |

**Additional gates from constitution patterns**:

| Gate | Status | Rationale |
|------|--------|-----------|
| No new dependencies | **PASS** | All deps already installed. |
| Use existing API wrapper pattern | **PASS** | Enhance `src/lib/api/wishlist.ts` — no direct `request` calls in UI. |
| Use existing store pattern | **PASS** | Enhance `useWishlistStore` with item data — follows `cart.store.ts` pattern. |
| Use existing components | **PASS** | Reuse `ProductCard`, `ProtectedRoute`, `EmptyState`, `ErrorState`, `Skeleton`. |
| Arabic-first RTL | **PASS** | Follows existing layout in root layout (`lang="ar"`, `dir="rtl"`). |
| Tailwind v4 CSS-first | **PASS** | No `tailwind.config.*` changes needed. |
| Named exports, `cn()`, `useId()` | **PASS** | Existing conventions followed. |

**No violations found** — Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/010-customer-wishlist/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── wishlist-api.md  # API contracts
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── types/
│   │   └── wishlist.ts          # NEW — WishlistItem enriched type
│   ├── api/
│   │   └── wishlist.ts          # ENHANCED — add WishlistItemWithProduct type, getWishlistDetail
│   └── stores/
│       └── wishlist.store.ts    # ENHANCED — add itemCount sync, remove fetchWishlist direct request
├── components/
│   └── store/
│       └── WishlistPageClient.tsx  # NEW — wishlist page client component
├── app/
│   └── (store)/
│       └── wishlist/
│           └── page.tsx         # NEW — wishlist page with ProtectedRoute
```

**Structure Decision**: Single Next.js frontend project. All new code lives under existing directory conventions. No backend changes needed (backend already has wishlist API).
