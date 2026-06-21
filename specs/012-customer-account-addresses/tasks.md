# Tasks: Customer Account & Addresses

> Generated from `plan.md` implementation order.
> Each task is a discrete, testable unit of work.

---

## Task 1: Create `AccountTabs.tsx`

**File**: `src/components/store/AccountTabs.tsx`

**Description**: URL-driven tab navigation component with two tabs: Profile and Addresses. Reads active tab from `?tab=` search param via `useSearchParams`. No Zustand — URL only.

**Acceptance Criteria**:
- `"use client"` directive
- Imports `useSearchParams` from `next/navigation`
- Imports `useRouter` from `next/navigation` for tab switching
- Renders two tab buttons: "Profile" (`?tab=profile`) and "Addresses" (`?tab=addresses`)
- Default tab is `profile` when no `?tab=` param present
- Active tab has visual distinction (`aria-selected="true"`, pointer-events-none)
- Uses `cn()` for conditional styling
- Wraps children and renders only the active tab's content
- RTL-compatible layout

---

## Task 2: Update `account/page.tsx` — Tabbed Layout

**File**: `src/app/(store)/account/page.tsx`

**Description**: Convert the existing single-section account page to a tabbed layout using `AccountTabs`.

**Acceptance Criteria**:
- Removes direct `ProfileForm` rendering
- Wraps content in `<AccountTabs>` with both Profile and Addresses content
- Profile tab shows `<ProfileForm>` and `<LogoutButton>`
- Addresses tab shows `<AccountAddresses>`
- Keep `<ProtectedRoute>` wrapper
- Keep responsive container (`mx-auto max-w-lg`)

---

## Task 3: Update `ProfileForm.tsx` — Avatar Upload

**File**: `src/components/auth/ProfileForm.tsx`

**Description**: Add avatar upload to the existing profile form. Two-step flow: (1) upload file to `/api/upload` via `uploadFile()`, (2) pass returned URL to `updateMe({ avatar_url })`.

**Acceptance Criteria**:
- Imports `uploadFile` from `@/lib/api/payments`
- Shows current avatar (from `storeUser.avatarUrl`) or a placeholder
- File input (hidden) triggered by an "Upload" button/icon
- Accepts JPEG, PNG, WebP, GIF (matches backend constraints)
- Max file size 20MB — shows toast error if exceeded
- Shows loading spinner during upload
- On successful upload: immediately update the avatar preview (optimistic)
- Sends `avatar_url` as part of `updateMe` call along with name/phone
- On upload error: shows toast error, reverts preview
- Avatar preview shows as `<img>` with `alt="Your avatar"`

---

## Task 4: Create `AccountAddressForm.tsx`

**File**: `src/components/store/AccountAddressForm.tsx`

**Description**: Address create/edit form with delivery zone dropdown. Uses `react-hook-form` + `zod`.

**Acceptance Criteria**:
- `"use client"` directive
- Props: `onSubmit(addressData)`, `initialData?: Address`, `onCancel()`, `zones: DeliveryZone[]`
- Fields: `full_name` (required), `phone` (required), `label` (optional), `building` (optional), `apartment` (optional), `street` (required), `city` (required), `zone_id` (required, dropdown from zones), `landmark` (optional), `notes` (optional)
- Zones dropdown populated from props — shows zone name, filters by region
- Zod schema validates required fields
- Pre-fills fields when `initialData` provided (edit mode)
- Submit button shows loading state, disabled during submission
- Cancel button calls `onCancel`
- Uses existing `Input`, `FormField`, `Button` components from `@/components/forms/`

---

## Task 5: Create `AccountAddresses.tsx`

**File**: `src/components/store/AccountAddresses.tsx`

**Description**: Address list with Edit, Delete, Set as Default actions. Fetches addresses on mount, manages optimistic UI.

**Acceptance Criteria**:
- `"use client"` directive
- Fetches addresses via `listAddresses()` on mount (loading state while fetching)
- Fetches delivery zones via `getDeliveryZones()` on mount
- Each address card shows: `label`, `full_name`, `street`, `city`, default badge
- Each card has: Edit button, Delete button, Set as Default button (hidden if already default)
- "Add New Address" button at top — hidden when `addresses.length >= 10`, shows message "Maximum 10 addresses reached"
- Clicking "Add" shows `AccountAddressForm` in inline edit mode
- Clicking "Edit" shows `AccountAddressForm` pre-filled with address data
- Delete shows `AlertDialog` confirmation before calling `deleteAddress(id)`
- Set as Default calls `setDefaultAddress(id)` — optimistic update: mark clicked address as default, demark previous
- Deleting default address shows prompt: "Set another address as default first" — does not allow deletion
- Optimistic UI for all mutations: update local state immediately, roll back on error
- Empty state: "No addresses saved yet. Add one to get started."
- Error state: "Failed to load addresses" with retry button
- Uses `toast` for success/error on user-initiated actions
- Uses `console.error` for background fetch failures
- Imports: `listAddresses`, `createAddress`, `updateAddress`, `setDefaultAddress`, `deleteAddress` from `@/lib/api/addresses`

---

## Task 6: Verify Build

**Command**: `npm run build`

**Description**: Ensure the project builds without errors after all changes.

**Acceptance Criteria**:
- `npm run build` exits with code 0
- No TypeScript errors
- No ESLint errors
