// Landing page config (ported from the legacy src/lib/landingConfig.js). Landing pages are
// self-contained: their own header, footer and floating widget, stored as JSON on LandingPage.

export type LandingLink = { label: string; url: string; newTab?: boolean };

export type LandingBackground = { color: string; imageUrl?: string; imageOpacity?: number };

export type LandingHeaderConfig = {
  enabled: boolean;
  sticky: boolean;
  logoUrl: string;
  logoText: string;
  textColor: string;
  bg: LandingBackground;
  links: LandingLink[];
  ctaLabel: string;
  ctaUrl: string;
  ctaNewTab: boolean;
};

export type LandingFooterConfig = {
  enabled: boolean;
  textColor: string;
  bg: LandingBackground;
  logoUrl: string;
  text: string;
  links: LandingLink[];
  copyright: string;
};

export const LANDING_WIDGET_ICONS = ["message", "phone", "mail", "shopping-bag", "user-plus", "log-in", "map-pin", "external-link"] as const;
export type LandingWidgetIcon = (typeof LANDING_WIDGET_ICONS)[number];

export type LandingWidgetItem = { label: string; url: string; icon: LandingWidgetIcon; color?: string; newTab?: boolean };

export type LandingWidgetConfig = {
  enabled: boolean;
  position: "middle-right" | "middle-left" | "bottom-right" | "bottom-left";
  design: "pill" | "circle" | "square";
  color: string;
  textColor: string;
  items: LandingWidgetItem[];
};

export type LandingTheme = {
  useSiteColors: boolean;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
};

export type LandingFaqItem = { qTh: string; aTh: string; qEn: string; aEn: string };

export const DEFAULT_LANDING_HEADER: LandingHeaderConfig = {
  enabled: true,
  sticky: true,
  logoUrl: "",
  logoText: "",
  textColor: "#121212",
  bg: { color: "#FFFFFF" },
  links: [],
  ctaLabel: "",
  ctaUrl: "",
  ctaNewTab: false,
};

export const DEFAULT_LANDING_FOOTER: LandingFooterConfig = {
  enabled: true,
  textColor: "#FFFFFF",
  bg: { color: "#121212" },
  logoUrl: "",
  text: "",
  links: [],
  copyright: "",
};

export const DEFAULT_LANDING_WIDGET: LandingWidgetConfig = {
  enabled: false,
  position: "middle-right",
  design: "pill",
  color: "#032f87",
  textColor: "#FFFFFF",
  items: [],
};

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/** Stored JSON may be null, partial, or in the legacy snake_case shape — normalise it over the defaults. */
function merge<T extends object>(defaults: T, raw: unknown): T {
  if (!isObject(raw)) return { ...defaults };
  const legacy: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) legacy[k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())] = v;
  // legacy flat bg_color / open_in_new_tab / cta_open_new_tab
  if (typeof legacy.bgColor === "string" && !isObject(legacy.bg)) legacy.bg = { color: legacy.bgColor };
  if (isObject(legacy.bg) && "imageUrl" in legacy.bg === false && "image_url" in legacy.bg) {
    const bg = legacy.bg as Record<string, unknown>;
    legacy.bg = { color: bg.color ?? "", imageUrl: bg.image_url, imageOpacity: bg.opacity };
  }
  if ("ctaOpenNewTab" in legacy) legacy.ctaNewTab = legacy.ctaOpenNewTab;
  const links = (v: unknown) =>
    Array.isArray(v)
      ? v.filter(isObject).map((l) => ({ label: String(l.label ?? ""), url: String(l.url ?? ""), newTab: !!(l.newTab ?? l.open_in_new_tab) }))
      : [];
  const out = { ...defaults } as Record<string, unknown>;
  for (const key of Object.keys(defaults)) if (key in legacy && legacy[key] !== undefined && legacy[key] !== null) out[key] = legacy[key];
  if ("links" in defaults) out.links = links(legacy.links);
  if ("items" in defaults) {
    out.items = Array.isArray(legacy.items)
      ? legacy.items.filter(isObject).map((i) => ({
          label: String(i.label ?? ""),
          url: String(i.url ?? ""),
          icon: (LANDING_WIDGET_ICONS as readonly string[]).includes(String(i.icon)) ? (i.icon as LandingWidgetIcon) : "external-link",
          color: typeof i.color === "string" ? i.color : undefined,
          newTab: (i.newTab ?? i.open_in_new_tab) !== false,
        }))
      : [];
  }
  return out as T;
}

export const parseLandingHeader = (raw: unknown) => merge(DEFAULT_LANDING_HEADER, raw);
export const parseLandingFooter = (raw: unknown) => merge(DEFAULT_LANDING_FOOTER, raw);
export const parseLandingWidget = (raw: unknown) => merge(DEFAULT_LANDING_WIDGET, raw);

export function parseLandingFaq(raw: unknown): LandingFaqItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isObject).map((f) => ({
    qTh: String(f.qTh ?? f.q_th ?? ""),
    aTh: String(f.aTh ?? f.a_th ?? ""),
    qEn: String(f.qEn ?? f.q_en ?? ""),
    aEn: String(f.aEn ?? f.a_en ?? ""),
  }));
}

/** Only http(s), mailto, tel, in-site paths or #anchors — blocks javascript: URIs. */
export function safeLandingUrl(url: string | null | undefined): string {
  const value = String(url ?? "").trim();
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value;
  if (value.startsWith("/") || value.startsWith("#")) return value;
  return "#";
}

export function landingSlugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9฀-๿-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const HEX = /^#[0-9a-f]{3,8}$/i;
const hex = (v: string | null | undefined, fallback: string) => (v && HEX.test(v) ? v : fallback);

/**
 * CSS variables for the landing wrapper. Reuses the site token names so the shared
 * section renderer picks the landing colours up without touching anything global.
 */
export function landingThemeStyle(theme: LandingTheme, site?: { colorPrimary?: string; colorAccent?: string } | null): React.CSSProperties {
  const primary = theme.useSiteColors ? hex(site?.colorPrimary, theme.primaryColor) : theme.primaryColor;
  const accent = theme.useSiteColors ? hex(site?.colorAccent, theme.accentColor) : theme.accentColor;
  const bg = hex(theme.bgColor, "#FFFFFF");
  const text = hex(theme.textColor, "#121212");
  return {
    "--brand-navy": hex(primary, "#032f87"),
    "--brand-navy-hover": hex(primary, "#032f87"),
    "--brand-gold": hex(accent, "#B8860B"),
    "--site-text": text,
    backgroundColor: bg,
    color: text,
  } as React.CSSProperties;
}

/** Shape the landing editor sends to the live preview iframe (postMessage). */
export type LandingPreviewConfig = {
  header: LandingHeaderConfig;
  footer: LandingFooterConfig;
  widget: LandingWidgetConfig;
  theme: LandingTheme;
  faq: LandingFaqItem[];
};

export const LANDING_PREVIEW_MESSAGE = "landing-preview-config";
export const LANDING_PREVIEW_READY = "landing-preview-ready";
