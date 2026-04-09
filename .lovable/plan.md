

# Comprehensive Regression Test Report -- CleanFit App

All screens across Customer, Cleaner, and Admin roles reviewed. Below are the findings organized by severity.

---

## CRITICAL BUGS (5)

### C1: Wallet coin description inconsistency
**File**: `src/pages/customer/Wallet.tsx` line 71 vs `src/pages/customer/RateService.tsx` line 69
- Wallet says "Earn 10 coins every time you rate" and "100 coins = £5 off"
- RateService awards `Math.floor(total_cost / 5)` coins (1 coin per £5 spent), not 10 per rating
- CoinBalance component shows "Worth £X" using `balance / 10` (10 coins = £1)
- Three conflicting coin valuations: Wallet says 100:£5, CoinBalance says 10:£1, ScheduleBooking uses 10:£1
- **Fix**: Align all text to "1 coin per £5 spent, 10 coins = £1 discount"

### C2: Coin redemption math bug in ScheduleBooking
**File**: `src/pages/customer/ScheduleBooking.tsx` line 163
- `coinDiscount = useCoins ? Math.min(coinBalance, preCoinCost * 10) : 0` -- this caps coins at `preCoinCost * 10` which is WRONG
- If preCoinCost is £50, it allows up to 500 coins. But it should cap at `preCoinCost * 10` only to prevent negative totals
- Actually the issue is the opposite: it should be `Math.min(coinBalance, preCoinCost * 10)` to ensure coinPoundValue never exceeds preCoinCost. This is actually correct math, but the DISPLAY text in Wallet contradicts (100 coins = £5, vs code says 10 coins = £1)
- **Fix**: Standardize the ratio across all files

### C3: Express Booking missing payment method and referral code
**File**: `src/pages/customer/ExpressBooking.tsx` line 103-107
- ScheduleBooking has `payment_method` and `referral_code` fields in checkout (step 6)
- ExpressBooking inserts booking WITHOUT `payment_method` or `referral_code` columns
- Result: Express bookings always default to 'card', user has no choice
- **Fix**: Add payment method selection and optional referral code to ExpressBooking confirm screen

### C4: Admin cannot create new cleaners or customers
- The admin panel shows customer/cleaner lists and can delete them
- But there is NO "Add Customer" or "Add Cleaner" button in admin Customers or Cleaners pages
- Admin can only manage existing users, not create new ones
- **Fix**: Add "Invite Cleaner" and "Invite Customer" flows in admin pages

### C5: ReferralCard shows hardcoded "0 referrals" and "£0.00 credit"
**File**: `src/components/ReferralCard.tsx` lines 81-86
- These values are hardcoded, not fetched from the database
- There is no `referrals` table or tracking mechanism for completed referral conversions
- The referral code on bookings (`referral_code` column) is never validated or processed
- **Fix**: Create referral tracking (check `referral_code` on bookings, award coins on first completed booking by referred user)

---

## HIGH SEVERITY (6)

### H1: Notification insert fails for cleaner-to-customer notifications
**File**: Multiple places (Jobs.tsx line 104-108, SearchingCleaner cancellation)
- RLS policy: `WITH CHECK (auth.uid() = user_id)` -- a cleaner inserting a notification for a CUSTOMER will fail because `auth.uid()` != customer's `user_id`
- Same issue in `Leaves.tsx` line 58-62: admin inserting notification for customer
- This silently fails and notifications are never actually delivered
- **Fix**: Change notifications INSERT policy to allow authenticated users to insert for any user, OR use a database function with SECURITY DEFINER

### H2: `hasArrived` state not persisted in cleaner Jobs
**File**: `src/pages/cleaner/Jobs.tsx` line 36
- If cleaner refreshes page after tapping "I've Arrived" but before OTP verification, `hasArrived` resets to `false`
- Cleaner sees "I'm On My Way" again instead of OTP input
- **Fix**: Derive `hasArrived` from booking status or persist in sessionStorage

### H3: ActiveBooking auto-redirect to rate page has no delay/confirmation
**File**: `src/pages/customer/ActiveBooking.tsx` lines 57-59
- When cleaner marks job complete, customer is immediately navigated to `/rate-service`
- No "Your cleaning is done!" confirmation screen, just an abrupt redirect
- **Fix**: Show a brief completion animation before navigating

### H4: Cleaner Jobs page fetches ALL bookings, not just relevant ones
**File**: `src/pages/cleaner/Jobs.tsx` line 65
- `supabase.from('bookings').select('*').order(...)` without any filter
- RLS limits what's returned, but this still fetches more data than needed
- Could hit the 1000-row default limit
- **Fix**: Add `.limit(200)` or explicit status/cleaner filters

