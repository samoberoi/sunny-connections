

# Fix Photo Navigation, Multi-Photo, Chat Templates, Real-Time Sync, and Scheduled Bookings

## Summary
Fix 7 issues: photo upload navigating away from page, single-photo limitation, role-specific chat templates, real-time photo sync for customers, full-screen image viewer, scheduled booking display in MyBookings, and Today/Upcoming toggle for cleaner jobs.

---

## 1. Fix Photo Upload Navigating Away (PhotoCapture.tsx + Jobs.tsx)

**Root cause**: After `PhotoCapture` calls `onPhotoUploaded`, the realtime subscription on `bookings` table fires (from status changes or other updates), which invalidates `cleaner-all-bookings` query. This causes `allBookings` to re-render, and the `useEffect` on `selectedBooking` may reset state or trigger navigation.

**Fix**:
- In `PhotoCapture.tsx`: Remove `capture="environment"` from the file input (this forces camera on mobile and can cause page navigation on some browsers). Change to just `accept="image/*"`.
- In `Jobs.tsx`: Ensure `completeJob` and `startJob` do NOT call `setSelectedBooking(null)` prematurely. Only `completeJob` should clear selection after success. Guard the photo-fetching `useEffect` to not overwrite if photos are already set locally.

## 2. Support Multiple Photo Uploads (PhotoCapture.tsx)

**Current**: Single photo per type (before/after). Component shows one preview and replaces it.

**Fix**: Refactor `PhotoCapture` to accept `multiple` prop. Allow `input` to accept multiple files. Store an array of uploaded URLs. Display a horizontal scrollable gallery of thumbnails. Each can be tapped for full-screen view or deleted.

**Changes**:
- Add `multiple?: boolean` prop
- Change `input` to `multiple` attribute when prop is true
- Track `photos: string[]` state instead of single `preview`
- Upload each file in sequence
- Call `onPhotoUploaded` with the latest URL (parent still gets notified)
- Show grid/row of thumbnails with delete buttons

## 3. Full-Screen Image Viewer

**New component**: `src/components/ImageViewer.tsx` -- a simple modal/dialog that shows an image full-screen with close button. Used in:
- `PhotoCapture.tsx` -- tap a thumbnail to view full-screen
- `ActiveBooking.tsx` -- tap before/after photos to view full-screen

## 4. Role-Specific Chat Quick Templates (Chat.tsx)

**Current**: Same templates for all users ("I am on the way", "Stuck in traffic", etc.)

**Fix**: Determine user's role from the booking context. If `sender_id === booking.customer_id`, show customer templates. Otherwise show cleaner templates.

- **Cleaner templates**: "I am on the way 🚗", "Stuck in traffic 🚦", "I have arrived 📍", "Please open the door 🚪", "Starting now 🧹"
- **Customer templates**: "Okay, I'm here 🏠", "Please come fast ⏰", "Door is open 🚪", "Take your time 😊", "Thank you! 🙏"

Fetch booking's `customer_id` once on mount to determine role.

## 5. Real-Time Photo Sync for Customer (ActiveBooking.tsx)

**Current**: Realtime subscription on `job_photos` exists (lines 101-112) and invalidates `job-photos` query. This should already work.

**Fix**: The issue is likely that the `job_photos` realtime channel isn't receiving events because `job_photos` table may not be added to `supabase_realtime` publication. Need to add it via migration:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_photos;
```

Also make photos tappable for full-screen viewing using the new `ImageViewer` component.

## 6. Scheduled Bookings Toggle in MyBookings (MyBookings.tsx)

**Current**: Shows "Upcoming" and "Past" sections with no filtering.

**Fix**: Add a `ToggleGroup` at the top with three options: "Express", "Scheduled", "All". Filter upcoming bookings accordingly:
- Express: `service_name` includes "express" or "blitz"
- Scheduled: `recurring !== 'none'`
- Show scheduled bookings with their recurring frequency badge and next occurrence dates

## 7. Today/Upcoming Toggle for Cleaner Jobs (Jobs.tsx)

**Current**: "Upcoming" tab shows all assigned/en-route jobs without date filtering.

**Fix**: Add a sub-toggle inside the "Upcoming" tab: "Today" (default) and "Upcoming". Filter by comparing `booking.date` with today's date. Show a notification dot on "Upcoming" when there are future jobs.

## 8. Daily Notification for Scheduled Jobs

Add a check in the existing realtime/polling logic: when a cleaner has jobs for tomorrow, auto-insert a notification. This can be done client-side on cleaner dashboard load by checking if tomorrow's jobs exist and if a reminder notification was already sent (check notifications table).

---

## File Changes

| Action | File | Changes |
|--------|------|---------|
| Edit | `src/components/PhotoCapture.tsx` | Multi-photo support, remove `capture="environment"`, thumbnail gallery, full-screen tap |
| Create | `src/components/ImageViewer.tsx` | Full-screen image modal component |
| Edit | `src/pages/cleaner/Jobs.tsx` | Guard photo state reset, Today/Upcoming sub-toggle in Upcoming tab |
| Edit | `src/pages/customer/ActiveBooking.tsx` | Tappable photos with ImageViewer, ensure realtime works |
| Edit | `src/pages/customer/Chat.tsx` | Role-specific quick templates based on booking context |
| Edit | `src/pages/customer/MyBookings.tsx` | Express/Scheduled/All toggle filter |
| Migration | SQL | `ALTER PUBLICATION supabase_realtime ADD TABLE public.job_photos;` |

