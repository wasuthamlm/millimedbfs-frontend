"use client";

// Single marketing dispatcher — the ONLY place that calls fbq()/ttq() for events
// (legacy src/lib/analytics/marketingDispatcher.js).
//
// - Never loads a pixel (TrackingManager owns loading) and never touches the dataLayer.
// - Dispatches only when consent is hydrated, marketing consent is granted AND the
//   current route is marketing-eligible.
// - No business identifiers: an opaque per-action token is used for dedupe only.
// - A bounded in-memory queue covers "consent granted but SDK still loading";
//   dropped on revoke or navigation, never persisted.

import { isConsentReady, getConsent } from "@/lib/consent/consentStore";
import { isMarketingEligible } from "./marketingEligibility";

type Destination = "meta" | "tiktok";
type Item = { destination: Destination; name: string; custom: boolean; token: string; event: string; path?: string };

/** Application event → destination event names. `custom` = not a standard event. */
const EVENT_MAP: Record<string, { meta: string; tiktok: string; custom?: boolean }> = {
  generate_lead: { meta: "Lead", tiktok: "SubmitForm" },
  view_content: { meta: "ViewContent", tiktok: "ViewContent" },
  line_click: { meta: "LineClick", tiktok: "LineClick", custom: true },
  video_start: { meta: "VideoStart", tiktok: "VideoStart", custom: true },
  video_complete: { meta: "VideoComplete", tiktok: "VideoComplete", custom: true },
};

const QUEUE_MAX = 10;
let queue: Item[] = [];
const commanded = new Set<string>();

const currentPath = () => (window.location.pathname || "/").split("?")[0].split("#")[0];
const log = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== "production") console.debug("[marketing]", ...args);
};

export const metaReady = () => window.__millimedbfsMetaPixelLoaded === true && typeof window.fbq === "function";
export const tiktokReady = () => window.__millimedbfsTikTokPixelLoaded === true && typeof window.ttq?.track === "function";

/** The reason nothing may reach an SDK right now, or null when it's allowed. */
function gateClosedReason(): string | null {
  if (window.__millimedbfsDispatchBlocked === true) return "hard_navigation_in_progress";
  if (!isConsentReady()) return "consent_not_hydrated";
  if (getConsent().marketing !== true) return "marketing_consent_not_granted";
  if (!isMarketingEligible()) return "route_not_marketing_eligible";
  return null;
}

function commandSdk({ destination, name, custom, token }: Item): "commanded" | "duplicate" | "pending" {
  const key = `${destination}|${token}`;
  if (commanded.has(key)) return "duplicate";
  if (destination === "meta") {
    if (!metaReady()) return "pending";
    commanded.add(key);
    window.fbq!(custom ? "trackCustom" : "track", name);
    return "commanded";
  }
  if (!tiktokReady()) return "pending";
  commanded.add(key);
  (window.ttq!.track as (name: string) => void)(name);
  return "commanded";
}

function enqueue(item: Item) {
  if (queue.length >= QUEUE_MAX) return log(item.destination, item.name, "dropped", "queue_full");
  queue.push({ ...item, path: currentPath() });
}

/** Called by pushDataLayerEvent after a successful dataLayer push. */
export function dispatchMarketingEvent(event: string, token: string) {
  const map = EVENT_MAP[event];
  if (!map || !token) return;
  const blocked = gateClosedReason();
  if (blocked) return log("all", event, "dropped", blocked);
  (["meta", "tiktok"] as const).forEach((destination) => {
    const item: Item = { destination, name: map[destination], custom: !!map.custom, token, event };
    const outcome = commandSdk(item);
    if (outcome === "pending") enqueue(item);
    else log(destination, item.name, outcome);
  });
}

/** Re-checks consent, eligibility and route before handing queued items to an SDK. */
export function flushMarketingQueue() {
  if (!queue.length) return;
  const blocked = gateClosedReason();
  if (blocked) return clearMarketingQueue(blocked);
  const path = currentPath();
  const pending = queue;
  queue = [];
  for (const item of pending) {
    if (item.path !== path) continue;
    if (commandSdk(item) === "pending") enqueue(item);
  }
}

export function clearMarketingQueue(reason = "cleared") {
  if (queue.length) log("all", `${queue.length} queued`, "dropped", reason);
  queue = [];
}

declare global {
  interface Window {
    __millimedbfsDispatchBlocked?: boolean;
  }
}
