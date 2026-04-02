

# Indiana Green — Cleaning & Housekeeping App for London

A SnapIt-style hyper-modern cleaning platform with three portals: **Customer**, **Cleaner**, and **Super Admin**.

---

## Brand & Design System

- Brand name: **Indiana Green**
- Primary colour: rich green (`#2E7D32` family), accents in gold/amber
- Mobile-first, modern UI with smooth transitions, rounded cards, gradient headers
- UK English throughout (colour, favourite, organise, etc.)
- Currency: GBP (£)

---

## Portal 1: Customer App

### Pages & Flows

1. **Splash / Welcome Screen** — logo, tagline, "Get Started" button
2. **Mobile OTP Login** — UK phone input (+44), OTP entry (using existing `input-otp` component), verify
3. **Welcome Coupon Modal** — first-time user popup: "Welcome! 20% off your first clean — Claim Now"
4. **Home Page**
   - Hero with animated illustration of cleaners
   - Trust badges: "25+ Years Experience", "2,000+ Happy Customers", "80+ Verified Professionals", "Most Trusted UK App"
   - Service categories: **Cleaning** vs **Housekeeping** (card selection)
   - "Book Instantly" vs "Schedule for Later" toggle
5. **Service Listing** — list of services with descriptions, hourly rates in £, duration selector
6. **Scheduling Flow**
   - Date & time picker (calendar component)
   - One-time vs Recurring (weekly/fortnightly/monthly)
   - Duration selector (2h, 3h, 4h, custom)
   - Address input (UK postcode lookup style)
7. **Booking Confirmation** — assigned cleaner profile (photo, name, rating), booking OTP displayed, booking summary
8. **Active Booking Tracker** — status updates (Assigned → En Route → OTP Verified → In Progress → Complete)
9. **Rating & Review** — 5-star rating for cleaner, optional text review, submit

### Additional Customer Pages
- **My Bookings** — upcoming & past bookings
- **Profile** — name, phone, saved addresses
- **Notifications** — booking updates

---

## Portal 2: Cleaner App

### Pages & Flows

1. **Cleaner Login** — phone OTP (same mechanism)
2. **Dashboard** — today's bookings, upcoming schedule, earnings summary
3. **Booking Detail** — customer name, address, service type, duration, OTP input field to verify arrival
4. **OTP Verification** — cleaner enters customer's OTP to start the job
5. **Job Completion** — mark as done, notes field
6. **Earnings** — weekly/monthly breakdown
7. **Profile** — availability, skills, documents

---

## Portal 3: Cleaner Enrolment (Job Seeker)

### Registration Flow (UK context)

1. **Personal Details** — full name, DOB, phone, email, UK postcode, right-to-work status
2. **Identity Verification** — upload ID (passport/driving licence/BRP), proof of address
3. **Experience** — years of cleaning experience, previous employers, specialisations
4. **References** — 2 professional references with contact details
5. **DBS Check Consent** — disclosure and barring service consent form
6. **Availability** — preferred working days/hours, travel radius
7. **Bank Details** — for payment (sort code, account number)
8. **Agreement** — terms of service, code of conduct acceptance
9. **Application Submitted** — status tracker (Submitted → Under Review → Interview → Training → Active)

### Training Programme (post-approval)

Interactive training module system with progress tracking:

- **Level 1: Professional Presence** (3 modules)
  - L1.1 Polished Appearance
  - L1.2 Professional Cleaning Kit
  - L1.3 Customer Service Excellence
- **Level 2: Five-Star Cleaning Principles** (5 modules)
  - L2.1 Harness the Power of Water
  - L2.2 Chunk by Chunk – Top to Bottom
  - L2.3 Unclogging & Flow
  - L2.4 Zooming In – Attention to Detail
  - L2.5 Zooming Out – Presentation Mastery
- **Level 3: Ongoing Excellence** — monthly modules (placeholder)

Each module: title, content (from your provided text), "Mark as Complete" button, progress bar per level.

---

## Portal 4: Super Admin

1. **Dashboard** — key metrics (bookings today, revenue, active cleaners, new signups)
2. **Manage Bookings** — list all bookings, filter by status/date/cleaner
3. **Manage Customers** — customer list, booking history, block/flag
4. **Manage Cleaners** — cleaner list, approval status, documents, training progress
5. **Enrolment Queue** — pending applications, approve/reject with notes
6. **Training Management** — view cleaner training progress per module
7. **Services & Pricing** — CRUD for service types and rates
8. **Coupons & Promotions** — create/manage discount codes
9. **Reports** — revenue, booking volume, ratings charts (using recharts)

---

## Technical Approach

| Concern | Approach |
|---------|---------|
| **Routing** | React Router with role-based route groups: `/`, `/cleaner`, `/enrol`, `/admin` |
| **State** | React Context for auth state, React Query for data |
| **Auth** | Simulated OTP flow (UI-complete, backend-ready). No real SMS until Supabase/Twilio connected |
| **Data** | Local state / mock data for now. Supabase-ready interfaces |
| **UI** | Existing shadcn/ui components + custom cards, modals, steppers |
| **Charts** | recharts (already installed) for admin dashboard |
| **Training** | Accordion-based module viewer with progress stored in state |

### File Structure (key new files)

```text
src/
├── contexts/AuthContext.tsx
├── data/mockData.ts
├── pages/
│   ├── customer/
│   │   ├── Login.tsx
│   │   ├── Home.tsx
│   │   ├── Services.tsx
│   │   ├── Booking.tsx
│   │   ├── BookingConfirmation.tsx
│   │   ├── ActiveBooking.tsx
│   │   ├── RateService.tsx
│   │   ├── MyBookings.tsx
│   │   └── Profile.tsx
│   ├── cleaner/
│   │   ├── Dashboard.tsx
│   │   ├── BookingDetail.tsx
│   │   ├── VerifyOTP.tsx
│   │   ├── Earnings.tsx
│   │   └── Profile.tsx
│   ├── enrol/
│   │   ├── Register.tsx (multi-step form)
│   │   ├── ApplicationStatus.tsx
│   │   └── Training.tsx
│   └── admin/
│       ├── Dashboard.tsx
│       ├── Bookings.tsx
│       ├── Customers.tsx
│       ├── Cleaners.tsx
│       ├── Enrolments.tsx
│       ├── TrainingProgress.tsx
│       ├── Services.tsx
│       ├── Coupons.tsx
│       └── Reports.tsx
├── components/
│   ├── WelcomeCoupon.tsx
│   ├── TrustBadges.tsx
│   ├── ServiceCard.tsx
│   ├── BookingSteps.tsx
│   ├── CleanerCard.tsx
│   ├── TrainingModule.tsx
│   ├── StarRating.tsx
│   └── layout/
│       ├── CustomerLayout.tsx
│       ├── CleanerLayout.tsx
│       ├── AdminLayout.tsx (sidebar)
│       └── BottomNav.tsx
```

### Implementation Order

1. Design system update (green brand colours, fonts)
2. Auth context + OTP login screen
3. Customer home page with trust badges and service selection
4. Booking flow (service → schedule → confirm)
5. Booking confirmation + OTP + active tracker + rating
6. Cleaner portal (dashboard, booking detail, OTP verify)
7. Enrolment multi-step registration form
8. Training programme viewer
9. Super admin dashboard with sidebar + all management pages
10. Mock data wiring throughout

All UI-complete with mock data. Backend integration (Supabase, Twilio for real OTP) can be added after.

