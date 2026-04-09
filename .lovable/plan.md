

# Comprehensive App Hardening -- Security, Notifications, and End-to-End Flow Fix

This plan addresses admin access control, notification automation, user management, and end-to-end flow validation across all roles.

---

## Phase 1: Super Admin Access Control

**Problem**: Anyone can navigate to `/admin/login` and create an admin account with any phone number.

**Solution**:
- In `Login.tsx`, when `role === 'admin'`, after OTP verification check if the user has an `admin` role in the `user_roles` table. If not, block login with an error toast ("Unauthorized -- admin access only") and sign them out.
- Add an **Admin Management** page (`admin/Admins.tsx`) accessible from the More menu, where existing admins can add new admin phone numbers (insert into `user_roles` with role `admin`) and view/remove existing admins.
- Seed the first admin via the database insert tool so the current test admin (phone `0000000000`) has a `user_roles` entry.
- Add route `/admin/admins` in `App.tsx` and link in `AdminLayout.tsx` More menu.

**Files**: `Login.tsx`, `AuthContext.tsx`, new `admin/Admins.tsx`, `AdminLayout.tsx`, `App.tsx`

---

## Phase 2: Admin User Management (Delete Users/Cleaners)

**Problem**: Admin cannot delete customers or cleaners.

**Solution**:
- Add a "Delete User" button in the customer detail dialog (`admin/Customers.tsx`) and cleaner detail dialog (`admin/Cleaners.tsx`).
- Deletion calls a new edge function `delete-user` that uses the service role key to delete the auth user (which cascades to profiles via trigger). For cleaners, also delete the cleaner record.
- Add RLS policy for admin DELETE on `profiles` and `cleaners` tables via migration.

**Files**: `admin/Customers.tsx`, `admin/Cleaners.tsx`, new edge function `supabase/functions/delete-user/index.ts`, migration for DELETE policies

---

## Phase 3: Automated Notifications System

**Problem**: No automatic notifications are sent for booking lifecycle events.

**Solution**: Add notification insertion at key points in the existing client-side code:

1. **Booking created** -- notify customer: "Your booking is confirmed, searching for a cleaner."
2. **Cleaner assigned** -- notify customer: "Your cleaner {name} has been assigned!"
3. **Cleaner en-route** -- notify customer: "Your cleaner is on the way!"
4. **Job completed** -- notify customer: "Your cleaning is done! Rate your experience."
5. **Cleaner declined** -- notify customer: "Your cleaner couldn't make it. Searching for a new one."
6. **Leave replacement** -- notify customer: "Your regular cleaner is on leave. {replacement} will cover."
7. **Upcoming booking reminder** -- create an edge function triggered by pg_cron that runs daily, finds bookings for tomorrow, and inserts reminder notifications.

Insert notifications inline in `Jobs.tsx` mutations, `SearchingCleaner.tsx`, `ScheduleBooking.tsx`, and the new cron function.

**Files**: `cleaner/Jobs.tsx`, `customer/ScheduleBooking.tsx`, `customer/SearchingCleaner.tsx`, new edge function `supabase/functions/booking-reminders/index.ts`

---

## Phase 4: Offer Pop-up for End Users

**Problem**: Admin-created offers show on home page but don't proactively alert users.

**Solution**:
- In `CustomerHome`, check for unclaimed active offers on mount. If found, show a modal/dialog with the offer details and a "Claim" button that inserts into `offer_claims`.
- Track claimed offers so the pop-up only shows once per offer.

**Files**: `customer/Home.tsx`

---

## Phase 5: Booking Flow Hardening

Ensure end-to-end flows work correctly:

1. **Recurring bookings**: In `ScheduleBooking.tsx`, when a recurring plan is selected, create the initial booking. A daily cron edge function generates future bookings based on frequency.
2. **Cleaner leave auto-reassignment**: In `admin/Leaves.tsx`, when a leave is approved and the cleaner has active recurring bookings during the leave period, auto-assign a replacement cleaner and notify the customer.
3. **Cancel from floater**: Already implemented in `ActiveBookingFloater.tsx`. Verify the cancel mutation updates booking status to `cancelled`.
4. **Map cleaner movement**: The `SearchingCleaner.tsx` already subscribes to realtime booking changes. Enhance the "found" phase to poll `cleaner_locations` and update the map marker position for the assigned cleaner.

**Files**: `admin/Leaves.tsx`, `SearchingCleaner.tsx`, `ActiveBookingFloater.tsx`, new edge function `supabase/functions/recurring-bookings/index.ts`

---

## Phase 6: UI/UX Consistency Audit

- Verify all screens use consistent padding (`px-5`), border radius (`rounded-2xl/3xl`), and the same bottom navbar offset (`pb-24`).
- Ensure no horizontal scroll on any screen (already have `overflow-x: hidden` globally).
- Verify the coin system works: earn coins on rating, redeem on checkout.
- Confirm the Refer a Mate share button triggers WhatsApp/copy link.
- Verify before/after photo flow: cleaner uploads before photo to start, after photo to complete, customer sees both on rating screen.

---

## Database Changes

1. **Migration**: Add DELETE policies on `profiles` and `cleaners` for admins.
2. **Insert**: Seed admin user_role for the test admin account.
3. **Edge functions**: `delete-user`, `booking-reminders`, `recurring-bookings`.

## Summary of Files

| Action | File | Purpose |
|--------|------|---------|
| Edit | `Login.tsx` | Block non-admin users from admin login |
| Edit | `AuthContext.tsx` | Check admin role on login |
| New | `admin/Admins.tsx` | Admin management page |
| Edit | `AdminLayout.tsx` | Add Admins link to More menu |
| Edit | `App.tsx` | Add /admin/admins route |
| Edit | `admin/Customers.tsx` | Add delete user button |
| Edit | `admin/Cleaners.tsx` | Add delete cleaner button |
| Edit | `admin/Leaves.tsx` | Auto-reassignment on leave approval |
| Edit | `cleaner/Jobs.tsx` | Insert notifications on status changes |
| Edit | `customer/ScheduleBooking.tsx` | Insert booking notification |
| Edit | `customer/SearchingCleaner.tsx` | Real-time cleaner location on map |
| Edit | `customer/Home.tsx` | Offer claim pop-up |
| New | Edge: `delete-user` | Delete auth user (service role) |
| New | Edge: `booking-reminders` | Daily reminder notifications |
| New | Edge: `recurring-bookings` | Generate recurring booking instances |
| Migration | DELETE policies | Admin can delete profiles/cleaners |

