const FONT_VAR_BY_NAME: Record<string, string> = {
  Prompt: "var(--font-prompt)",
  Sarabun: "var(--font-sarabun)",
  "IBM Plex Sans Thai": "var(--font-thai)",
  Inter: "var(--font-thai-fallback)",
};

const RADIUS_PX_BY_KEY: Record<string, string> = {
  sharp: "0px",
  "soft-sm": "6px",
  soft: "12px",
  full: "9999px",
};

export function fontFamilyVar(fontName: string): string {
  return FONT_VAR_BY_NAME[fontName] ?? "var(--font-thai)";
}

export function radiusPx(key: string): string {
  return RADIUS_PX_BY_KEY[key] ?? RADIUS_PX_BY_KEY["soft-sm"];
}

/** A Google Fonts family name typed by an admin — letters, digits and spaces only, so it can't break out of CSS. */
export function safeFontName(name: string | null | undefined): string | null {
  const trimmed = (name ?? "").trim();
  return /^[A-Za-z0-9 ]{1,60}$/.test(trimmed) ? trimmed : null;
}

export function googleFontHref(name: string): string {
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, "+")}:wght@300;400;500;600;700&display=swap`;
}

export type GlobalThemeVars = {
  fontHeader: string;
  fontBody: string;
  colorPrimary: string;
  colorPrimaryHover?: string | null;
  colorAccent: string;
  colorBackground?: string | null;
  colorText?: string | null;
  buttonRadius: string;
  fontHeaderCustom?: string | null;
  fontBodyCustom?: string | null;
};

/** Stylesheet URLs for the custom Google fonts the theme uses (rendered as <link> by the site layout). */
export function themeFontHrefs(theme: GlobalThemeVars | null | undefined): string[] {
  const names = [safeFontName(theme?.fontHeaderCustom), safeFontName(theme?.fontBodyCustom)].filter((n): n is string => !!n);
  return [...new Set(names)].map(googleFontHref);
}

const HEX = /^#[0-9a-f]{3,8}$/i;
const hex = (value: string | null | undefined) => (value && HEX.test(value) ? value : undefined);

// CSS custom properties consumed by app/globals.css (--font-sans/--font-heading, --color-brand-*,
// --color-site-*) and components/ui/Button.tsx (--radius-btn). Spread onto a wrapping element's `style` prop.
export function globalThemeStyle(theme: GlobalThemeVars | null | undefined): React.CSSProperties {
  if (!theme) return {};
  const headerCustom = safeFontName(theme.fontHeaderCustom);
  const bodyCustom = safeFontName(theme.fontBodyCustom);
  const style: Record<string, string | undefined> = {
    "--font-heading-family": headerCustom ? `"${headerCustom}", ${fontFamilyVar(theme.fontHeader)}` : fontFamilyVar(theme.fontHeader),
    "--font-body": bodyCustom ? `"${bodyCustom}", ${fontFamilyVar(theme.fontBody)}` : fontFamilyVar(theme.fontBody),
    "--brand-navy": hex(theme.colorPrimary),
    "--brand-navy-hover": hex(theme.colorPrimaryHover),
    "--brand-gold": hex(theme.colorAccent),
    "--site-bg": hex(theme.colorBackground),
    "--site-text": hex(theme.colorText),
    "--radius-btn": radiusPx(theme.buttonRadius),
  };
  if (style["--site-text"]) style.color = "var(--site-text)";
  return Object.fromEntries(Object.entries(style).filter(([, v]) => v)) as React.CSSProperties;
}
