

# Clean Fit -- Complete App Overhaul Plan
## Inspired by Snabbit, Built for London

This is a massive end-to-end restructuring of the entire Clean Fit app across all 3 roles, covering design consistency, onboarding, booking intelligence, cleaner management, and admin operations.

---

## Part 1: Design System Consistency & Visual Overhaul

### 1A. Splash Screen -- White Background
- Change `bg-foreground` (black) to `bg-background` (white) on the splash screen
- Update text colors accordingly: logo text becomes `text-foreground`, tagline becomes `text-muted-foreground`
- Keep the lime-green Sparkles icon and pulsing ring animation
- Loading bar stays lime-green on white

### 1B. Onboarding Slides -- Full-Screen Hyper-Realistic Images
- Replace the small 56x56 rounded image box with a **full-screen background image** behind each slide
- Use high-quality lifestyle cleaning images (people cleaning kitchens, bathrooms, living rooms)
- Overlay a gradient (`from-black/70 via-black/40 to-transparent`) from bottom so white text is readable
- Title and description text become white, positioned at the bottom third of the screen
- Dots and CTA button sit at the very bottom over the gradient

### 1C. Global Design Tokens Audit
- Ensure every screen uses: `rounded-3xl` cards, `font-display font-black` headings, `Plus Jakarta Sans` font, lime-green primary, floating dark pill nav bar
- Standardize shadow usage: `shadow-soft` for cards, `shadow-elevated` for overlays
- Remove any remaining old-style borders or non-rounded elements
- Ensure all icon sizes are consistent (h-5 w-5 for nav, h-4 w-4 for inline)

---

## Part 2: Authentication & Profile Onboarding

### 2A. New User Detection
- After OTP verification, check if user has a complete profile (has name, has filled onboarding)
- Store an `onboarding_completed` flag in the `profiles` table (new column)
- If flag is false/null, route to the profile onboarding wizard instead of the role-based slides

### 2B. Customer Profile Onboarding (New Users)
A 4-step wizard after first login:
1. **Name & Email** -- "What should we call you?" + optional email
2. **Property Details** -- Property type (Flat/House/Office), number of bedrooms (1-5+), number of bathrooms (1-4+)
3. **Default Address** -- Postcode, address line, city (auto-save to addresses table)
4. **Preferences** -- Preferred cleaning day, any allergies/pet info, budget preference (Standard / Premium)

All data saves to `profiles` table (new columns) and `addresses` table.

### 2C. Cleaner Profile Onboarding (New Users)
A 3-step wizard after first login (separate from the 8-step enrolment):
1. **Personal Info** -- Name, profile photo placeholder, years of experience
2. **Specialisations** -- Multi-select: Kitchen, Bathroom, Deep Clean, Laundry, Ironing, Organising
3. **Availability** -- Default weekly availability (Mon-Sun toggles, morning/afternoon/evening)

### 2D. Existing User Flow
- If `onboarding_completed` is true, skip wizard entirely and go straight to dashboard
- Profile data shows on Profile screen and is editable

---

## Part 3: Intelligent Pricing & Booking

### 3A. Schedule Cleaning -- Property-Based Pricing
- After service selection, add a step: **"Tell us about your home"**
  - Number of bedrooms: 1, 2, 3, 4, 5+
  - Number of bathrooms: 1, 2, 3, 4+
  - Square footage range: Small (<500sqft), Medium (500-1000), Large (1000-2000), XL (2000+)
- Price calculation: `base_rate * duration * property_multiplier * frequency_discount`
  - Property multiplier: Small=1.0, Medium=1.2, Large=1.5, XL=2.0
  - Extra bathroom surcharge: +£5 per additional bathroom beyond 1

### 3B. Service Tiers (Standard vs Premium)
- Add a tier selection step in both Express and Schedule flows
- **Standard**: Regular vetted cleaners, standard products
- **Premium**: Top-rated cleaners only (4.8+ rating), eco-friendly products, priority scheduling, +30% price
- Tier saved on booking record, shown to cleaner in job details
- Premium jobs highlighted with a gold badge in cleaner's Available Jobs

### 3C. Express Booking Enhancements
- Show estimated arrival time based on cleaner availability
- Add "Emergency" option (+50% surcharge, guaranteed within 30 mins)
- Show live count: "3 cleaners available near you"

---

## Part 4: Cleaner Leave & Replacement System

### 4A. Database Changes
- New table: `cleaner_leaves` (id, cleaner_id, start_date, end_date, reason, status: pending/approved/rejected, created_at)
- New table: `cleaner_availability` (id, cleaner_id, day_of_week, start_time, end_time, available boolean)

### 4B. Cleaner Leave Application
- New screen in Cleaner Portal: "My Schedule" accessible from Profile
- Calendar view showing upcoming jobs and leave days
- "Request Leave" button opens a form: start date, end date, reason
- Leave request goes to Admin for approval

### 4C. Admin Leave Management
- New section in Admin sidebar: "Leave Requests"
- Shows pending leave requests with cleaner name, dates, reason
- Approve/Reject buttons
- On approval: auto-check if cleaner has scheduled bookings during leave dates
- If conflicts found: show list of affected bookings with "Reassign" button
- Reassign flow: shows available cleaners for those dates, admin picks replacement
- Notification sent to customer about cleaner change

