# Implementation Plan: Layout, Navigation & Design System

**Branch**: `002-layout-navigation-design` | **Date**: 2026-06-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-layout-navigation-design/spec.md`

## Summary

Build the persistent shell for the storefront (header with logo/search/cart badge/wishlist badge/auth controls, footer with links/social/copyright) and the admin panel layout (sidebar with nav links, top bar with admin info/logout, breadcrumbs, auth gate). Create 3 Zustand stores: `cartStore` (item count), `settingsStore` (site name, logo URL, currency code), `wishlistStore` (item count). Mobile navigation via hamburger menu with full-screen overlay on screens < 768px. These layouts wrap all pages within their respective route groups.

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 15 (App Router)

**Primary Dependencies**: Next.js 15, React 19, Zustand 5 (client state), shadcn/ui Sheet (mobile overlay), Radix UI (dropdown menu, avatar), lucide-react (Menu, Search, ShoppingCart, Heart icons), clsx + tailwind-merge (cn), sonner (toast for errors)

**Storage**: N/A — cart count, wishlist count, and settings are session state in Zustand. No persistent client storage needed beyond the session.

**Testing**: vitest 2.x + @testing-library/react (component tests for Header, Footer, Sidebar, mobile nav), Playwright (E2E layout tests across viewports). Layout components should have coverage for responsive behavior and auth state rendering.

**Target Platform**: Modern web browsers, mobile-first responsive down to 375px. RTL layout (Arabic, `dir="rtl"`). Admin panel desktop-first (sidebar visible by default).

**Project Type**: Web application (Next.js frontend with REST API backend)

**Performance Goals**: Header/footer visible within first paint (server-rendered). No layout shift after settings load (settings fetched server-side and hydrated). Cart/wishlist badge updates under 500ms. Admin sidebar navigation under 200ms route transition.

**Constraints**: RTL (Arabic-first, test with Arabic content). shadcn `Sheet` for mobile nav overlay. Admin auth gate — redirect to `/admin/login` if unauthenticated. Cart count from `cartStore`, not direct API call on every render. Settings fetched once on server via layout server component, hydrated to client store. Admin sidebar nav links point to routes that may not exist yet (they'll 404 gracefully until their phases).

**Scale/Scope**: Phase 2 delivers storefront layout shell (1 layout file), admin layout shell (1 layout file), ~8 components (Header, Footer, MobileNav, AdminSidebar, AdminTopBar, Breadcrumbs, CartStore hydration, SettingsStore hydration), 3 Zustand stores (cartStore, settingsStore, wishlistStore). Foundation for all subsequent phases.

**Technical unknowns resolved from codebase analysis**:
- `src/app/(store)/` route group exists but has no layout.tsx yet — will be created
- `src/app/(admin)/` route group does not exist — will be created alongside layout
- Zustand stores live in `src/lib/stores/` — existing pattern for auth, theme, i18n stores
- ui components via shadcn: `Sheet`, `Avatar`, `DropdownMenu` may need to be added via `npx shadcn@latest add`
- lucide-react is already installed (confirmed in Phase 1)
- AuthProvider is commented out in root layout (Phase 1 issue) — Phase 2 header needs auth state, so AuthProvider must be uncommented/fixed as prerequisite
- No settings, cart, or wishlist endpoints have saved response examples in Postman collection — field names will be confirmed during research

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate Evaluation

**Pre-Flight Checklist** (Section 1):
1. ✅ Does this need to exist? — Yes, spec defines clear requirements from frontend-spec Phase 2
2. ✅ Does the stdlib do it? — No, Zustand and shadcn are needed (both already installed)
3. ✅ Is it a platform API? — Next.js App Router layouts are platform built-ins
4. ✅ Is it an installed dependency? — Zustand, lucide-react, shadcn/ui, Radix UI are all in package.json
5. ✅ Can it be written in one line? — No, layout components are multi-line by nature
6. ✅ Minimum code — Will follow YAGNI, no premature abstractions

**Auth Infrastructure** (Section V):
- ⚠️ AuthProvider is commented out in root layout — Phase 2 header needs `useAuthStore` for auth-state-aware controls. This must be resolved (either uncomment AuthProvider or use `client.ts` token getter directly). Flagged as prerequisite dependency.

**No violations requiring complexity tracking.**

**Gate status**: PASS with note — AuthProvider dependency must be resolved before or during Phase 2 implementation.

## Project Structure

### Documentation (this feature)

```text
specs/002-layout-navigation-design/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx               # ROOT: ensure AuthProvider is uncommented/wired
│   ├── (store)/
│   │   ├── layout.tsx           # NEW: storefront shell (Header + Footer wrapping children)
│   │   └── ...                  # Existing pages (login, register, etc. from Phase 1)
│   └── (admin)/
│       ├── layout.tsx           # NEW: admin shell (Sidebar + TopBar + content area)
│       └── ...                  # Phase 19+ admin pages
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # NEW: storefront header
│   │   ├── Footer.tsx           # NEW: storefront footer
│   │   ├── MobileNav.tsx        # NEW: hamburger full-screen overlay
│   │   ├── AdminSidebar.tsx     # NEW: admin panel sidebar
│   │   ├── AdminTopBar.tsx      # NEW: admin top bar with user info + logout
│   │   ├── Breadcrumbs.tsx      # NEW: admin content breadcrumbs
│   │   └── Logo.tsx             # NEW: site logo component (image or text fallback)
│   ├── stores/                  # REUSE: existing pattern from providers/
│   │   ├── CartStoreHydrator.tsx # NEW: hydrates cart count from server → client store
│   │   └── SettingsHydrator.tsx  # NEW: hydrates public settings from server → client store
│   └── ui/                      # EXISTING: shadcn primitives (add Sheet, Avatar, DropdownMenu if needed)
└── lib/
    └── stores/
        ├── auth.store.ts        # EXISTING (Phase 1)
        ├── cart.store.ts        # NEW: Zustand store with itemCount
        ├── settings.store.ts    # NEW: Zustand store with siteName, logoUrl, currencyCode
        └── wishlist.store.ts    # NEW: Zustand store with itemCount, fetchWishlist
```

**Structure Decision**: Single Next.js project with App Router route groups:
- `(store)` group for storefront layout (public + customer pages wrapped in header/footer)
- `(admin)` group for admin panel layout (sidebar + top bar + auth gate)
- Layout components live in `components/layout/`
- Zustand stores in `lib/stores/` (existing pattern)
- Hydrator components in `components/stores/` for server→client data transfer

## Complexity Tracking

> No violations to justify — Constitution Check passed with one note (AuthProvider dependency).
