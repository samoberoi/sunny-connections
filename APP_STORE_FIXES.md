# Apple App Store Rejection — Fix Pack

Apple rejected build 1.0 (1) for three reasons. Two require **native iOS** changes
that cannot live in JavaScript. Do these BEFORE re-submitting.

---

## 1. Camera crash on iPad (Guideline 2.1 — Performance)

**Root cause:** Tapping "Take Photo" from the avatar picker invoked the iOS
camera, but `Info.plist` is missing `NSCameraUsageDescription`. iOS kills any
app that touches the camera without that key — that is your crash log.

The same applies to the photo library (`NSPhotoLibraryUsageDescription`) and
geolocation (`NSLocationWhenInUseUsageDescription`).

### Fix

Open `ios/App/App/Info.plist` and add inside the top-level `<dict>`:

```xml
<key>NSCameraUsageDescription</key>
<string>Clean Fit needs camera access so you can take a profile photo and capture before/after photos of your cleaning job.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Clean Fit needs photo library access so you can choose a profile picture and attach photos to your bookings.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>Clean Fit saves cleaning before/after photos to your library when you tap save.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Clean Fit uses your location to auto-fill your home address and to share your live ETA with cleaners on the way.</string>

<key>NSMicrophoneUsageDescription</key>
<string>Clean Fit may record short voice notes when you contact a cleaner.</string>
```

Then run:

```
npx cap sync ios
```

and rebuild the archive in Xcode.

---

## 2. "App attempted to detect address indefinitely" (Guideline 2.1 — App Completeness)

**Two causes — both fixed:**

a) **Native side:** without `NSLocationWhenInUseUsageDescription` (added above),
   iOS shows no permission prompt and `getCurrentPosition` hangs forever.
b) **JS side:** `PositionOptions.timeout` is ignored by WKWebView while the
   permission prompt is showing. We now wrap every `getCurrentPosition` call
   in `src/lib/geolocate.ts → getCurrentPositionSafe()` which:
   - checks `navigator.permissions` first and rejects on `denied`
   - races the native call against a hard 10s `setTimeout`
   - always settles, so the "Detecting…" spinner can never get stuck

All four call sites (CustomerOnboarding, CleanerOnboarding, ExpressBooking,
ScheduleBooking) now use the safe wrapper.

---

## 3. Demo account (Guideline 2.1 — Information Needed)

Apple cannot review without test credentials. **You do not edit code for this** —
fill in the App Store Connect "App Review Information" panel.

Use your existing test seeds (already wired in the app):

```
Sign-in method: Phone number + OTP

Customer demo
  Phone: 7000000001
  OTP:   1111

Cleaner demo
  Phone: 7000000002
  OTP:   1111

Admin demo
  Phone: 7000000000
  OTP:   1111
```

In App Store Connect → your version → **App Review Information**:

- **Sign-in required:** YES
- **User name:** `7000000001`
- **Password:** `1111`
- **Notes:** paste:

> Clean Fit signs users in with a UK mobile number and a 4-digit OTP. For
> review, please use phone number 7000000001 with OTP 1111 (customer view).
> A cleaner-side demo is available at 7000000002 / OTP 1111, and an admin
> dashboard at 7000000000 / OTP 1111. The app is pre-populated with sample
> bookings, services, cleaners, and chat history so all flows can be tested
> end-to-end. The "Auto-detect my location" button on the address screen
> requires the Location permission; if denied, the address can be typed
> manually.

---

## Re-submission checklist

- [ ] Pulled latest, ran `npm install`
- [ ] Edited `ios/App/App/Info.plist` (5 keys above)
- [ ] `npm run build && npx cap sync ios`
- [ ] Tested **Take Photo** on a real iPad — no crash
- [ ] Tested **Auto-detect my location** — either fills the address or shows
      "Could not detect location" within 10s (never spins forever)
- [ ] Bumped build number in Xcode (e.g. 1.0 → 1.0 (2))
- [ ] Archived → uploaded
- [ ] Filled App Review Information with the demo phone + OTP above
- [ ] Tap **Add for Review**
