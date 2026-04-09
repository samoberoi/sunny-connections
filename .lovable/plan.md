

# Fix Schedule Booking Smart Questions, Recurring Job Assignment, and Done Tab Details

## Summary
Four issues to fix:
1. Schedule Booking asks irrelevant questions (bedrooms/bathrooms for kitchen-only cleaning). Make questions context-aware based on selected services.
2. Recurring scheduled bookings should auto-assign a permanent cleaner and show all future instances in the cleaner's Upcoming tab.
3. Cleaner "Done" tab should show full job details (rating, review, service type, earnings, address) but no phone numbers.
4. Remove any phone number display from cleaner job cards.

---

## 1. Smart Context-Aware Questions in ScheduleBooking

**Problem**: The `serviceQuestions` map uses hardcoded keys (`bathroom`, `kitchen`) that don't match DB service IDs. Step 2 always asks bedrooms/bathrooms/size regardless of what service was selected.

**Fix**: Replace the `serviceQuestions` map with a name-based lookup that maps DB service names to relevant questions. Remove Step 2's generic bedrooms/bathrooms/size questions and instead derive them from Step 1's service-specific answers.

Service-to-question mapping:
- **Kitchen Deep Clean** → "How many kitchens?" (1-3)
- **Bathroom Refresh** → "How many bathrooms?" (1-4)
- **Bedroom Cleaning** → "How many bedrooms?" (1-5)
- **Living Room Tidy** → "How many living rooms?" (1-3)
- **Deep Cleaning** → "How many rooms?" (1-6)
- **Laundry & Ironing** → "How many people's laundry?" (1-5)
- **Bed Making & Linen Change** → "How many beds?" (1-5)
- **Organising & Decluttering** → "How many rooms to organise?" (1-4)
- **Standard House Clean / Full Express Clean / General Housekeeping** → "How many rooms total?" (2-8)
- **End of Tenancy** → "How many rooms total?" (2-10)
- Services without specific questions (Dusting, Air & Freshen, Trash) → no follow-up

Step 2 will only show **property type, size, and tier** (remove bedrooms/bathrooms from Step 2 since they're now captured contextually in Step 1).

## 2. Recurring Booking Auto-Assignment

**Problem**: When a cleaner accepts a recurring scheduled booking, future generated instances don't auto-assign to the same cleaner.

**Fix**: In `CleanerJobs.tsx` `acceptJob` mutation, after accepting a scheduled booking with `recurring != 'none'`, also update any other bookings from the same customer with the same `service_name` and `recurring` value that are still pending/unassigned — set them to the same cleaner (permanent assignment).

## 3. Enhanced Done Tab

**Problem**: Done tab only shows service name, customer name, date, cost, and rating number. Missing: review text, address, service type badge.

**Fix**: Expand the Done tab card to be tappable, showing:
- Service name with Express/Scheduled badge
- Customer name (no phone)
- Address (line1, postcode)
- Date and duration
- Earnings amount
- Star rating display
- Review text (if any)
- Before/After photo thumbnails (fetch from job_photos)

## 4. Remove Phone Numbers

**Problem**: `handleCallCustomer` fetches phone and could expose it.

**Fix**: Keep the Call button functional (it uses `tel:` protocol which is fine), but ensure no phone number text is ever displayed in the UI. The existing code already doesn't display phone numbers in cards — just verify `handleChatCustomer` doesn't pass phone to chat unnecessarily (it currently passes `otherPhone` — remove that).

---

## File Changes

| Action | File | Description |
|--------|------|-------------|
| Edit | `src/pages/customer/ScheduleBooking.tsx` | Replace hardcoded `serviceQuestions` with name-based mapping; remove bedrooms/bathrooms from Step 2 |
| Edit | `src/pages/cleaner/Jobs.tsx` | Auto-assign recurring bookings to same cleaner; enhance Done tab with full details; remove phone from chat navigation |

No database migrations needed.

