"use client";

// Central privacy-safe dataLayer event layer (legacy src/lib/analytics/dataLayerEvents.js).
//
// - Pushes only into window.dataLayer; GTM (+ consent-gated pixels via the
//   marketing dispatcher) are the only destinations.
// - Only whitelisted parameters survive — names, emails, phones, messages and
//   any free text are dropped before the push.
// - Every push has a stable event_id and fires at most once per session, so
//   rerenders, retries, refreshes and client navigation can't duplicate it.

import { dispatchMarketingEvent } from "./marketingDispatcher";

const ALLOWED_PARAMS = ["page_id", "product_id", "sku", "campaign_id", "creative_id", "value", "currency", "destination_type"] as const;
type Params = Partial<Record<(typeof ALLOWED_PARAMS)[number], string | number | null | undefined>>;

const FIRED_STORAGE_KEY = "millimedbfs_fired_events";
const MAX_STORED = 300;
const fired = new Set<string>();
let loaded = false;

function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = sessionStorage.getItem(FIRED_STORAGE_KEY);
    if (raw) (JSON.parse(raw) as string[]).forEach((id) => fired.add(id));
  } catch {}
}

function persist() {
  try {
    sessionStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify([...fired].slice(-MAX_STORED)));
  } catch {}
}

/** Canonical path — query string and fragment stripped (they may carry personal data). */
export const canonicalPageId = () => (window.location.pathname || "/").split("?")[0].split("#")[0];

export const buildEventId = (event: string, key: string) => `${event}.${String(key).replace(/[^a-zA-Z0-9_.:/-]/g, "-").slice(0, 100)}`;

function sanitizeParams(raw: Params) {
  const out: Record<string, string | number> = {};
  for (const key of ALLOWED_PARAMS) {
    const value = raw[key];
    if (value === undefined || value === null || value === "" || key === "currency") continue;
    if (key === "value") {
      const num = Number(value);
      if (Number.isFinite(num)) out.value = num;
      continue;
    }
    out[key] = String(value).trim().slice(0, 120);
  }
  // Currency only accompanies a real numeric value, and is always THB.
  if (out.value !== undefined) out.currency = "THB";
  return out;
}

function newActionToken() {
  try {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  } catch {}
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Pushes one event; returns false when it was suppressed as a duplicate. */
export function pushDataLayerEvent(event: string, { dedupeKey, params = {} }: { dedupeKey?: string; params?: Params } = {}): boolean {
  if (typeof window === "undefined" || !event) return false;
  ensureLoaded();
  const event_id = buildEventId(event, dedupeKey ?? canonicalPageId());
  if (fired.has(event_id)) return false;
  fired.add(event_id);
  persist();

  window.dataLayer = window.dataLayer || [];
  const payload = { event, event_id, ...sanitizeParams(params) };
  window.dataLayer.push(payload);
  if (process.env.NODE_ENV !== "production") console.debug("[dataLayer]", payload);

  dispatchMarketingEvent(event, newActionToken());
  return true;
}

/**
 * `line_click` — an outbound LINE link was clicked (a micro-event; it never implies
 * a conversation started). Named differently from GTM's `click_line` so the GA4 tag
 * on that trigger isn't double-fired. One push per second-bucket.
 */
export function trackLineClick() {
  pushDataLayerEvent("line_click", {
    dedupeKey: `line.${canonicalPageId()}.${Math.floor(Date.now() / 1000)}`,
    params: { page_id: canonicalPageId(), destination_type: "line" },
  });
}
