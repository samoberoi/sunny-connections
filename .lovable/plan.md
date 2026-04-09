

# Fix Communication, Photo Display, Job Matching, and UX Flow Issues

## Overview
This plan addresses the core bugs across customer and cleaner views: broken chat/call, photo not reflecting, job specialization mismatch, missing map pathway, chat templates, and notification sounds.

---

## 1. Fix Customer Chat & Call Buttons (SearchingCleaner + ActiveBooking)

**Problem**: In `SearchingCleaner.tsx` (lines 259-264), Call and Chat buttons have no `onClick` handlers. In `ActiveBooking.tsx`, the chat button passes `cleanerProfile?.phone` but the phone fetch may fail if cleaner_id isn't populated yet.

**Fix**:
- `SearchingCleaner.tsx`: Wire Call button to fetch cleaner's phone from `cleaners → user_id → profiles.phone`. Wire Chat button to navigate to `/chat` with `bookingId` and `otherName`.
- `ActiveBooking.tsx`: Ensure chat navigates with correct booking ID. Auto-fetch phone on mount when cleaner is assigned.

**Files**: `src/pages/customer/SearchingCleaner.tsx`, `src/pages/customer/ActiveBooking.tsx`

## 2. Fix Cleaner Call Button (Jobs.tsx)

**Problem**: The Call button in Jobs.tsx (line 271-275) fetches phone from `profiles` using `customer_id` as `user_id`, which is correct. But if the customer profile has no phone stored, it fails.

**Fix**: The fetch logic is correct. Ensure we also pass `otherPhone` when navigating to chat so the call button in Chat.tsx works too.

**Files**: `src/pages/cleaner/Jobs.tsx`

## 3. Fix Photo Not Reflecting on Cleaner Screen

**Problem**: `PhotoCapture.tsx` uses `useState` with `existingUrl` as initial value, but `existingUrl` is only passed when the component mounts. When the photo uploads, it calls `onPhotoUploaded(url)` which sets `beforePhotoUrl`/`afterPhotoUrl` in Jobs.tsx -- this works. The real issue is that after uploading, the `preview` state is set but the `beforePhotoUrl` state in Jobs.tsx is reset by the `useEffect` on line 67-78 that clears photos on `selectedBooking` change. Need to fetch existing photos from `job_photos` table on job select instead of always resetting to null.

**Fix**: In `Jobs.tsx`, when `selectedBooking` changes, query `job_photos` for existing before/after photos for that booking instead of blindly setting to null.

**Files**: `src/pages/cleaner/Jobs.tsx`

## 4. Fix "Start Cleaning" Button Stays Disabled

**Problem**: After uploading a before photo, `beforePhotoUrl` should be set via `onPhotoUploaded`. But the `useEffect` on line 67 resets it to null when `allBookings` changes (since it depends on `allBookings`). The realtime subscription invalidates `allBookings` on every booking change, which triggers the reset.

**Fix**: Remove `allBookings` from the dependency of the photo-reset `useEffect`, or better: fetch photos from DB when selecting a job. Derive `hasArrived` separately from photo state.

**Files**: `src/pages/cleaner/Jobs.tsx`

## 5. Fix Job Specialization Matching

**Problem**: The matching logic (lines 91-110) uses loose string matching. A cleaner with "House Cleaning" specialization sees housekeeping jobs because the category match checks `jobService.includes('clean')` which matches "House Cleaning" but the broader check `s.includes('house cleaning')` returns true for any job containing "clean".

**Fix**: Tighten the matching -- map service names to categories explicitly. "Housekeeping", "Laundry & Iron", "Bed Making", "Organisation" → housekeeping category. "Deep Clean", "Kitchen Blitz", "Bathroom Blitz" → cleaning category. Match cleaner specializations against these categories.

**Files**: `src/pages/cleaner/Jobs.tsx`

## 6. Simplify Customer ActiveBooking View

