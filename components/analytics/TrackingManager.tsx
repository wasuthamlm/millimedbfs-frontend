"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useConsent } from "@/lib/consent/useConsent";
import { loadMetaPixel, loadTiktokPixel } from "@/lib/consent/trackers";
import { sanitizeGa4Id } from "@/lib/tracking-ids";
import { isMarketingEligible, subscribeMarketingEligibility } from "@/lib/analytics/marketingEligibility";
import { clearMarketingQueue, flushMarketingQueue } from "@/lib/analytics/marketingDispatcher";
import { isDispatchBlocked } from "@/lib/analytics/hardNavigation";
import { trackLineClick } from "@/lib/analytics/dataLayerEvents";

declare global {
  interface Window {
    __millimedbfsLastTrackedPath?: string;
    __millimedbfsMarketingPageViewPath?: string;
    __millimedbfsMeasurementPushed?: string;
  }
}

const LINE_HREF = /^https?:\/\/(line\.me|lin\.ee|page\.line\.me)\//i;

/**
 * Tracking startup sequence (legacy TrackingManager): consent default denied
 * (server HTML) → GTM → consent restore → GA4 measurement config via the
 * dataLayer → Meta/TikTok only with marketing consent AND a marketing-eligible
 * page → one virtual page view per client navigation.
 *
 * GA4/GTM never depend on marketing eligibility; Meta/TikTok always do, because
 * those SDKs collect URL/referrer/title on their own once loaded.
 */
export function TrackingManager({
  ga4Id,
  fbPixelId,
  tiktokPixelId,
  consentBanner,
}: {
  /** Only when GTM is installed: GTM owns the GA4 tag and reads this id from the dataLayer. */
  ga4Id?: string | null;
  fbPixelId?: string | null;
  tiktokPixelId?: string | null;
  /** Cookie banner switched on — pixels wait for consent. Off: pixels load as before (owner's choice). */
  consentBanner: boolean;
}) {
  const { consentReady, consent } = useConsent();
  const pathname = usePathname() || "/";
  const lastTracked = useRef("");

  // Eligibility is declared by the page once it renders — re-render on change.
  const [, bump] = useState(0);
  useEffect(() => subscribeMarketingEligibility(() => bump((n) => n + 1)), []);
  const eligible = isMarketingEligible();
  const marketingAllowed = consentBanner ? consentReady && consent.marketing === true && eligible : eligible;
  const analyticsReady = consentBanner ? consentReady : true;

  // GA4 config through the dataLayer (GTM's GA4 tag reads it) — pushed once.
  useEffect(() => {
    const id = sanitizeGa4Id(ga4Id);
    if (!analyticsReady || !id || window.__millimedbfsMeasurementPushed === id) return;
    window.__millimedbfsMeasurementPushed = id;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "millimedbfs_measurement_config_ready", ga4_measurement_id: id });
  }, [analyticsReady, ga4Id]);

  // Marketing pixels — consent (when the banner is on) AND an eligible page.
  useEffect(() => {
    if (isDispatchBlocked() || !marketingAllowed) return;
    loadMetaPixel(fbPixelId);
    loadTiktokPixel(tiktokPixelId);
    flushMarketingQueue();
  }, [marketingAllowed, fbPixelId, tiktokPixelId]);

  // Page not eligible / consent withdrawn: stop what an already-loaded SDK may still do.
  useEffect(() => {
    if (marketingAllowed) return;
    clearMarketingQueue(consent.marketing === true ? "route_not_marketing_eligible" : "marketing_consent_not_granted");
    try {
      if (window.__millimedbfsMetaPixelLoaded && typeof window.fbq === "function") window.fbq("consent", "revoke");
    } catch {}
    try {
      if (window.__millimedbfsTikTokPixelLoaded) window.ttq?.disableCookie?.();
    } catch {}
  }, [marketingAllowed, consent.marketing, pathname]);

  // One page view per navigation: GA4 via GTM always, Meta/TikTok only when allowed.
  useEffect(() => {
    if (!analyticsReady) return;
    if (lastTracked.current !== pathname && window.__millimedbfsLastTrackedPath !== pathname) {
      lastTracked.current = pathname;
      window.__millimedbfsLastTrackedPath = pathname;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "millimedbfs_virtual_page_view",
        page_location: `${window.location.origin}${pathname}`,
        page_path: pathname,
        page_title: document.title,
      });
    }
    if (!marketingAllowed || window.__millimedbfsMarketingPageViewPath === pathname) return;
    window.__millimedbfsMarketingPageViewPath = pathname;
    if (window.__millimedbfsMetaPixelLoaded && typeof window.fbq === "function") window.fbq("track", "PageView");
    if (window.__millimedbfsTikTokPixelLoaded) window.ttq?.page?.();
  }, [analyticsReady, marketingAllowed, pathname]);

  // line_click for every LINE link on the site (menus, widgets, contact info, content).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (a && (a.hasAttribute("data-line-click") || LINE_HREF.test(a.href))) trackLineClick();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
