"use client";

// Marketing-pixel loaders — only called once marketing consent is granted
// (components/layout/TrackingConsentGate.tsx). GTM and GA4 stay unconditional
// server-rendered <Script> tags in app/(site)/layout.tsx: per Google Consent Mode v2,
// those tags may load immediately as long as the "default denied" signal was pushed
// first — they read consent state themselves and downgrade to cookieless behavior.
// Meta/TikTok pixels have no equivalent built-in consent awareness and start
// collecting data as soon as their script runs, so they must not load at all until
// the visitor opts in. Ported from the legacy site's src/lib/consent/trackers.js.

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

export function loadMetaPixel(pixelId: string | null | undefined): boolean {
  const id = sanitizeMetaPixelId(pixelId);
  if (!id || window.__millimedbfsMetaPixelLoaded) return false;
  window.__millimedbfsMetaPixelLoaded = true;
  /* eslint-disable */
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */
  window.fbq!("init", id);
  // The first PageView is fired by TrackingConsentGate's pathname effect (same render
  // pass), not here — keeping it there avoids double-firing on load.
  return true;
}

export function loadTiktokPixel(pixelId: string | null | undefined): boolean {
  const id = sanitizeTiktokPixelId(pixelId);
  if (!id || window.__millimedbfsTikTokPixelLoaded) return false;
  window.__millimedbfsTikTokPixelLoaded = true;
  /* eslint-disable */
  (function (w: any, d: any, t: any) {
    w.TiktokAnalyticsObject = t;
    var ttq = (w[t] = w[t] || []);
    ttq.methods = [
      "page", "track", "identify", "instances", "debug", "on", "off", "once", "ready",
      "alias", "group", "enableCookie", "disableCookie",
    ];
    ttq.setAndDefer = function (t: any, e: any) {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.load = function (e: any, n: any) {
      var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = i;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      var o = document.createElement("script");
      o.type = "text/javascript";
      o.async = true;
      o.src = i + "?sdkid=" + e + "&lib=" + t;
      var a = document.getElementsByTagName("script")[0];
      a.parentNode!.insertBefore(o, a);
    };
    ttq.load(id);
    // First page() call is fired by TrackingConsentGate's pathname effect, not here.
  })(window, document, "ttq");
  /* eslint-enable */
  return true;
}