### 4D. Auto-Replacement Logic
- When a cleaner goes on approved leave, bookings in that period get flagged
- Admin sees "Needs Reassignment" badge on affected bookings
- System suggests replacement cleaners based on: availability, rating, specialisations match, proximity

---

## Part 5: Notification System

### 5A. Trigger Points
- **Customer gets notified when**: Cleaner assigned, cleaner en route, cleaner arrived, cleaning complete, cleaner changed (leave replacement), coupon available
- **Cleaner gets notified when**: New job available nearby, job assigned, schedule change, leave approved/rejected, payment processed
- **Admin gets notified when**: New booking, new enrolment application, leave request, 1-star review

### 5B. Implementation
- Add `INSERT` policy to notifications table for system-level inserts
- Create notification triggers or insert notifications in the booking update flow
- Unread count badge on bell icon in all portals

---

## Part 6: Admin Super Powers

### 6A. Coupon Management Enhancement
- Current coupon CRUD works but add: bulk create, usage analytics, auto-expire toggle
- New coupon types: percentage off, flat amount off, free first hour
- Target audience: new users only, returning users, all users
- Coupon activation/deactivation toggle with date range

### 6B. Customer & Cleaner Detail Views
- Clicking "View" on a customer/cleaner row opens a detail drawer/page
- Customer detail: booking history, total spend, addresses, reviews given, active coupons
- Cleaner detail: job history, total earnings, average rating, leave history, specialisations, availability calendar

### 6C. Service Management
- Admin can set pricing per service (currently services table has rate_per_hour)
- Add ability to set premium tier pricing multiplier per service
- Toggle services active/inactive
- Reorder services display priority

### 6D. Real-Time Operations Dashboard
- Live feed of active bookings with status updates
- Map view placeholder showing active cleaner locations
- Today's schedule: timeline view of all bookings

---

## Part 7: Missing Screen Polish

These screens exist but need design consistency updates to match the lime-green system:

- `SearchingCleaner.tsx` -- update card styles, ensure cancel dialog matches design
- `ActiveBooking.tsx` -- status timeline should use lime accents, cards need rounded-3xl
- `Chat.tsx` -- message bubbles need rounded-3xl, input area needs floating pill style
- `RateService.tsx` -- star rating should use lime-green filled stars
- `BookingConfirmation.tsx` -- success animation with lime confetti
- `MyBookings.tsx` -- booking cards need consistent shadow-soft styling
- All Admin pages (Bookings, Customers, Cleaners, Services, Coupons, Reports, Enrolments) -- update table styling with rounded corners, lime accents for status badges

---

## Part 8: Unique Features (Inspired by Snabbit + Original)

### 8A. "One Booking, Many Tasks" (Snabbit signature)
- Already partially implemented with multi-select in Schedule Booking
- Enhance: show a visual checklist of selected tasks that the cleaner sees as a to-do list during the job
- Cleaner marks each task complete, customer sees progress in real-time

### 8B. Cleaning History & Insights
- Customer Profile section: "Your Clean Stats"
- Total cleans, money spent, favourite cleaner, most cleaned room
- Monthly cleaning frequency chart

### 8C. Favourite Cleaners
- Customer can "heart" a cleaner after a completed job
- When booking, option to "Request favourite cleaner" -- system prioritises that cleaner
- Stored in a new `favourite_cleaners` table (customer_id, cleaner_id)

### 8D. Re-Book Last Service
- One-tap "Re-book" button on MyBookings for completed bookings
- Pre-fills all details from last booking, customer just confirms

---

## Database Migrations Required

1. Add to `profiles`: `onboarding_completed boolean default false`, `bedrooms int`, `bathrooms int`, `property_size text`, `preferred_day text`, `pet_info text`, `budget_preference text default 'standard'`
2. New table: `cleaner_leaves` (id uuid PK, cleaner_id uuid, start_date date, end_date date, reason text, status text default 'pending', created_at timestamptz default now())
3. New table: `cleaner_availability` (id uuid PK, cleaner_id uuid, day_of_week int, start_time time, end_time time, available boolean default true)
4. New table: `favourite_cleaners` (id uuid PK, customer_id uuid, cleaner_id uuid, created_at timestamptz default now())
5. Add to `bookings`: `tier text default 'standard'`, `bedrooms int`, `bathrooms int`
6. Add INSERT policy on `notifications` table for authenticated users
7. Enable realtime on `cleaner_leaves` table
8. RLS policies for all new tables

---

## Implementation Order

1. Design system fixes (splash, onboarding images, global consistency) -- visual foundation
2. Database migrations for new tables and columns
3. Profile onboarding wizards (customer + cleaner)
4. Pricing intelligence (property details, tiers)
5. Cleaner leave & replacement system
6. Notification triggers
7. Admin enhancements (detail views, leave management, coupon upgrades)
8. Missing screen polish (all screens match design)
9. Unique features (favourites, re-book, task checklist, stats)
10. End-to-end testing across all 3 roles

---

## Technical Notes

- All new screens follow existing patterns: `CustomerLayout`/`CleanerLayout`/`AdminLayout` wrappers, `PageTransition`, `framer-motion` animations
- All database queries use `@tanstack/react-query` with `supabase` client
- Realtime subscriptions for live updates on bookings, leaves, notifications
- No backend server code needed -- all logic runs via Supabase RLS + client-side
- Images will use placeholder URLs from Unsplash for lifestyle photography