**Problem**: User wants: map with pathway + ETA, cleaner profile with Call/Chat, Cancel button. Remove "Track Live" button. Remove the status timeline stepper (too many steps visible).

**Fix**:
- Replace the grid-based fake map with `SimulatedMap` component showing cleaner marker moving toward customer marker with a dashed "pathway" line
- Show cleaner profile card with Call + Chat buttons prominently
- Keep ETA banner and OTP section
- Show before/after photos as they appear
- Remove the status timeline stepper; replace with a simple status badge
- Add Cancel button when status is pre-completion
- Remove "Track Live" from SearchingCleaner; auto-navigate to ActiveBooking when cleaner is confirmed

**Files**: `src/pages/customer/ActiveBooking.tsx`, `src/pages/customer/SearchingCleaner.tsx`

## 7. Simplify Cleaner Job Detail View

**Problem**: User wants: map with pathway to client, ETA, client profile with Call/Chat, Enter OTP, Cancel. No "Live Tracking" button.

**Fix**:
- Add `SimulatedMap` at top of job detail showing cleaner→client pathway
- Show estimated time based on simulated distance
- Keep existing Call/Chat/OTP/Photo flow
- Ensure photos reflect on screen after upload (fix from #3/#4)

**Files**: `src/pages/cleaner/Jobs.tsx`

## 8. Add Chat Quick Templates for Cleaner

**Problem**: Cleaner wants pre-written messages like "I am on the way", "Stuck in traffic", "I have arrived".

**Fix**: Add a row of template chips above the chat input in `Chat.tsx`. When tapped, auto-fill and send the message. Also send a notification to the recipient.

**Files**: `src/pages/customer/Chat.tsx`

## 9. Chat Notification on New Message

**Problem**: When a message is sent, the recipient gets no notification.

**Fix**: After inserting a message in `Chat.tsx`, also insert a notification for the other party: "New message from {name}".

**Files**: `src/pages/customer/Chat.tsx`

## 10. Notification Sound

**Problem**: No audio feedback when notifications arrive.

**Fix**: Add a short notification sound (using Web Audio API or a small mp3). Play it when a new notification is detected via realtime subscription. Add to `Notifications.tsx` and also to the `ActiveBookingFloater` when status changes.

**Files**: `src/pages/customer/Notifications.tsx`, `src/components/ActiveBookingFloater.tsx`, new utility `src/lib/notificationSound.ts`

## 11. Auto-Navigate from SearchingCleaner to ActiveBooking

**Problem**: After cleaner is found and confirmed, user has to tap "Track Live" to go to ActiveBooking.

**Fix**: After the 3-second "found" animation, auto-navigate to `/active-booking` instead of showing a "Track Live" button.

**Files**: `src/pages/customer/SearchingCleaner.tsx`

## 12. Photos Reflect on Customer Dashboard in Real-Time

**Problem**: Photos uploaded by cleaner don't auto-reflect on customer's ActiveBooking.

**Fix**: Add realtime subscription on `job_photos` table for the active booking ID. Invalidate the `job-photos` query when new photos are inserted.

**Files**: `src/pages/customer/ActiveBooking.tsx`

---

## Summary of File Changes

| File | Changes |
|------|---------|
| `src/pages/customer/SearchingCleaner.tsx` | Wire Call/Chat buttons, auto-navigate to ActiveBooking |
| `src/pages/customer/ActiveBooking.tsx` | Use SimulatedMap with pathway, simplify to profile+call+chat+cancel, realtime photos |
| `src/pages/customer/Chat.tsx` | Add quick templates, send notification on message, fetch phone for call |
| `src/pages/cleaner/Jobs.tsx` | Fix photo state persistence, tighten specialization matching, add map to job detail |
| `src/components/ActiveBookingFloater.tsx` | Add notification sound on status change |
| `src/lib/notificationSound.ts` | New: utility to play notification ding |
| `src/pages/customer/Notifications.tsx` | Play sound on new notification |

No database migrations needed -- all required tables and RLS policies exist.

