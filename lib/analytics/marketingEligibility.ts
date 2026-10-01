"use client";

// Marketing eligibility — the single gate that decides whether ANY marketing SDK
// activity (Meta/TikTok) is allowed on the page currently being viewed. Ported
// from the legacy src/lib/analytics/marketingEligibility.js.
//
// Why: once loaded, those SDKs collect URL, referrer, title and automatic events
// on their own, so blocking only conversion events is not enough on a sensitive page.
//
// Rules:
// - Default is INELIGIBLE. Nothing is ever inferred from the URL.
// - Pages declare eligibility from admin-reviewed flags ("page" = Page.marketingEligible,
//   "record" = Product/Post/contact-form review). Eligible only when EVERY declared
//   source is true (strict AND).
// - Any path change wipes all declarations (fail-closed on client navigation).

export type EligibilitySource = "page" | "record";

const listeners = new Set<() => void>();
let trackedPath: string | null = null;
let sources: Partial<Record<EligibilitySource, boolean>> = {};

const currentPath = () => (window.location.pathname || "/").split("?")[0].split("#")[0];
const notify = () => listeners.forEach((fn) => fn());

/** Drops declarations belonging to a previous route. */
function syncPath(): boolean {
  const p = currentPath();
  if (p !== trackedPath) {
    trackedPath = p;
    sources = {};
    return true;
  }
  return false;
}

export function declareMarketingEligibility(kind: EligibilitySource, value: boolean) {
  const changed = syncPath();
  const v = value === true;
  if (!changed && sources[kind] === v) return;
  sources[kind] = v;
  notify();
}

/** True only when at least one source was declared and all declared sources are true. */
export function isMarketingEligible(): boolean {
  // Server render: nothing is declared yet, so the page is ineligible until the client says otherwise.
  if (typeof window === "undefined") return false;
  if (syncPath()) return false;
  const values = Object.values(sources);
  return values.length > 0 && values.every((v) => v === true);
}

export function subscribeMarketingEligibility(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
