// Google Maps embed from whatever the admin pasted (ported from the legacy
// src/lib/mapEmbed.js): a full <iframe> snippet, an embed URL, or a regular
// share link / plain address. Only Google Maps is allowed by the CSP.

export function mapEmbedSrc(raw: string | null | undefined): string | null {
  const input = String(raw || "").trim();
  if (!input) return null;

  const fromIframe = input.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i)?.[1];
  const url = (fromIframe ?? input).replace(/&amp;/g, "&");

  if (/^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/i.test(url) || /^https:\/\/maps\.google\.[a-z.]+\/maps\?.*output=embed/i.test(url)) {
    return url;
  }

  // Share links (google.com/maps/place/…, maps.app.goo.gl/…) can't be framed —
  // fall back to a keyless query embed built from whatever identifies the place.
  const place = url.match(/\/maps\/place\/([^/@?]+)/)?.[1];
  const coords = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const query = place ? decodeURIComponent(place.replace(/\+/g, " ")) : coords ? `${coords[1]},${coords[2]}` : /^https?:/i.test(url) ? null : input;
  return query ? `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed` : null;
}
