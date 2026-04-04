

# Clean Fit — Complete End-to-End Production Overhaul

A full redesign and functional completion of all three portals (Customer, Cleaner, Super Admin) with every screen, transition, and backend interaction accounted for.

---

## Issues Found

### Design Issues
1. **Splash screen** depends on a generated `hero-cleaner.jpg` that may not render well — replace with animated gradient
2. **No route protection** — any unauthenticated user can access /home, /cleaner, /admin
3. **Login exposes role selector** (customer/cleaner/admin) — end users should not see this; separate login routes needed
4. **Active booking page** has manual "Previous/Next" debug buttons instead of real status flow
5. **Booking confirmation** generates random OTP client-side instead of using the one from the database
6. **No actual booking creation** — Booking.tsx navigates to confirmation via `state` but never writes to the `bookings` table
7. **Cleaner dashboard** shows all bookings, not filtered to the logged-in cleaner
8. **Cleaner BookingDetail** fetches any non-completed booking, not the cleaner's own
9. **Earnings page** is entirely hardcoded mock data
10. **Customer Profile** shows hardcoded address instead of fetching from `addresses` table
11. **Rating/Review** is UI-only — never writes to the database
12. **Enrolment Register** captures no form state — all inputs are uncontrolled
13. **Admin pages** lack proper CRUD (edit/delete buttons are non-functional)
14. **No payment flow** screen exists
15. **WelcomeCoupon** doesn't pull from the database coupons
16. **Inconsistent back navigation** — some pages use BackButton, some use raw SVG

### Functional Gaps
- Booking never saved to database
- No cleaner assignment logic
- No booking status updates
- Rating never persisted
- Enrolment form data not submitted to database
- Addresses not CRUD-able
- Admin cannot actually edit/create services, approve enrolments, or manage cleaners

---

## Implementation Plan

### Batch 1: Design System + Route Protection + Auth Fixes

**Files**: `src/index.css`, `tailwind.config.ts`, `src/App.tsx`, `src/contexts/AuthContext.tsx`, `src/pages/customer/Login.tsx`

- Update CSS: add Plus Jakarta Sans font import, refine glass-card borders for more premium look, add `.card-press` utility (`whileTap` scale)
- Add `ProtectedRoute` wrapper component that checks auth state and redirects to `/login` if not authenticated, and checks role for portal access
- Remove role selector tabs from Login page — customers log in at `/login`, cleaners at `/cleaner/login`, admins at `/admin/login`
- Create `/cleaner/login` and `/admin/login` route components (reuse Login with role prop)
- Fix AuthContext `verifyOtp` to properly await the sign-in before returning (currently fires async without await)
- Add auto-confirm email signup via `cloud--configure_auth`

### Batch 2: Splash + Customer Home Redesign

**Files**: `src/pages/Index.tsx`, `src/pages/customer/Home.tsx`, `src/components/WelcomeCoupon.tsx`

- **Splash**: Replace hero image with animated gradient background + floating Lucide icons (Sparkles, SprayBottle, Home) + Clean Fit wordmark
- Tagline: *"London's homes don't clean themselves. But we do."*
- Two CTAs: "Book a Clean" → `/login`, "Become a Cleaner" → `/enrol/register`
- **Home**: Add time-of-day greeting (*"Good morning"* / *"Good afternoon"* / *"Good evening"*)
- Add search bar that navigates to `/services`
- Add horizontal quick-action pills: Home Clean, Office Clean, Deep Clean, End of Tenancy
- Wire WelcomeCoupon to fetch active coupons from database
- Add active booking banner at top if user has an in-progress booking

### Batch 3: Complete Booking Flow + Database Write

**Files**: `src/pages/customer/Booking.tsx`, `src/pages/customer/BookingConfirmation.tsx`, `src/pages/customer/ActiveBooking.tsx`, `src/pages/customer/RateService.tsx`

- **Booking.tsx**: Add property type selector (Flat/House/Office), add notes field, validate all fields before enabling confirm. On confirm → `INSERT INTO bookings` with all fields, generate OTP server-side (or use default `1111`), navigate to confirmation with booking ID
- **BookingConfirmation.tsx**: Fetch the created booking from DB by ID, show assigned cleaner (or "Assigning..." state), display the DB-stored OTP
- **ActiveBooking.tsx**: Remove debug Previous/Next buttons. Fetch booking status from DB. Show simulated map area with ETA. Add real-time status subscription via Supabase Realtime. Show OTP prominently when status is "en-route". Add cleaner contact card
- **RateService.tsx**: On submit → `UPDATE bookings SET rating, review WHERE id = bookingId`. Add quick-feedback tags (Punctual, Thorough, Friendly). British humour: *"How'd they do? Be honest — we can take it."*
- Add Supabase Realtime subscription on bookings table for live status updates

**Migration**: `ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;`

### Batch 4: My Bookings + Profile + Notifications

**Files**: `src/pages/customer/MyBookings.tsx`, `src/pages/customer/Profile.tsx`, `src/pages/customer/Notifications.tsx`

- **MyBookings**: Add tabs (Active / Upcoming / Past) using shadcn Tabs. Active bookings show "Track" button. Past bookings show "Re-book" button. Add pull-to-refresh pattern
- **Profile**: Fetch saved addresses from `addresses` table. Add "Add Address" form with postcode + address lines. Add edit/delete for addresses. Add "Refer a Mate" section. Add notification preferences toggle. Editable name field with save
- **Notifications**: Group by date (Today, Yesterday, Earlier). Tap to mark as read (update DB). Different icon per type

