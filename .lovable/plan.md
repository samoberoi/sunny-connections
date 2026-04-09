

# Fix Welcome Offer Pop-up and Referral Code Flow

## Overview
Three issues to fix:
1. Remove hardcoded "First 3 visits for £100" welcome coupon -- only show admin-created offers
2. Add referral code input step after customer onboarding (profile creation) for new users who arrive via referral link
3. Wire referral reward: when referred user's first booking completes, referrer gets coins in real-time

---

## 1. Remove Hardcoded Welcome Coupon

**File**: `src/pages/customer/Home.tsx`
- Remove the `WelcomeCoupon` component usage (line 124) and the `showCoupon` state/effect (lines 68, 74-77)
- The admin-created offers pop-up (lines 127-153 via `offerModal`) already works correctly -- keep it
- Remove the import of `WelcomeCoupon`

**File**: `src/components/WelcomeCoupon.tsx`
- Can be deleted or left unused

## 2. Capture `ref` Query Param from Referral Link

**File**: `src/pages/customer/Login.tsx`
- Read `ref` from `searchParams` on mount
- Store it in `localStorage` as `pending_referral_code` so it persists through the login/signup flow

## 3. Add Referral Code Step in Customer Onboarding

**File**: `src/components/CustomerOnboarding.tsx`
- Add a **Step 3** after address: "Got a Referral Code?"
- Pre-fill with `localStorage.getItem('pending_referral_code')` if present
- User can enter/edit the code and tap "Apply"
- On apply: validate the code format (starts with "CLEAN"), show success message: "You'll get 20% off your first booking!"
- Store the validated referral code in `localStorage` as `applied_referral_code`
- Clear `pending_referral_code` from localStorage
- Update `totalSteps` from 2 to 3

## 4. Auto-Apply Referral Code in Booking

**Files**: `src/pages/customer/ExpressBooking.tsx`, `src/pages/customer/ScheduleBooking.tsx`
- On mount, check `localStorage.getItem('applied_referral_code')`
- If present and this is the user's first booking (check bookings count), auto-fill the referral code field and show a banner: "Referral discount applied!"

## 5. Referrer Gets Coins on Completion (Real-Time)

**File**: `src/components/ReferralCard.tsx`
- Already queries bookings with `referral_code` matching. The stats update on re-fetch.
- Add a realtime subscription on `bookings` table filtered by `referral_code = userCode` and `status = completed` to auto-invalidate the query when a referred booking completes.

**File**: `src/pages/customer/Home.tsx`
- Add realtime subscription on `coin_transactions` for the current user to auto-refresh coin balance without page reload.

## 6. Award Referrer Coins on Job Completion

**Files**: `src/pages/cleaner/Jobs.tsx` (in `completeJob` function) or booking completion logic
- After marking a booking as `completed`, check if it has a `referral_code`
- If yes, look up which user owns that referral code (by matching `CLEAN` + first 6 chars of user ID)
- Insert a `coin_transaction` for the referrer: +50 coins, type "referral", description "Referral bonus"
- Update `customer_coins` balance for the referrer

---

## File Changes Summary

| Action | File | Changes |
|--------|------|---------|
| Edit | `src/pages/customer/Home.tsx` | Remove WelcomeCoupon, add realtime coin refresh |
| Edit | `src/pages/customer/Login.tsx` | Capture `ref` param, store in localStorage |
| Edit | `src/components/CustomerOnboarding.tsx` | Add Step 3: referral code input |
| Edit | `src/pages/customer/ExpressBooking.tsx` | Auto-fill referral code from localStorage |
| Edit | `src/pages/customer/ScheduleBooking.tsx` | Auto-fill referral code from localStorage |
| Edit | `src/components/ReferralCard.tsx` | Add realtime subscription for stats |
| Edit | `src/pages/cleaner/Jobs.tsx` | Award referrer coins on job completion |

No database migrations needed.

