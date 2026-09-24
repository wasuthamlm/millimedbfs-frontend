"use client";

// Loads Meta Pixel / TikTok Pixel only once the visitor has granted marketing consent
// (rendered instead of the old unconditional <Script> tags — see app/(site)/layout.tsx).
// Fires one PageView per client-side route change, since next/link navigations don't
// reload the document. Ported from the intent of the legacy site's
// src/components/public/TrackingManager.jsx, minus its per-route "marketing eligibility"
// opt-out system (no equivalent concept exists in this project — out of scope here).
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useConsent } from "@/lib/consent/useConsent";
import { loadMetaPixel, loadTiktokPixel } from "@/lib/consent/trackers";

export function TrackingConsentGate({
  fbPixelId,
  tiktokPixelId,
}: {
  fbPixelId?: string | null;
  tiktokPixelId?: string | null;
}) {
  const { consentReady, consent } = useConsent();
  const pathname = usePathname();
  const lastTrackedPath = useRef<string>("");
  const marketingAllowed = consentReady && consent.marketing === true;

  useEffect(() => {
    if (!marketingAllowed) return;
    loadMetaPixel(fbPixelId);
    loadTiktokPixel(tiktokPixelId);
  }, [marketingAllowed, fbPixelId, tiktokPixelId]);

  useEffect(() => {
    if (!marketingAllowed || !pathname) return;
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;
    if (window.__millimedbfsMetaPixelLoaded && typeof window.fbq === "function") window.fbq("track", "PageView");
    if (window.__millimedbfsTikTokPixelLoaded && window.ttq?.page) window.ttq.page();
  }, [marketingAllowed, pathname]);

  return null;
}
