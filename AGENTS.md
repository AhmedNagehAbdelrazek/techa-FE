<!-- SPECKIT START -->

## Pre-Flight Checklist (MANDATORY — run before EVERY code decision)

Before writing any code, answering any task, or making any decision — run this checklist in order. Stop at the first rule that applies and act on it. Do not continue down the list.

```
1. Does this need to exist?       → If no clear requirement drives it, skip it entirely. (YAGNI)
2. Does the stdlib do it?         → Use it. No import needed.
3. Is it a native platform API?   → Use it. (Node built-ins, browser APIs, Next.js built-ins)
4. Is it an installed dependency? → Use it. Check package.json first.
5. Can it be written in one line? → Write one line.
6. Only then: write the minimum code that makes it work. Nothing more.
```

This checklist is not optional and is not a suggestion. It runs before every function, every file, every component, every utility. If you catch yourself about to write something without having run this checklist first, stop and run it now.

### What this looks like in practice

| Situation | Wrong | Right |
|---|---|---|
| Need to capitalize a string | Install `lodash` | `str[0].toUpperCase() + str.slice(1)` |
| Need to generate a UUID | Write a UUID function | `crypto.randomUUID()` (Node 14.17+) |
| Need to check if array is empty | `_.isEmpty(arr)` | `arr.length === 0` |
| Need to deep clone an object | Write a recursive clone | `structuredClone(obj)` (Node 17+) |
| Need to parse a URL | Install `url-parse` | `new URL(str)` |
| Need to format a date | Install `moment` | `new Intl.DateTimeFormat(...)` or `date.toLocaleDateString()` |
| Need to sleep/delay | Write a sleep utility | `await new Promise(r => setTimeout(r, ms))` |
| Need to flatten an array one level | Write a reduce | `arr.flat()` |
| Need to get unique values | Write a filter loop | `[...new Set(arr)]` |
| Need to read an env variable | Abstract it into a helper | `process.env.VAR_NAME` |

### The only valid reasons to add a new dependency

- The task is genuinely complex and the library solves a hard, well-defined problem (e.g. parsing multipart form data, JWT signing, bcrypt hashing)
- The library is already in `package.json` — it costs nothing to use it
- Writing it from scratch would take more than 20 lines and is not core business logic

If none of these apply, do not add the dependency. Ask first.

## Current Plan

**Feature**: Customer Account & Addresses
**Branch**: `012-customer-account-addresses`
**Plan file**: `specs/012-customer-account-addresses/plan.md`
**Spec file**: `specs/012-customer-account-addresses/spec.md`

### Key Artifacts

- [spec.md](specs/012-customer-account-addresses/spec.md) — Feature specification
- [plan.md](specs/012-customer-account-addresses/plan.md) — Implementation plan
- [research.md](specs/012-customer-account-addresses/research.md) — Research decisions
- [data-model.md](specs/012-customer-account-addresses/data-model.md) — Data model
- [quickstart.md](specs/012-customer-account-addresses/quickstart.md) — Setup guide
- [contracts/account-api.md](specs/012-customer-account-addresses/contracts/account-api.md) — API contracts

### Implementation Order

1. Update `src/app/(store)/account/page.tsx` — Convert to tabbed layout with AccountTabs, integrate ProfileForm and AccountAddresses
2. Create `src/components/store/AccountTabs.tsx` — URL-driven tab navigation (Profile / Addresses)
3. Update `src/components/auth/ProfileForm.tsx` — Add avatar upload (file input → uploadFile → updateMe)
4. Create `src/components/store/AccountAddressForm.tsx` — Address create/edit form with delivery zone dropdown
5. Create `src/components/store/AccountAddresses.tsx` — Address list with Edit, Delete, Set as Default actions
6. Verify: build passes with `npm run build`

### Critical Patterns (enforced)

- **No new API wrappers needed**: All address and profile API functions already exist in `src/lib/api/addresses.ts` and `src/lib/api/auth.ts`
- **No new types needed**: `Address`, `DeliveryZone`, `User`, `UpdateProfilePayload` already exist
- **Auth guard**: Account page uses `<ProtectedRoute>` wrapper
- **Tab state in URL**: Use `?tab=profile|addresses` via `useSearchParams` + `useRouter` — not Zustand
- **Forms**: Use `react-hook-form` + `zod` with `@hookform/resolvers`
- **Avatar upload**: Two-step: `uploadFile()` (from payments.ts) → URL → `updateMe({ avatar_url })`
- **Address limit**: 10 max — hide "Add" button and show message when limit reached
- **Optimistic UI**: Address list updates immediately on add/edit/delete/set-default with rollback on failure
- **Deleting default**: Block client-side with prompt to set another as default first
- **Error handling**: sonner toast on user-initiated actions; console.error on background failures
- **Accessibility**: aria-labels, keyboard nav, RTL-compatible layout

### Completed (Phases 7-11, from prior features)

- Customer Cart, Checkout, Order History, Wishlist, Notifications, and prior features completed.

<!-- SPECKIT END -->