### Batch 5: Cleaner Portal — Complete Overhaul

**Files**: `src/pages/cleaner/Dashboard.tsx`, `src/pages/cleaner/BookingDetail.tsx` (rename to Jobs.tsx), `src/pages/cleaner/Earnings.tsx`, `src/pages/cleaner/Profile.tsx`, `src/components/layout/CleanerLayout.tsx`

- **Dashboard**: Filter bookings by `cleaner_id = user.id`. Add availability toggle (update `cleaners.available`). Show next job card prominently. Weekly earnings mini-chart from actual bookings data
- **Jobs (renamed from BookingDetail)**: Add tabs: "Available" (unassigned bookings) | "My Jobs" (assigned to me) | "Completed". Available jobs show "Accept" button → updates `bookings.cleaner_id`. My Jobs show OTP entry → status update flow. Job detail: reveal full address after accepting, show "Start Job" (updates status to in-progress), "Complete Job" (updates status to completed)
- **Earnings**: Calculate from actual completed bookings (`SUM(total_cost) WHERE cleaner_id = me AND status = completed`). Group by day/week. Show stats: total jobs, avg rating, total hours
- **Profile**: Show cleaner record data. Editable specialisations. Show ratings received. Show DBS/verification status
- Update CleanerLayout nav: rename "Jobs" label, update route to `/cleaner/jobs`
- Add route `/cleaner/jobs` in App.tsx

### Batch 6: Enrolment Flow — Wire to Database

**Files**: `src/pages/enrol/Register.tsx`, `src/pages/enrol/ApplicationStatus.tsx`, `src/pages/enrol/Training.tsx`

- **Register**: Add controlled state for ALL form fields across 8 steps. Validate each step before allowing "Next". On final submit → `INSERT INTO enrolment_applications` with all collected data. Show loading state during submission. British humour: *"Brilliant! We'll have a proper gander at your application."*
- **ApplicationStatus**: Fetch application from DB by `user_id`. Show real status from DB instead of hardcoded `currentStage = 1`
- **Training**: Wire completion to `training_progress` table (INSERT/DELETE). Fetch existing progress on load. Show certificate-style completion UI per level

### Batch 7: Super Admin — Full CRUD + Real Data

**Files**: All `src/pages/admin/*.tsx`, `src/components/layout/AdminLayout.tsx`

- **Dashboard**: Wire revenue to actual booking totals. Add recent activity feed (latest bookings, signups). Add period selector for chart (7d/30d/90d). Show real stats from DB queries
- **Bookings**: Add status filter dropdown. Add "Assign Cleaner" action (dropdown of available cleaners). Add "Cancel" action. Inline status update
- **Customers**: Fetch from `profiles WHERE role = 'customer'`. Show total bookings count, total spend. View profile detail
- **Cleaners**: Fetch from `cleaners` joined with `profiles`. Toggle availability. View/edit cleaner details. Show ratings
- **Enrolments**: Add "Approve" / "Reject" buttons that update `enrolment_applications.status`. On approve → create cleaner record + profile
- **Services**: Wire "Add Service" button to dialog form → `INSERT INTO services`. Wire "Edit" to dialog → `UPDATE services`. Add "Deactivate" toggle
- **Coupons**: Wire "Add Coupon" form. Edit/deactivate existing coupons
- **Reports**: Wire charts to real aggregated data from bookings table
- **Training**: View cleaner training progress. Bulk manage modules

### Batch 8: Animations + Content + Final Polish

**Files**: Multiple files — final pass

- Add `framer-motion` `whileTap={{ scale: 0.97 }}` to all interactive cards/buttons
- Ensure all page transitions use consistent `PageTransition` wrapper
- Add skeleton loaders to every page that fetches data
- Add empty states with British humour to every list view
- Verify all icons are Lucide outline at `strokeWidth={1.5}`
- Add `scrollbar-hide` to all horizontal scroll areas
- Test all navigation flows end-to-end
- Add 404 page with witty copy: *"This page has done a runner. Let's get you home."*
- Ensure bottom nav safe area padding works on all pages

---

## Database Changes Required

1. **Migration**: Enable Realtime on bookings table
2. **Migration**: Add `property_type` column to bookings (`text DEFAULT 'house'`)
3. **Migration**: Add `notes` column to bookings (`text`)
4. **Migration**: Add RLS policy for cleaners to view/update bookings assigned to them
5. **Migration**: Add RLS policy for cleaners to accept unassigned bookings (update `cleaner_id`)
6. **Seed data**: Insert sample bookings for testing
7. **Auth config**: Enable auto-confirm for email signups (since we simulate phone auth)

---

## New Routes to Add

| Route | Component | Purpose |
|-------|-----------|---------|
| `/cleaner/login` | CleanerLogin | Cleaner-specific login |
| `/admin/login` | AdminLogin | Admin-specific login |
| `/cleaner/jobs` | CleanerJobs | Available + assigned jobs |

---

## Summary

- **~40 files modified**, **~5 new files created**
- **3 database migrations** (realtime, new columns, RLS policies)
- **8 implementation batches** in dependency order
- Every screen functional end-to-end with real database reads/writes
- Consistent premium design with glassmorphism, outline icons, smooth transitions
- British humour woven throughout all copy

