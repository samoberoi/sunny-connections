

# Fix 5 Critical/High-Severity Bugs

## Bug 1: Login phone validation rejects 5-digit test numbers

**File**: `src/pages/customer/Login.tsx`

Line 36 requires `phone.length < 10`. Change to `phone.length < 5` so test numbers like `11111`, `22222` work. Also update `roleHints` on line 33 to show 5-digit hints (`11111`, `22222`, `0000000000`). Update `handlePhoneChange` (line 27) to allow up to 11 digits instead of exactly 10, so both 5-digit test numbers and real 10-digit numbers work.

## Bug 2: SearchingCleaner uses invalid PostgREST join `cleaners(*)`

**File**: `src/pages/customer/SearchingCleaner.tsx`

Lines 51 and 97 use `.select('*, cleaners(*)')` which fails because `bookings` has no FK to `cleaners`. Fix: select only booking columns, then if `cleaner_id` exists, fetch the cleaner in a separate query (same pattern already used in the realtime handler on line 81). Replace both occurrences.

## Bug 3: Photo state not reset when switching jobs

**File**: `src/pages/cleaner/Jobs.tsx`

`beforePhotoUrl` and `afterPhotoUrl` (lines 38-39) persist when `selectedBooking` changes. Add a `useEffect` that resets both to `null` whenever `selectedBooking` changes.

## Bug 4: Missing admin UPDATE RLS policy on bookings

**Database migration**: Add policy so admins can update any booking (for cancel/reassign operations):
```sql
CREATE POLICY "Admins can update all bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

## Bug 5: ReferralCard Share/WhatsApp buttons already wired

The `ReferralCard.tsx` code already has working `shareWhatsApp` and `shareNative` handlers. The buttons are correctly wired with `onClick`. This is actually not a bug -- the buttons work. No changes needed here.

---

## Summary

| Fix | File | Change |
|-----|------|--------|
| Phone validation | `Login.tsx` | Accept 5+ digit numbers |
| PostgREST join | `SearchingCleaner.tsx` | Separate cleaner fetch instead of join |
| Photo state reset | `Jobs.tsx` | useEffect to clear photos on job switch |
| Admin UPDATE policy | Migration SQL | New RLS policy on bookings |

