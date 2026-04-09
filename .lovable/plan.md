

# Comprehensive End-to-End Audit: Bug Report and Fix Plan

## Audit Methodology
Reviewed every page, component, hook, database table, RLS policy, and data flow across all three roles (Customer, Cleaner, Admin). Cross-referenced DB schema with frontend code.

---

## Issues Found

### BUG 1: Express Booking does NOT apply coupon discount to actual booking cost
**File:** `src/pages/customer/ExpressBooking.tsx` line 95
**Problem:** `total_cost` is calculated as `service.rate_per_hour * service.min_duration` (the base price), ignoring the `couponDiscount` state. The `totalPrice` variable with discount is only used for display, not sent to DB.
**Fix:** Change line 95 to use `totalPrice` instead of `basePrice` in the insert.

### BUG 2: Express Booking does NOT apply offer discount to actual booking cost
**File:** `src/pages/customer/ExpressBooking.tsx` line 95
**Problem:** Same as above -- ActiveOffers and CouponCodeInput both write to `couponDiscount`, but only the display uses `totalPrice`. The DB insert uses `basePrice`.
**Fix:** Use `totalPrice` in the insert and in the navigation state.

### BUG 3: CouponCodeInput wraps itself in a card container, creating double card nesting
**File:** `src/components/CouponCodeInput.tsx` lines 55-77
**Problem:** `CouponCodeInput` renders its own `bg-card rounded-3xl p-4 shadow-soft border` container. But in both `ExpressBooking.tsx` (line 231) and `ScheduleBooking.tsx` (line 624), it's already inside a parent card container. This creates ugly double-nested card UI.
**Fix:** Remove the outer container from CouponCodeInput -- make it a bare input+button, let the parent control layout.

### BUG 4: ActiveOffers claims offer immediately on click (before booking is confirmed)
**File:** `src/components/ActiveOffers.tsx` lines 49-68
**Problem:** When a user clicks an offer in checkout, it immediately inserts into `offer_claims` and increments `claimed_count`. If the user abandons the booking, the offer is wasted. Should only claim after successful booking creation.
**Fix:** Remove the DB insert from `applyOffer`. Instead, pass the `offer.id` back up and let the booking flow claim it after successful insert.

### BUG 5: Coupon `used_count` is never incremented after successful booking
**File:** `src/pages/customer/ExpressBooking.tsx` and `ScheduleBooking.tsx`
**Problem:** When a coupon is applied and booking is created, the `used_count` on the coupon is never incremented. This means coupons can be used infinitely.
**Fix:** After successful booking insert, call `supabase.from('coupons').update({ used_count: coupon.used_count + 1 }).eq('code', appliedCode)`.

### BUG 6: Coin earning transaction type mismatch
**File:** `src/pages/customer/RateService.tsx` line 84 uses `type: 'earned'`
**File:** `src/pages/customer/Wallet.tsx` line 88 checks `tx.type === 'earn'`
**Problem:** Coins are inserted with type `'earned'` but the Wallet UI checks for `'earn'`. The arrow icon and +/- display will be wrong for earned coins.
**Fix:** Standardize to `'earned'` everywhere. Update Wallet to check `tx.type === 'earned'`.

### BUG 7: Referral reward uses fragile ID prefix matching
**File:** `src/pages/cleaner/Jobs.tsx` lines 237-240
**Problem:** Referral code is `CLEAN` + first 6 chars of user ID. The lookup does `LIKE '${userIdPrefix}%'` on `profiles.user_id`. UUID prefixes are not unique enough for reliable matching. Multiple users could match.
**Fix:** Use exact match: query `profiles` where `user_id` starts with the prefix, but also verify by reconstructing the expected code and comparing.

### BUG 8: `MyBookings` filter for "Scheduled" is wrong
**File:** `src/pages/customer/MyBookings.tsx` line 184
**Problem:** Filter checks `b.recurring !== 'none'` to identify scheduled bookings. But one-time scheduled bookings have `recurring = 'none'` too. The real distinction is whether `service_name` starts with "Scheduled:" vs "Express:".
**Fix:** Use `b.service_name?.toLowerCase().includes('scheduled')` for scheduled filter.

### BUG 9: Schedule page shows "Daily" frequency option in memory but not in code
**File:** `src/pages/customer/ScheduleBooking.tsx` lines 52-57
**Problem:** The memory says "Daily, Weekly, etc." but the code only has `none`, `weekly`, `fortnightly`, `monthly`. No `daily` option exists. This is a feature gap mentioned in the user's earlier description.
**Status:** Not a bug per se, but a missing feature. Will skip for now.

### BUG 10: Cleaner Jobs page fetches ALL bookings (not just relevant ones)
**File:** `src/pages/cleaner/Jobs.tsx` line 73
**Problem:** Query fetches `select('*').order('created_at', { ascending: false }).limit(500)` with no filter. This returns ALL bookings in the system. For pending jobs this is intentional (to show available pool), but it's inefficient and will fail at scale.
**Fix:** Split into two queries: one for pending (unassigned) jobs and one for the cleaner's own jobs. This also fixes potential RLS issues.

### BUG 11: Wallet transaction icon logic wrong for referral type
**File:** `src/pages/customer/Wallet.tsx` lines 88-94
**Problem:** Only checks for `'earn'` type for the green icon. But referral bonuses use type `'referral'` (set in Jobs.tsx line 243). These show with the wrong (spend) icon.
**Fix:** Check `['earned', 'referral'].includes(tx.type)` for the earning icon, and everything else as spend.

### BUG 12: Cleaner Schedule page only shows first 5 upcoming jobs
**File:** `src/pages/cleaner/Schedule.tsx` line 134
**Problem:** `upcomingJobs.slice(0, 5)` truncates the list. For recurring weekly bookings, there could be 12+ instances. User expects to see all.
**Fix:** Remove the `.slice(0, 5)` limit or add a "show all" toggle.

---

## File Changes Summary

| Action | File | Fix |
|--------|------|-----|
| Edit | `src/pages/customer/ExpressBooking.tsx` | Use `totalPrice` in DB insert; increment coupon `used_count` after booking |
| Edit | `src/pages/customer/ScheduleBooking.tsx` | Increment coupon `used_count` after booking |
| Edit | `src/components/CouponCodeInput.tsx` | Remove outer card wrapper; expose coupon code for parent to use |
| Edit | `src/components/ActiveOffers.tsx` | Don't claim offer on click; pass offer ID back; claim after booking success |
| Edit | `src/pages/customer/Wallet.tsx` | Fix type checks: `'earned'` and `'referral'` as earning types |
| Edit | `src/pages/customer/MyBookings.tsx` | Fix scheduled filter to check service_name instead of recurring |
| Edit | `src/pages/cleaner/Schedule.tsx` | Remove 5-job limit on upcoming jobs |
| Edit | `src/pages/cleaner/Jobs.tsx` | Improve referral code lookup reliability |

No database migrations needed.

