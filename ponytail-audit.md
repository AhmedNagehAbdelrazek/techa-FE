# Ponytail Audit — techa-FE

> Lazy senior dev lens. If it doesn't need to exist, it doesn't. If stdlib/native does it, use that. If it's one line, write one line.

---

## 🚩 Blockers (ship these first)

### 1. Phase 018 — tree-shake + build verification (unfinished)

**What**: The last two steps of the current phase plan. Literally just deleting dead code and running `pnpm run build`.

**Action**:
- [ ] Delete dead `src/services/` dir (3 files, 0 imports — legacy pre-RQ Axios setup)
- [ ] Delete empty dirs: `src/features/`, `src/hooks/`, `src/types/`, `src/lib/utils/`
- [ ] Run `pnpm run build` and fix any issues

---

## 🧹 Low-hanging fruit (native platform features, 1-liners)

### 2. Route-level `loading.tsx` files — zero cost, big UX win

**Next.js native.** Drop a one-liner in each route group:
```tsx
export { default } from "@/components/ui/LoadingState";  // ponytail: already exists
```

**Missing from** every route. Start with:
- `src/app/(store)/loading.tsx`
- `src/app/(auth)/loading.tsx`
- `src/app/admin/(protected)/loading.tsx`

Each route group shares one skeleton — the child page's Suspense boundary handles the rest.

### 3. Admin `not-found.tsx`

**Problem**: Root `not-found.tsx` exists, but admin section has none. A 404 in `/admin/anything` shows the storefront layout. Confusing.

**Action**: Drop into `src/app/admin/(protected)/not-found.tsx`:
```tsx
import { AdminNotFound } from "@/components/admin/AdminNotFound";  // ponytail: or just inline it
```

Actually even simpler — one file, inline component. No new component file needed.

### 4. `generateMetadata` for SEO

**Next.js native.** Currently only 3 of ~35 pages have it. Pages with zero dynamic data need at minimum:
```ts
export const metadata = { title: "Page Name — TechA" };
```

Priority pages: `/cart`, `/checkout`, `/orders`, `/account`, `/wishlist`, `/notifications`, `/admin/*`

### 5. Search page query param handling

**Gap**: `/search` likely needs `?q=` from URL searchParams. Verify it reads `searchParams.q` and triggers a refetch.

---

## 🧩 Missing features (ask before building — YAGNI check)

### 6. Admin review moderation

**Exists**: Customers write reviews (ReviewList.tsx, product page).
**Missing**: Admin can't approve/reject/delete reviews. No `/admin/reviews` page.

**Minimum viable**: One page. Table of reviews with status filter + approve/reject buttons. Reuse `adminRequest` + existing table patterns. ~50 lines.

### 7. Static pages (contact / about / terms)

**Standard e-commerce**. If the business needs them, they're trivial:
- One `page.tsx` per route
- Content from settings (dynamic) or hardcoded
- Routes: `/contact`, `/about`, `/terms`

**YAGNI check**: Do we have a contact email? A return policy? If not, skip.

---

## 💀 Dead code to delete (zero risk)

| Path | Why |
|---|---|
| `src/services/api.ts` | 1-line re-export of dead client |
| `src/services/auth.ts` | Empty file |
| `src/services/client.ts` | Legacy Axios setup — superseded by `src/lib/api/Request.ts` |
| `src/features/` | Empty dir |
| `src/hooks/` | Empty dir |
| `src/types/` | Empty dir |
| `src/lib/utils/` | Empty dir |

---

## ✅ Already good (no action needed)

- State management: Zustand + RQ is the right split
- Admin permissions: granular, per-resource. Good.
- Error/empty states: `ErrorState`/`EmptyState` reused everywhere. Good.
- Skeleton exports: every admin component has one. Good.
- RTL: root layout handles it. Good.
- No unnecessary npm packages. Good.
- No API routes in Next.js (pure frontend). Correct decision.
- Component colocation by domain. Clean.

---

## 📋 Suggested triage order

1. **Blockers**: Delete dead code, run build
2. **loading.tsx** (3 files, 1 line each, instant UX improvement)
3. **admin not-found.tsx** (1 file, ~20 lines)
4. **generateMetadata** (tack during normal page work)
5. **Review moderation** / **static pages** (only if needed — ask first)
