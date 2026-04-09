

# Clean Fit -- Bug Fixes, Training Gate, and Admin Enhancements

## Phase 1: Fix Default Name Race Condition (All Views)

**Problem**: New users see "Emma Thompson" or "Alex Morgan" until page refresh because `AuthContext` sets `user` with a hardcoded name before the profile is synced.

**Fix**: In `AuthContext.tsx`, after `syncProfileRecord` completes, re-fetch the profile and update the `user` state with the actual saved name. Also update the `verifyOtp` flow to use the entered name from onboarding rather than the static `roleNames` map. Add a listener so that when `profiles` table updates for the current user, the `user` state refreshes automatically.

**Files**: `src/contexts/AuthContext.tsx`, `src/contexts/auth-helpers.ts`

---

## Phase 2: Mandatory Training Gate for Cleaners

**Problem**: After onboarding, cleaners go straight to the dashboard. They should be forced to complete all training modules before accessing the app.

**Fix**:
- In `ProtectedRoute.tsx`, after onboarding check, add a second gate: query `training_modules` count vs `training_progress` completed count for the cleaner. If not all modules are done and role is `cleaner`, render an inline Training screen instead of children.
- Create a new `CleanerTrainingGate.tsx` component (embedded version of the Training page) that shows the modules and marks them complete. Once all are done, set `cleaners.verified = true` and allow through.
- Cleaner onboarding `handleSave` should NOT set `onboarding_completed` until the cleaner finishes training -- OR keep onboarding separate and add a `training_completed` check in `ProtectedRoute`.

**Files**: `src/components/ProtectedRoute.tsx`, new `src/components/CleanerTrainingGate.tsx`, `src/pages/enrol/Training.tsx` (reuse logic)

---

## Phase 3: Cleaner Job Cancellation Loop

**Problem**: When a cleaner cancels/declines an accepted job, it should revert to `pending` with `cleaner_id = null`, and the customer's SearchingCleaner screen should detect this and go back to "searching" phase.

**Fix**:
- The cleaner decline logic already exists in `Jobs.tsx` (lines 243-248) but uses two separate mutations. Consolidate into a single update: `{ status: 'pending', cleaner_id: null, cleaner_name: null, cleaner_avatar: null }`.
- In `SearchingCleaner.tsx`, the realtime listener should also handle the case where `cleaner_id` becomes `null` again -- reset to `phase: 'searching'` and clear `assignedCleaner`.
- Add a "Cancel Request" button on the searching phase with a reason selector (Too slow, Changed mind, Extra charges, Other) before confirming cancellation.

**Files**: `src/pages/cleaner/Jobs.tsx`, `src/pages/customer/SearchingCleaner.tsx`

---

## Phase 4: Admin Dashboard -- Map Toggle Z-Index Fix

**Problem**: The map toggle (Requests/Cleaners) is hidden behind the white scrollable content sheet.

**Fix**: In `admin/Dashboard.tsx`, the toggle container at line 98 has `z-20` but the content sheet at line 119 has `z-10`. The sticky map container itself needs a higher stacking context. Change the map's parent `sticky` div to `z-[5]` and ensure the toggle overlay inside it uses `z-30`. The content sheet stays at `z-10`.

**Files**: `src/pages/admin/Dashboard.tsx`

---

## Phase 5: Admin Customers & Cleaners Pages -- Mobile-Friendly Redesign

**Problem**: Admin can't see customer list properly; needs filters and better mobile UI. Cleaner page needs ranking/filter capabilities.

**Fix -- Customers**:
- Replace the desktop `Table` component with mobile-friendly card layout
- Each card shows: name, phone, booking count, total spent, most-used service
- Add filter/sort options: by bookings count, total spent, join date
- Profile drawer already exists -- enhance with service breakdown chart

**Fix -- Cleaners**:
- Replace `Table` with card layout matching customer style
- Add filters: sort by rating, jobs completed, earnings
- Show certification badge, rating stars, job count prominently
- Add "Performance Rankings" section at top: Top Rated, Most Jobs, Needs Attention

**Files**: `src/pages/admin/Customers.tsx`, `src/pages/admin/Cleaners.tsx`

---

## Phase 6: Admin Revenue Analytics

**Problem**: No per-area or per-service revenue breakdown.

**Fix**: Enhance `admin/Dashboard.tsx` or create a dedicated section in `admin/Reports.tsx`:
- Revenue by service type (bar chart)
- Revenue by area/postcode (grouped)
- Total revenue, average monthly revenue, month-over-month growth
- Use existing booking data grouped by `service_name` and `address_postcode`

**Files**: `src/pages/admin/Reports.tsx`

---

## Phase 7: End-to-End UI Audit & Consistency Pass

- Login card z-index (already partially fixed, verify)
- Logout from all roles navigates to `/` (verify admin, cleaner, customer)
- Floating active booking tab clearance on all screens
- Remove gray overlay on cleaner/admin maps (verify `bg-gradient` opacity)
- Consistent typography, spacing, border-radius across all three role views

**Files**: Multiple layout and page files

---

## Phase 8: Generate Final Audit Excel Report

After all fixes, generate a comprehensive Excel file with sheets:
1. **Features Implemented** -- all features with status
2. **Bugs Fixed** -- each bug, root cause, solution
3. **Recommendations** -- future improvements for production readiness

**Output**: `/mnt/documents/CleanFit_Final_Audit.xlsx`

---

## Summary of File Changes

| File | Change |
|------|--------|
| `AuthContext.tsx` | Fix name race condition with profile re-fetch |
| `ProtectedRoute.tsx` | Add training completion gate for cleaners |
| New: `CleanerTrainingGate.tsx` | Inline training wizard before dashboard access |
| `SearchingCleaner.tsx` | Handle cleaner cancellation, add cancel reason selector |
| `Jobs.tsx` | Fix decline mutation to single update |
| `admin/Dashboard.tsx` | Fix map toggle z-index |
| `admin/Customers.tsx` | Mobile card layout with filters |
| `admin/Cleaners.tsx` | Card layout with ranking/filters |
| `admin/Reports.tsx` | Revenue by service/area analytics |
| Multiple UI files | Consistency audit fixes |

