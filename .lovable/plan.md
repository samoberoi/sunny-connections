

# Fix Recurring Job Display, Admin Coupon CRUD, Coupon Pop-ups, and Cleaner Job Flow

## Issues to Fix

1. **Cleaner Upcoming tab only shows 2 days** — The filter `upcomingFuture` uses `b.date > todayStr` which is correct, but the query `limit(200)` and the filter only include `['assigned', 'en-route']` statuses. The real issue is that the recurring booking generator (cron) likely only creates a few days ahead. We need to ensure all generated future bookings appear, and sort them by date ascending.

2. **Admin Coupons page has no working Create/Edit/Toggle** — The Create button does nothing, the Switch toggle has no `onCheckedChange` handler, and the `useCoupons` hook only fetches active coupons (admins need all).

3. **Coupons should show as customer pop-ups and be applicable during payment** — Currently only `offers` table powers pop-ups. Coupons need similar treatment: show as pop-up on app load, and allow coupon code entry during Express/Schedule booking payment step.

4. **Cleaner job detail flow cleanup** — The flow already has Map → Profile → Call/Chat → "I'm On My Way" + Cancel → OTP. This is mostly correct but needs minor polish: ensure the "I'm on the way" and "Cancel" buttons are clearly visible as the primary action pair when a job is first accepted.

---

## Changes

### 1. Fix Upcoming Jobs Sort & Display (`src/pages/cleaner/Jobs.tsx`)
- Sort `upcomingFuture` by `b.date` ascending so nearest dates come first
- Increase query limit from 200 to 500 to capture more future recurring bookings
- Add date grouping headers (e.g., "Mon 14 Apr", "Tue 15 Apr") in the Upcoming tab for clarity

### 2. Full Admin Coupon CRUD (`src/pages/admin/Coupons.tsx` + `src/hooks/useCoupons.ts`)
- **useCoupons hook**: Remove `.eq('active', true)` filter so admins see all coupons; add `useAllCoupons()` variant
- **Create Coupon**: Add a dialog with form fields: code, description, discount_percent, max_uses, expires_at. Insert into `coupons` table.
- **Toggle Active/Inactive**: Wire `Switch onCheckedChange` to update `coupons.active` in DB
- **Edit/Delete**: Optional edit button to modify coupon details

### 3. Coupon Pop-up for Customers (`src/pages/customer/Home.tsx`)
- Query active coupons alongside offers on Home page load
- Show unclaimed coupons as pop-up modal (similar to offer pop-up)
- Store claimed coupon codes in `localStorage` for use at checkout
- Customer can dismiss or claim the coupon

### 4. Coupon Code at Checkout (`src/pages/customer/ExpressBooking.tsx` + `src/pages/customer/ScheduleBooking.tsx`)
- Add a "Have a coupon?" input field in the payment step
- Validate coupon code against `coupons` table (active, not expired, under max_uses)
- Apply discount_percent to total_cost before booking creation
- Increment `used_count` on the coupon after successful booking

### 5. Cleaner Job Detail Flow Polish (`src/pages/cleaner/Jobs.tsx`)
- When status is `assigned`: show Map, then customer profile card with Call/Chat, then prominent "I'm On My Way" button + "Cancel" below it — already mostly done, just ensure the action buttons are below the profile card and above everything else
- Minor: no functional changes needed, the flow is correct

---

## File Changes

| Action | File | Description |
|--------|------|-------------|
| Edit | `src/hooks/useCoupons.ts` | Add `useAllCoupons()` for admin, keep `useCoupons()` for active only |
| Edit | `src/pages/admin/Coupons.tsx` | Create coupon dialog, toggle switch handler, full CRUD |
| Edit | `src/pages/customer/Home.tsx` | Add coupon pop-up alongside offers |
| Edit | `src/pages/customer/ExpressBooking.tsx` | Add coupon code input in payment step with validation |
| Edit | `src/pages/customer/ScheduleBooking.tsx` | Add coupon code input in payment step with validation |
| Edit | `src/pages/cleaner/Jobs.tsx` | Sort upcoming by date asc, increase limit, add date group headers |

No database migrations needed — `coupons` table already exists with all required columns.

