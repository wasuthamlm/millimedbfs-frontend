"use client";

import { useEffect, useState } from "react";
import {
  hydrateConsent,
  subscribeConsent,
  isConsentReady,
  getConsent,
  hasDecision,
  saveConsent,
  type ConsentRecord,
} from "./consentStore";

/**
 * useConsent — React view of the consent store.
 * Hydration (read record + gtag consent update) happens once, before any tracker runs.
 */
export function useConsent(): {
  consentReady: boolean;
  consent: ConsentRecord;
  decided: boolean;
  saveConsent: typeof saveConsent;
} {
  const [, bump] = useState(0);

  useEffect(() => {
    const unsub = subscribeConsent(() => bump((n) => n + 1));
    hydrateConsent();
    // Module-level state (lib/consent/consentStore.ts) may already have been hydrated
    // by another consumer mounted earlier in the same tree (e.g. CookieConsent runs
    // before TrackingConsentGate) — force this component to read it on mount too.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    bump((n) => n + 1);
    return unsub;
  }, []);

  return {
    consentReady: isConsentReady(),
    consent: getConsent(),
    decided: hasDecision(),
    saveConsent,
  };
}
