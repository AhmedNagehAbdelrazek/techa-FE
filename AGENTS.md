<!-- SPECKIT START -->

## Current Plan

**Feature**: Layout, Navigation & Design System
**Branch**: `002-layout-navigation-design`
**Plan file**: `specs/002-layout-navigation-design/plan.md`
**Spec file**: `specs/002-layout-navigation-design/spec.md`

### Key Artifacts

- [spec.md](specs/002-layout-navigation-design/spec.md) — Feature specification (with clarifications)
- [plan.md](specs/002-layout-navigation-design/plan.md) — Implementation plan
- [research.md](specs/002-layout-navigation-design/research.md) — Research decisions
- [data-model.md](specs/002-layout-navigation-design/data-model.md) — Data model
- [quickstart.md](specs/002-layout-navigation-design/quickstart.md) — Setup guide
- [contracts/layout-api.md](specs/002-layout-navigation-design/contracts/layout-api.md) — API contracts

### Implementation Order

1. Add shadcn components: `npx shadcn@latest add sheet avatar dropdown-menu separator input`
2. Create `src/lib/stores/settings.store.ts` — Zustand store for public site settings
3. Create `src/lib/stores/cart.store.ts` — Zustand store for cart item count
4. Create `src/lib/stores/wishlist.store.ts` — Zustand store for wishlist item count
5. Create `src/components/layout/Logo.tsx` — Site logo (image or text fallback)
6. Create `src/components/layout/Header.tsx` — Storefront header with search, cart badge, wishlist badge, auth controls
7. Create `src/components/layout/Footer.tsx` — Storefront footer with links, social, copyright
8. Create `src/components/layout/MobileNav.tsx` — Hamburger menu with full-screen Sheet overlay
9. Create `src/components/stores/SettingsHydrator.tsx` — Server→client settings hydration
10. Create `src/app/(store)/layout.tsx` — Storefront layout shell (Header + Footer wrapping children)
11. Create `src/components/layout/AdminSidebar.tsx` — Admin sidebar with 11 nav links
12. Create `src/components/layout/AdminTopBar.tsx` — Admin top bar with user info + logout
13. Create `src/components/layout/Breadcrumbs.tsx` — Route-based breadcrumb trail
14. Create `src/app/(admin)/layout.tsx` — Admin layout shell (sidebar + top bar + breadcrumbs + auth gate)
15. Verify: AuthProvider is uncommented in root layout (prerequisite from Phase 1)

<!-- SPECKIT END -->
