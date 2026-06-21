# Implementation Plan: Customer Notifications

**Branch**: `011-customer-notifications` | **Date**: 2026-06-21 | **Spec**: `specs/011-customer-notifications/spec.md`

**Input**: Feature specification from `/specs/011-customer-notifications/spec.md`

## Summary

Add customer notification infrastructure: a bell icon in the storefront header with unread count badge + dropdown panel showing 5 most recent notifications, and a dedicated `/notifications` page with paginated full list, mark-as-read (individual + all), empty/error/loading states. WCAG 2.1 Level AA compliance. No real-time updates — poll-on-load only.

## Technical Context

**Language/Version**: TypeScript 5 (strict: true)

**Framework**: Next.js 15 (App Router, `"use client"` based)

**Primary Dependencies**: React 19, Tailwind CSS 4, shadcn/ui (badge, dropdown-menu, skeleton, button, separator), Radix UI, TanStack React Query 5, Zustand, sonner, lucide-react (Bell icon)

**Storage**: N/A — fully API-driven (no local notification persistence)

**Testing**: Vitest 2 + @testing-library/react + @testing-library/jest-dom

**Target Platform**: Web — Next.js SSR + client-side rendering (Arabic-first, RTL)

**Performance Goals**: Badge reflects server count within 2s of page load (SC-001); dropdown opens within 1 click (SC-002); mark-all-as-read updates badge within 1s (SC-003); notifications page loads within 2s (SC-004)

**Constraints**: WCAG 2.1 Level AA (FR-015); RTL layout for Arabic; 20 items per page; max ~1000 notifications per customer; "99+" badge ceiling; bell hidden when unauthenticated

**Scale/Scope**: 2 UI surfaces (header bell + /notifications page), 3 API calls (list, mark-read, mark-all-read), no WebSocket/polling beyond page load

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Justification |
|------|--------|---------------|
| Does this need to exist? | ✅ PASS | Clearly specified feature (Phase 11 of frontend-spec.md) with 2 user stories, 15 FRs, acceptance scenarios |
| Does stdlib do it? | ✅ PASS | Not applicable — feature requires UI components and API integration, not algorithmic |
| Is it a native platform API? | ✅ PASS | No — requires external API calls via existing Request.ts client |
| Is it an installed dependency? | ✅ PASS | All needed dependencies already present: shadcn/ui, sonner, lucide-react, TanStack Query |
| Can it be written in one line? | ✅ PASS | No — multi-component feature with pages, API wrappers, types, and accessibility |
| No new dependency without justification | ✅ PASS | No new dependencies needed; uses existing shadcn/ui components + lucide-react Bell icon |
| Follows existing patterns | ✅ PASS | Uses Request.ts API pattern, ProtectedRoute, `"use client"` components, cn() class merging, sonner toasts |

**No violations.** The feature maps cleanly onto existing architecture patterns.

## Project Structure

### Documentation (this feature)

```text
specs/011-customer-notifications/
├── plan.md              # This file
├── research.md          # Phase 0 — research decisions
├── data-model.md        # Phase 1 — types & data structures
├── quickstart.md        # Phase 1 — setup guide
├── contracts/           # Phase 1 — API contracts
│   └── notifications-api.md
└── tasks.md             # Phase 2 — generated tasks (not created by /speckit.plan)
```

### Source Code

```text
src/
├── lib/
│   ├── types/
│   │   └── notification.ts    # Notification, NotificationsListResponse, NotificationsQueryParams
│   └── api/
│       └── notifications.ts   # getNotifications, markAsRead, markAllAsRead
├── components/
│   ├── ui/
│   │   ├── popover.tsx        # (if created via shadn CLI for rich dropdown)
│   │   └── scroll-area.tsx    # (if created via shadn CLI for notification list)
│   ├── store/
│   │   ├── NotificationBell.tsx     # Bell icon + unread badge in header
│   │   ├── NotificationDropdown.tsx # Rich dropdown panel (5 recent items)
│   │   └── NotificationList.tsx     # Full paginated list (notifications page)
│   └── layout/
│       └── Header.tsx          # Add NotificationBell into existing nav
└── app/
    └── (store)/
        └── notifications/
            └── page.tsx        # /notifications — full list page
```

**Structure Decision**: Single-project Next.js app (existing pattern). Follows existing `src/lib/types/`, `src/lib/api/`, `src/components/store/`, `src/components/ui/` layout. New store component `NotificationBell` is added to `Header.tsx`.

## Complexity Tracking

No constitution violations — section intentionally empty.

## Implementation Order

1. Create `src/lib/types/notification.ts` — type definitions
2. Create `src/lib/api/notifications.ts` — API wrapper functions
3. Create `src/components/store/NotificationBell.tsx` — bell icon + badge
4. Create `src/components/store/NotificationDropdown.tsx` — dropdown panel with 5 recent notifications
5. Create `src/components/store/NotificationList.tsx` — full paginated list component
6. Create `src/app/(store)/notifications/page.tsx` — notifications page
7. Update `src/components/layout/Header.tsx` — integrate NotificationBell
8. Add shadcn/ui popover and scroll-area if needed (decide in implementation)
