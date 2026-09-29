import type { NextConfig } from "next";

// Third parties the public site legitimately loads: Google Tag Manager / GA4,
// Meta and TikTok pixels (gated by cookie consent), Google Fonts (custom theme
// fonts), YouTube/Vimeo/Google Maps embeds, and Supabase storage for media.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://analytics.tiktok.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Admins can paste any https image URL into content, so images aren't host-restricted.
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "media-src 'self' blob: https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.facebook.com https://connect.facebook.net https://analytics.tiktok.com https://*.tiktok.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com https://maps.google.com https://www.googletagmanager.com",
  // 'self' (not 'none') so the admin can live-preview landing pages in an iframe.
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    // Two root layouts (public site + admin) — app/global-not-found.tsx serves unmatched URLs.
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    // Only enforce CSP/security headers in production builds. Turbopack's dev
    // server relies on eval() and websocket connections for HMR/Fast Refresh,
    // which this CSP intentionally disallows for deployed traffic.
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