### H5: Admin Bookings page has no limit on query
**File**: `src/pages/admin/Bookings.tsx` line 31
- Fetches ALL bookings without limit. With scale, this will hit the 1000-row cap silently
- **Fix**: Add `.limit(500)` and implement pagination

### H6: `cleaner_leaves` join to `cleaners` table may fail
**File**: `src/pages/admin/Leaves.tsx` line 18
- Uses `.select('*, cleaners(name, user_id)')` which relies on an implicit FK from `cleaner_leaves.cleaner_id` to `cleaners.id`
- No FK is defined according to the schema. This join may or may not work depending on PostgREST inference
- **Fix**: Verify FK exists or use a separate query

---

## MEDIUM SEVERITY (8)

### M1: Login page `motion.div` ref warning
Console shows: "Function components cannot be given refs" in Login.tsx AnimatePresence
- **Fix**: Wrap inner content in `forwardRef` or use `motion.div` correctly

### M2: `cancelReason` defaults to first item, not empty
**File**: `src/pages/customer/SearchingCleaner.tsx` line 30
- `setCancelReason(cancelReasons[0])` pre-selects "Taking too long"
- User may accidentally submit this without consciously choosing
- **Fix**: Initialize to empty string, require explicit selection

### M3: ScheduleBooking service-to-DB matching is fragile
**File**: `src/pages/customer/ScheduleBooking.tsx` line 215
- `dbServices?.find(s => selectedServiceDetails.some(sel => s.name.toLowerCase().includes(sel.name.toLowerCase().split(' ')[0])))` 
- Matching by first word of service name is unreliable (e.g., "Bed Making" matches "Bedroom")
- **Fix**: Use exact name match or service category matching

### M4: ETA is hardcoded to 12 minutes
**File**: `src/pages/customer/ActiveBooking.tsx` line 27
- Always starts at 12 minutes regardless of distance
- **Fix**: Acceptable for MVP but should note this is simulated

### M5: Wallet "How Coins Work" text says "100 coins = £5 off"
**File**: `src/pages/customer/Wallet.tsx` line 73
- CoinBalance shows `balance / 10` (10 coins = £1 = £10 per 100 coins)
- ScheduleBooking uses same 10:£1 ratio
- Wallet FAQ says 100:£5 (20:£1)
- **Fix**: Change to "10 coins = £1 off" to match actual code

### M6: Admin Dashboard query has no `.limit()`
**File**: `src/pages/admin/Dashboard.tsx` line 14
- All three queries (bookings, cleaners, enrolments) fetch everything without limit
- **Fix**: Add limits

### M7: StreakProgress component referenced but not visible in code audit
- Used on Home page but unclear if it handles edge cases (no streak data, first month)

### M8: `addresses` unique constraint may cause issues for different label types
- Migration added `UNIQUE (user_id, label)` but users could have multiple "Home" addresses if they try
- The ScheduleBooking code (line 247) correctly handles this with `maybeSingle()` + upsert pattern

---

## LOW / UX IMPROVEMENTS (10)

### L1: "View all →" on Home top cleaners navigates to `/services`, not a cleaners list page
### L2: Share button on Home "Refer a Mate" banner goes to `/profile`, not directly shares
### L3: No loading skeleton on Home page while data loads
### L4: Cleaner Jobs page has no pull-to-refresh pattern
### L5: Admin Reports page sorting by "Month Year" string parsing could fail for non-English locales
### L6: No empty state illustration on SearchingCleaner page
### L7: Customer Profile page `pt-14` creates large top gap
### L8: Help page uses placeholder WhatsApp number `447000000000`
### L9: Cleaner Dashboard "£X earned" badge shows weekly earnings, could confuse (should label "this week")
### L10: Express Booking doesn't show coin balance or redemption option (available in Schedule but not Express)

---

## SECURITY NOTES (2)

### S1: Notification INSERT RLS blocks cross-user notifications (see H1)
- This is the most impactful security/functionality conflict
- Notifications from cleaner→customer and admin→customer all silently fail

### S2: `delete-user` edge function access
- Called with user's access token, but the function uses service role key internally
- Need to verify the function checks that the caller is an admin before deleting

---

## SUMMARY

| Severity | Count | Action Required |
|----------|-------|----------------|
| Critical | 5 | Must fix before production |
| High | 6 | Should fix before production |
| Medium | 8 | Fix in next sprint |
| Low/UX | 10 | Nice to have |
| Security | 2 | Must fix (S1 blocks core feature) |
| **Total** | **31** | |

### Priority Fix Order
1. **S1/H1**: Notification INSERT RLS -- this blocks the entire notification system from working
2. **C1/C2/M5**: Coin system inconsistency -- three different ratios in the codebase
3. **C3**: Express Booking missing payment options
4. **C5**: Referral tracking not implemented (hardcoded zeros)
5. **H2**: hasArrived state not persisted
6. **H4/H5/M6**: Add query limits to prevent silent data truncation

