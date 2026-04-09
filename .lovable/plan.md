

# Premium Feature Upgrade -- Industry Standard Alignment

Based on analysis of Urban Company, Housekeep, and similar on-demand cleaning platforms, here are the missing standard features and UX improvements to make Clean Fit production-grade.

---

## 1. Service Browsing Page (Missing -- High Priority)

Currently `Services.tsx` just redirects to schedule-booking. Industry apps have a dedicated **service catalogue** page with categories, descriptions, pricing, and visual cards.

**Build**: New `customer/Services.tsx` with:
- Category tabs (Cleaning, Housekeeping, Deep Clean, Move-in/Move-out)
- Visual service cards with icons, starting prices, estimated duration
- "Book Now" CTA per service that pre-selects the service in ScheduleBooking
- Search/filter bar at top

---

## 2. Favourite Cleaners Page (Missing)

The `favourite_cleaners` table exists but there is no dedicated UI to browse and manage favourites. Urban Company and Housekeep let users "Request same cleaner" prominently.

**Build**: Add a **Favourites** section accessible from Profile or a new tab. Show favourite cleaners with rating, availability badge, and "Book Again" button that pre-fills ScheduleBooking with that cleaner preference.

---

## 3. Help & Support / FAQ Section (Missing -- Standard Feature)

Every cleaning app has an in-app help center. Currently Clean Fit has no support page.

**Build**: New `customer/Help.tsx` with:
- Searchable FAQ accordion (cancellation policy, pricing, safety, rescheduling)
- "Contact Support" button (opens WhatsApp or email)
- Link from Profile page

---

## 4. Rescheduling a Booking (Missing)

Users can cancel but cannot reschedule. Industry standard allows changing date/time of upcoming bookings.

**Build**: In `MyBookings.tsx`, add a "Reschedule" button for bookings with status `pending` or `assigned`. Opens a date/time picker sheet that updates the booking record.

---

## 5. Cleaner Profile Detail View (Missing for Customers)

When a cleaner is assigned, customers should be able to tap the cleaner name/avatar to see their full profile: rating breakdown, experience, specialisations, reviews, verified badge.

**Build**: New `customer/CleanerDetail.tsx` or a bottom sheet in `ActiveBooking.tsx` and `MyBookings.tsx`.

---

## 6. Service Guarantee Banner (Missing -- Trust Feature)

Urban Company prominently shows "100% Quality Assured" and Housekeep has "5-star service guaranteed". Clean Fit has trust badges but no guarantee policy page.

**Build**: Add a "CleanFit Guarantee" card on the Home page and a dedicated guarantee info sheet explaining re-clean policy, damage protection, and refund process.

---

## 7. Estimated Arrival Time (ETA) on Active Booking (Improvement)

The active booking screen should show a live ETA countdown when the cleaner is en-route, not just a status label.

**Build**: In `ActiveBooking.tsx`, calculate ETA from cleaner location data and show "Arriving in ~X min" with a progress bar.

---

## 8. Customer Wallet Page (Missing)

CoinBalance component exists on home but there is no dedicated wallet page showing transaction history, earn/spend breakdown, and redemption rules.

**Build**: New `customer/Wallet.tsx` with:
- Current balance prominently displayed
- Transaction history list (earned, spent, dates)
- "How coins work" explainer section
- Link from Home CoinBalance card and Profile

---

## 9. Admin Analytics Enhancements

**Add**: Customer retention rate, average booking value, cleaner utilization rate, and top-performing cleaners leaderboard to `admin/Reports.tsx`.

---

## 10. Cleaner Earnings Breakdown (Enhancement)

Current earnings page likely shows basic totals. Industry standard shows daily/weekly/monthly toggles, per-job breakdown, tips, bonuses, and payout schedule.

**Build**: Enhance `cleaner/Earnings.tsx` with period filters, job-by-job breakdown with before/after photos, and projected earnings.

---

## Technical Summary

| Action | File | Purpose |
|--------|------|---------|
| Rewrite | `customer/Services.tsx` | Full service catalogue with categories and cards |
| New | `customer/Help.tsx` | FAQ and support page |
| New | `customer/Wallet.tsx` | Coin transaction history and balance |
| New | `customer/CleanerDetail.tsx` | Cleaner profile view for customers |
| Edit | `customer/MyBookings.tsx` | Add reschedule functionality |
| Edit | `customer/Home.tsx` | Add guarantee banner, improve service browsing link |
| Edit | `customer/ActiveBooking.tsx` | Add ETA display and cleaner profile link |
| Edit | `customer/Profile.tsx` | Add links to Help, Wallet, Favourites |
| Edit | `cleaner/Earnings.tsx` | Period filters and per-job breakdown |
| Edit | `admin/Reports.tsx` | Retention and utilization metrics |
| Edit | `App.tsx` | Add new routes |
| Edit | `CustomerLayout.tsx` | Potentially add Services tab to bottom nav |

No database changes needed -- all required tables already exist.

