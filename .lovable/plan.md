

# Clean Fit -- Comprehensive App Overhaul Plan

This plan addresses all requested changes, organized by priority for incremental implementation.

---

## Phase 1: Data Cleanup & Critical UI Fixes

### 1A. Clear all test/demo bookings
- Delete all existing bookings, notifications, and test data from the database using the insert tool (DELETE statements)
- Reset cleaner ratings and review counts to 0

### 1B. Login card hidden behind green header
- In `Login.tsx`, increase the negative margin pull-up (`-mt-10` to `-mt-16`) and raise the card's z-index so the phone/OTP input card sits visibly above the green header curve
- Audit all screens for similar z-index/overlap issues

### 1C. Logout always returns to landing page
- Update `AdminLayout.tsx` logout to navigate to `/` instead of `/login`
- Verify `CleanerLayout` and `CustomerLayout` logout paths also go to `/` (the role-selection landing page)

---

## Phase 2: Enhanced Cleaner Onboarding (5-step wizard)

### 2A. Expand `CleanerOnboarding.tsx` from 3 to 5 steps
- **Step 1 -- Personal Info**: First name, last name (separate fields), phone number (pre-filled from auth), address with auto-detect (using `navigator.geolocation` + OpenStreetMap reverse geocoding)
- **Step 2 -- Experience & Interests**: Years of experience selector, multi-select for categories (House Cleaning, Housekeeping, Deep Clean, etc.)
- **Step 3 -- Specialisations**: Granular skill selection (Kitchen, Bathroom, Laundry, Windows, etc.)
- **Step 4 -- Availability**: Day-of-week picker + preferred time slots (Morning/Afternoon/Evening) + preferred working hours input
- **Step 5 -- Review & Confirm**: Summary card showing all entered info before saving

### 2B. Database changes
- Add `first_name`, `last_name`, `address_line1`, `address_postcode` columns to `cleaners` table via migration
- Store categories of interest in the existing `specialisations` array

---

## Phase 3: Cleaner Leave System with Replacement

### 3A. Leave request flow (Cleaner view)
- Add a "Request Leave" button on cleaner Schedule page
- Date range picker for start/end dates, reason field
- Show pending/approved/rejected leave history

### 3B. Admin leave management with replacement
- Enhance `admin/Leaves.tsx` with a replacement workflow:
  - When approving a leave, show conflicting bookings
  - Display available cleaners who match the required specialisations and are free on those dates
  - "Reassign" button to transfer the booking to a replacement cleaner
  - Update the booking's `cleaner_id`, `cleaner_name` fields
- Add `replacement_cleaner_id` column to `cleaner_leaves` table to track replacements

### 3C. Realtime leave notifications
- When admin approves/rejects, push a notification to the cleaner via the `notifications` table

---

## Phase 4: Customer Streak & Rewards System

### 4A. New `customer_streaks` table
```sql
CREATE TABLE customer_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  month text NOT NULL,        -- e.g. '2026-04'
  booking_count integer DEFAULT 0,
  streak_active boolean DEFAULT true,
  free_clean_earned boolean DEFAULT false,
  free_clean_redeemed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```
- RLS: customers can view own streaks, admins can view all

### 4B. Streak tracking logic
- After each completed booking, increment `booking_count` for the current month
- At 10+ bookings/month, set `free_clean_earned = true`
- Show streak progress on Customer Home (progress bar: "7/10 cleans this month")
- When booking, if a free clean is available, show "Apply Free Clean" toggle

---

## Phase 5: Offers & Vouchers System

