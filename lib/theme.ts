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

export type GlobalThemeVars = {
  fontHeader: string;
  fontBody: string;
  colorPrimary: string;
  colorPrimaryHover: string;
  colorAccent: string;
  buttonRadius: string;
};

// CSS custom properties consumed by app/globals.css (--font-sans/--font-heading, --color-brand-*)
// and components/ui/Button.tsx (--radius-btn). Spread onto a wrapping element's `style` prop.
export function globalThemeStyle(theme: GlobalThemeVars | null | undefined): React.CSSProperties {
  if (!theme) return {};
  return {
    "--font-heading-family": fontFamilyVar(theme.fontHeader),
    "--font-body": fontFamilyVar(theme.fontBody),
    "--brand-navy": theme.colorPrimary,
    "--brand-gold": theme.colorAccent,
    "--radius-btn": radiusPx(theme.buttonRadius),
    // colorPrimaryHover isn't wired to a specific token yet — the existing brand-navy-dark
    // (used for gold-button text) is a fixed shade, not a hover color, so overriding it here
    // would corrupt unrelated UI rather than actually apply a "hover" effect.
  } as React.CSSProperties;
}
