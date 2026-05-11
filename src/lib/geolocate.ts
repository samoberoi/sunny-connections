/**
 * Safe geolocation wrapper with a hard race timeout.
 *
 * iOS Safari / WKWebView ignores `PositionOptions.timeout` while the
 * permission prompt is showing, which can leave the UI stuck "Detecting…"
 * indefinitely (Apple App Review rejection 2.1.0). We race the native
 * call against a manual timer so the promise *always* settles.
 */
export async function getCurrentPositionSafe(
  hardTimeoutMs = 10_000
): Promise<GeolocationPosition> {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    throw new Error('Geolocation not supported');
  }

  // Quickly bail on denied permission rather than hanging.
  try {
    // @ts-ignore - permissions API not in all TS libs
    if (navigator.permissions?.query) {
      // @ts-ignore
      const status = await navigator.permissions.query({ name: 'geolocation' });
      if (status.state === 'denied') {
        throw new Error('Location permission denied');
      }
    }
  } catch {
    // ignore — fall through to actual request
  }

  return await new Promise<GeolocationPosition>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error('Location request timed out'));
    }, hardTimeoutMs);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(pos);
      },
      (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(err);
      },
      { timeout: hardTimeoutMs, maximumAge: 60_000, enableHighAccuracy: false }
    );
  });
}