### 5A. New `offers` table
```sql
CREATE TABLE offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  discount_percent integer NOT NULL,
  code text UNIQUE,
  valid_from date NOT NULL,
  valid_until date NOT NULL,
  active boolean DEFAULT true,
  max_claims integer DEFAULT 100,
  claimed_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

### 5B. Admin offers management page
- New `/admin/offers` route with create/edit/toggle offers
- Add to admin nav items

### 5C. Customer offer display
- Show active offers as banners on Customer Home
- "Claim" button that applies discount to next booking
- New `offer_claims` table to track which customer claimed which offer

---

## Phase 6: Schedule & Express Booking Refinements

### 6A. Recurring booking subscriptions
- Add `subscription_end_date`, `subscription_status` columns to `bookings` table
- For daily/weekly recurring bookings, assign a permanent cleaner
- Show "Cancel Subscription" button on active recurring bookings
- Pro-rata payment calculation: show "You'll be charged for X completed days"

### 6B. Express cleaning premium pricing
- Ensure express bookings apply a 1.3x multiplier (already partially done)
- Show clear "Express Premium" label on pricing summary

### 6C. Payment structure display
- Add a payment summary component showing:
  - Base rate x hours x rooms
  - Frequency discount (if recurring)
  - Express surcharge (if applicable)
  - Offer/coupon discount
  - Final total

---

## Phase 7: Real-time Location Tracking

### 7A. New `cleaner_locations` table
```sql
CREATE TABLE cleaner_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER PUBLICATION supabase_realtime ADD TABLE cleaner_locations;
```

### 7B. Cleaner location broadcasting
- In `CleanerLayout`, use `navigator.geolocation.watchPosition` to update location every 10 seconds
- Upsert into `cleaner_locations` table

### 7C. Customer map -- nearby available cleaners
- Subscribe to `cleaner_locations` realtime changes
- Show only available cleaners within a radius on the map
- Replace simulated markers with real location data (fall back to simulated if no data)

### 7D. Admin map -- all cleaners
- Admin dashboard map shows all cleaner locations in realtime
- Toggle between cleaners and pending requests (already exists, enhance with real data)

---

## Phase 8: Training & Certification System

### 8A. Training completion tracking
- Training modules already exist in DB; ensure cleaner must complete all modules before being marked `verified`
- After completing all training, set `cleaners.verified = true`

### 8B. Certified badge display
- Show a "CleanFit Certified" badge on cleaner profiles (green shield icon)
- Display on the customer's cleaner card during booking assignment
- Show experience years and star rating alongside the badge

### 8C. Admin training dashboard
- Show training progress per cleaner on `admin/TrainingProgress`
- Highlight cleaners who completed all levels

---

## Phase 9: Service Completion & Rating Flow

### 9A. Completion summary screen
- When cleaner taps "Complete", customer sees a full summary: service name, duration, price breakdown, cleaner name, date/time
- Below summary, show star rating + quick tags + comment field (already exists in `RateService.tsx`, enhance with summary)

### 9B. Rating aggregation for admin
- New section in admin Cleaners page: "Performance Rankings"
  - Top rated cleaners
  - Most jobs completed
  - Lowest rated (needs attention)
  - Sort/filter by rating, job count, review count

---

## Phase 10: Admin Mobile-First Redesign

### 10A. Replace sidebar with bottom navbar
- Convert `AdminLayout.tsx` from desktop sidebar to mobile-friendly bottom navbar (matching Customer/Cleaner layouts)
- Bottom nav: Dashboard, Bookings, Team (cleaners + enrolments), Settings (services, coupons, offers)
- Add hamburger menu or top-bar for secondary pages (Leaves, Reports, Training)

### 10B. Add logout to admin
- Place logout in admin profile/settings section (accessible from navbar)
- Logout navigates to `/` (landing page)

### 10C. Visual consistency
- Apply same rounded cards, map background, font sizes as customer/cleaner views
- Use same color palette and animation patterns

---

## Phase 11: End-to-End UI Audit & Fixes

### 11A. Z-index and overlap fixes
- Login card above green header
- Floating booking tab clearance on all pages
- Map overlays not blocking interactive elements

### 11B. Onboarding skip for returning users
- Already implemented: `onboarding_completed` flag in profiles
- Verify it works correctly for all roles

### 11C. Consistent navigation
- All logout flows go to `/` (landing page with 3 role options)
- Back buttons work correctly on all screens

---

## Summary of Database Migrations Needed

1. Add `first_name`, `last_name`, `address_line1`, `address_postcode` to `cleaners`
2. Add `replacement_cleaner_id` to `cleaner_leaves`
3. Create `customer_streaks` table
4. Create `offers` table + `offer_claims` table
5. Add `subscription_end_date`, `subscription_status` to `bookings`
6. Create `cleaner_locations` table with realtime enabled

## Files to Create/Edit

- **New pages**: `admin/Offers.tsx`, `admin/CleanerPerformance.tsx`
- **Major edits**: `CleanerOnboarding.tsx`, `AdminLayout.tsx`, `admin/Dashboard.tsx`, `admin/Leaves.tsx`, `admin/Cleaners.tsx`, `customer/Home.tsx`, `customer/RateService.tsx`, `customer/ScheduleBooking.tsx`, `Login.tsx`, `Index.tsx`
- **New components**: `StreakProgress.tsx`, `PaymentSummary.tsx`, `LocationTracker.tsx`
- **Layout overhaul**: `AdminLayout.tsx` (sidebar to bottom navbar)

