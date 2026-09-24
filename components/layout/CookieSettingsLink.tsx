"use client";

import { openCookieSettings } from "@/lib/consent/openCookieSettings";

// The Cookie Policy page (/cookie-policy) promises visitors can reopen their cookie
// choice anytime via a footer link. This is that link — it just requests the settings
// dialog to open (components/layout/CookieConsent.tsx subscribes to the request); it's
// a no-op when the cookie-consent widget is disabled (nothing is listening).
export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => openCookieSettings()} className={className}>
      ตั้งค่าคุกกี้
    </button>
  );
}
