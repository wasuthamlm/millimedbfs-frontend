// Strict formats for analytics/pixel IDs (ported from the legacy
// src/lib/consent/trackers.js). A value that fails validation is never loaded
// on the site — no fallbacks. Pure: safe on server and client.

/** GTM container ID */
export const sanitizeGtmId = (v: string | null | undefined) => {
  const id = (v || "").trim().toUpperCase();
  return /^GTM-[A-Z0-9]+$/.test(id) ? id : "";
};

/** GA4 measurement ID */
export const sanitizeGa4Id = (v: string | null | undefined) => {
  const id = (v || "").trim().toUpperCase();
  return /^G-[A-Z0-9]+$/.test(id) ? id : "";
};

/** Meta Pixel ID — digits only */
export const sanitizeMetaPixelId = (v: string | null | undefined) => {
  const id = (v || "").trim();
  return /^[0-9]{6,20}$/.test(id) ? id : "";
};

/** TikTok Pixel ID — alphanumeric token */
export const sanitizeTiktokPixelId = (v: string | null | undefined) => {
  const id = (v || "").trim();
  return /^[A-Za-z0-9]{6,40}$/.test(id) ? id : "";
};
