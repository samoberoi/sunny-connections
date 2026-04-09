

# Restructure Service Hierarchy: Express/Schedule → House Cleaning/Housekeeping → Specializations

## Problem
The app has mismatched service names across different views. The database has services like "Regular Cleaning" which doesn't exist as a real offering. Cleaner onboarding uses hardcoded categories that don't match the DB. Express and Schedule booking flows have their own hardcoded service lists that are disconnected from the database.

## Architecture

The hierarchy should be:

```text
Service Mode (Express / Scheduled)
  └── Service Type (House Cleaning / Housekeeping)
       └── Specializations (from DB services table)
            e.g. House Cleaning: Kitchen Deep Clean, Deep Cleaning, End of Tenancy, Bathroom Refresh, etc.
            e.g. Housekeeping: Laundry & Ironing, Bed Making & Linen Change, General Housekeeping, Organising & Decluttering
```

## Changes

### 1. Update Database Services (data fix)
- Rename "Regular Cleaning" → remove or rename to something meaningful like "Standard House Clean"
- Ensure all services in DB have correct `category` of either `cleaning` or `housekeeping`
- Add any missing services that appear in Express/Schedule booking hardcoded lists (e.g., "Bathroom Refresh", "Living Room Tidy", "Air & Freshen")

### 2. Add `service_mode` Column to Services Table (migration)
Add a column `service_mode` (text, default `'both'`) with values: `'express'`, `'scheduled'`, or `'both'`. This lets the admin control which services appear in which booking mode.

### 3. Refactor Cleaner Onboarding (`CleanerOnboarding.tsx`)
**Step 2** becomes a 3-part selection:
1. **Service Mode**: "Express Cleaning" and/or "Scheduled Cleaning" (two cards with descriptions, multi-select)
2. **Service Type**: "House Cleaning" and/or "Housekeeping" (two cards, multi-select)
3. **Specializations**: Dynamically fetched from DB `services` table, filtered by the selected category (cleaning/housekeeping). If both types selected, combine and show all. Multi-select.

Save the selected service mode preference to the cleaner record (new column `service_modes text[] default '{}'`).

### 4. Refactor Express Booking (`ExpressBooking.tsx`)
- Instead of hardcoded `expressServices`, fetch from DB: `services` where `service_mode IN ('express', 'both')` and `active = true`
- Keep the category toggle (House Cleaning / Housekeeping) but populate services from DB
- Map DB service names to icons using an icon mapping dictionary

### 5. Refactor Schedule Booking (`ScheduleBooking.tsx`)
- Replace hardcoded `serviceOptions` with DB fetch: `services` where `service_mode IN ('scheduled', 'both')` and `active = true`
- Group by `category` for the cleaning/housekeeping toggle

### 6. Admin Services Page (`admin/Services.tsx`)
- Make "Add Service" functional: dialog/form with name, description, category (cleaning/housekeeping), service_mode (express/scheduled/both), rate, duration
- Make "Edit" button functional: same form pre-filled
- Add "Delete" button with confirmation
- Show `service_mode` badge on each card

### 7. Cleaner Job Matching
- The existing `jobMatchesSpecialisations` helper already matches by service name. Since we're syncing all names from DB, this will work automatically once cleaner specialisations match DB service names.

### 8. Customer Home Page (`Home.tsx`)
- The quick-action cards ("Express Clean", "Schedule Clean") already exist and navigate correctly -- no changes needed here.

### 9. Enrolment Register (`enrol/Register.tsx`)
- Update step 2 (Experience) to also fetch specializations from DB instead of using hardcoded comma-separated input.

---

## Database Changes

**Migration 1**: Add `service_mode` column and `service_modes` to cleaners
```sql
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_mode text NOT NULL DEFAULT 'both';
ALTER TABLE cleaners ADD COLUMN IF NOT EXISTS service_modes text[] NOT NULL DEFAULT '{}';
```

**Data Update**: Rename "Regular Cleaning" to "Standard House Clean" (or delete and recreate with proper name). Add missing services like "Bathroom Refresh", "Living Room Tidy" if they don't exist.

## File Changes Summary

| Action | File | Description |
|--------|------|-------------|
| Migration | SQL | Add `service_mode` to services, `service_modes` to cleaners |
| Data | SQL | Rename/sync service names, set service_mode values |
| Edit | `src/hooks/useServices.ts` | Add `service_mode` to `ServiceRow` type |
| Edit | `src/components/CleanerOnboarding.tsx` | 3-part selection: mode → type → DB specializations |
| Edit | `src/pages/customer/ExpressBooking.tsx` | Fetch services from DB instead of hardcoded list |
| Edit | `src/pages/customer/ScheduleBooking.tsx` | Fetch services from DB instead of hardcoded list |
| Edit | `src/pages/admin/Services.tsx` | Add/Edit/Delete service functionality with mode field |
| Edit | `src/pages/enrol/Register.tsx` | Fetch specializations from DB |
| Edit | `src/pages/customer/Services.tsx` | Show service_mode badge |

