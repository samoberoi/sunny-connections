

# Comprehensive UI/UX Polish, Notification Navigation, Leave Flow, and Report Generation

## Summary
Fix UI alignment/visibility issues across all screens, add notification tap navigation, add clear-all notifications, fix leave request flow with notifications, add photo upload to customer onboarding, enforce required fields, and generate a final Excel report of all functionality.

---

## Issues & Fixes

### 1. Map overlay text visibility (Customer Home + Cleaner Dashboard)
**Problem:** Text on the map header can be hard to read against light map tiles. The gradient overlay is too transparent.
**Fix:** Add a stronger `bg-background/90` or `bg-black/40` backdrop behind header text on both `Home.tsx` and cleaner `Dashboard.tsx`. Add `text-shadow` or a pill background behind the "Hello, Name" and cleaner name to ensure readability regardless of map tile color.

### 2. Notification tap → navigate to relevant section
**Problem:** Tapping a notification only marks it as read; doesn't navigate anywhere.
**Fix:** In `Notifications.tsx`, add `useNavigate` and on click: parse `n.type` — `booking` → `/my-bookings` (customer) or `/cleaner/jobs` (cleaner), `promo` → `/services`, `system` → stay. Also pass booking context in the notification `message` field to deep-link where possible.

### 3. Clear all notifications button
**Problem:** No way to clear/dismiss notifications in bulk.
**Fix:** Add a "Clear All" button at the top of `Notifications.tsx` that updates all unread notifications to `read: true` for the current user.

### 4. Admin can't see cleaner leave requests
**Problem:** The admin Leaves page uses `.select('*, cleaners(name, user_id)')` — this works, but the query might fail if the `cleaners` join relation isn't recognized due to missing FK. Need to verify the join works.
**Fix:** Verify the join. If it fails, switch to a two-step query: fetch leaves, then fetch cleaner names separately by matching `cleaner_id`.

### 5. Leave request notifications
**Problem:** When a cleaner submits a leave request, no notification is sent to the admin or affected customers.
**Fix:** In `Schedule.tsx` `requestLeave` mutation's `onSuccess`, insert a notification for all admin users (query `user_roles` for admin role, then insert notifications). Also notify affected customers whose bookings fall within the leave dates.

### 6. Customer onboarding: add photo upload, first/last name split, email field
**Problem:** Onboarding only asks for a single "name" field and address. No photo, no email, no first/last name split.
**Fix:** 
- Split name into "First name" and "Last name" (both required).
- Add optional photo upload (avatar) using the `job-photos` storage bucket or skip.
- Add email field (optional).
- Phone auto-filled from auth context (display only).
- Keep address step as-is (already required).

### 7. UI consistency: flat outline icons throughout
**Problem:** Some icons use `fill` prop (e.g., Star icons), some use different stroke widths.
**Fix:** Audit all pages, ensure all icons use `strokeWidth={1.5}` consistently. Remove `fill` from Star icons where used decoratively (keep fill only for active rating states). Use outline-only Lucide icons everywhere.

### 8. Text/button visibility and contrast issues
**Problem:** Some text (e.g., `text-background/40`, `text-muted-foreground/50`) is too faint. Some buttons on dark backgrounds lack contrast.
**Fix:** Replace `text-background/40` with `text-background/60`, `text-muted-foreground/50` with `text-muted-foreground/70` across all files. Ensure all interactive elements have at least 4.5:1 contrast ratio.

### 9. Reports page alignment
**Problem:** Pie chart labels can overflow on mobile. Revenue bars may not align well.
**Fix:** Reduce pie chart `outerRadius` to 70 for mobile, truncate labels further, and add `fontSize: 9` to pie labels. Ensure consistent padding.

### 10. Reduce excessive scrolling
**Problem:** Some pages have too much vertical content.
**Fix:** Collapse sections like "Property Details" and "Cleaning History" on the profile page behind expandable/collapsible sections. Use tabs instead of stacked sections where appropriate.

### 11. Generate final Excel report
**Problem:** User wants a comprehensive Excel report of all functionality.
**Fix:** Generate an XLSX file at `/mnt/documents/cleanfit_report.xlsx` with sheets: Features, Bug Fixes, UI Changes, Test Results.

---

## Technical Details

### Files to edit:

| File | Changes |
|------|---------|
| `src/pages/customer/Notifications.tsx` | Add navigation on tap by type, add "Clear All" button, add "Mark all read" mutation |
| `src/pages/customer/Home.tsx` | Improve map header text visibility with stronger backdrop |
| `src/pages/cleaner/Dashboard.tsx` | Same map header fix |
| `src/components/CustomerOnboarding.tsx` | Split into first/last name, add optional avatar upload, add email, auto-show phone |
| `src/pages/cleaner/Schedule.tsx` | Send notification to admins + affected customers on leave request |
| `src/pages/admin/Leaves.tsx` | Verify join works, add fallback query if needed |
| `src/pages/admin/Reports.tsx` | Fix pie chart sizing, label truncation, improve mobile layout |
| `src/pages/customer/Profile.tsx` | Collapsible sections, icon consistency |
| `src/pages/cleaner/Profile.tsx` | Icon consistency, contrast fixes |
| `src/pages/cleaner/Earnings.tsx` | Contrast/visibility fixes |
| `src/index.css` | Add text-shadow utility if needed |
| Multiple files | Global: `strokeWidth={1.5}` consistency, remove Star fills, fix low-contrast text classes |
| Script (exec) | Generate XLSX report with openpyxl |

### No database migrations needed
- Notifications table already supports insert for all users
- Profile table already has `avatar` column
- `job-photos` bucket already exists for uploads

