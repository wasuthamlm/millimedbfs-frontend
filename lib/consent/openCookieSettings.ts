"use client";

// Public action used by the footer link (CookieSettingsLink.tsx) to reopen the cookie
// settings dialog. Backed by a tiny subscribable store instead of a DOM event: a
// request made before <CookieConsent /> subscribes is queued instead of lost.
// Ported from the legacy site's src/lib/consent/openCookieSettings.js.

let pending = false;
const listeners = new Set<() => void>();

export function openCookieSettings() {
  if (listeners.size === 0) {
    pending = true;
    return;
  }
  listeners.forEach((fn) => fn());
}

/** Subscribes the dialog; immediately flushes a queued request. */
export function subscribeOpenCookieSettings(fn: () => void) {
  listeners.add(fn);
  if (pending) {
    pending = false;
    fn();
  }
  return () => {
    listeners.delete(fn);
  };
}
