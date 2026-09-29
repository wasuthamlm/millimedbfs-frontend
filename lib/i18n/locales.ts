/**
 * Locale constants and URL helpers. Edge/client-safe (no Prisma) so proxy.ts
 * and client components can import it. Which locales are *enabled* lives in
 * the Language table — see lib/i18n/enabled-locales.ts.
 *
 * Thai is the default and is served without a prefix (/about); every other
 * locale is prefixed (/en/about). Internally proxy.ts rewrites unprefixed
 * paths to /th/..., so every public route lives under app/(site)/[locale].
 */

export const DEFAULT_LOCALE = "th";

export const ALL_LOCALES = [
  { code: "th", label: "ไทย", flag: "🇹🇭", hreflang: "th", ogLocale: "th_TH" },
  { code: "en", label: "English", flag: "🇬🇧", hreflang: "en", ogLocale: "en_US" },
  { code: "zh", label: "中文", flag: "🇨🇳", hreflang: "zh-Hans", ogLocale: "zh_CN" },
  { code: "ko", label: "한국어", flag: "🇰🇷", hreflang: "ko", ogLocale: "ko_KR" },
  { code: "ja", label: "日本語", flag: "🇯🇵", hreflang: "ja", ogLocale: "ja_JP" },
  { code: "my", label: "မြန်မာ", flag: "🇲🇲", hreflang: "my", ogLocale: "my_MM" },
  { code: "lo", label: "ລາວ", flag: "🇱🇦", hreflang: "lo", ogLocale: "lo_LA" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳", hreflang: "vi", ogLocale: "vi_VN" },
  { code: "ms", label: "Bahasa Melayu", flag: "🇲🇾", hreflang: "ms", ogLocale: "ms_MY" },
] as const;

export type LocaleCode = (typeof ALL_LOCALES)[number]["code"];

const LOCALE_CODES = new Set<string>(ALL_LOCALES.map((l) => l.code));

export function isLocaleCode(value: string | null | undefined): value is LocaleCode {
  return !!value && LOCALE_CODES.has(value);
}

export function localeInfo(code: string) {
  return ALL_LOCALES.find((l) => l.code === code) ?? ALL_LOCALES[0];
}

/**
 * Splits a public pathname into its locale and the locale-less path.
 * "/en/products/x" → { locale: "en", path: "/products/x" }; "/about" → { locale: "th", path: "/about" }.
 */
export function splitLocale(pathname: string): { locale: LocaleCode; path: string; prefixed: boolean } {
  const match = /^\/([^/]+)(\/.*)?$/.exec(pathname);
  if (match && isLocaleCode(match[1])) {
    return { locale: match[1], path: match[2] || "/", prefixed: true };
  }
  return { locale: DEFAULT_LOCALE, path: pathname || "/", prefixed: false };
}

/** localePath("en", "/products/x") → "/en/products/x"; localePath("th", "/products/x") → "/products/x". */
export function localePath(locale: string, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  // Leave external links, anchors-only and mailto/tel untouched.
  if (/^[a-z]+:/i.test(path) || path.startsWith("#")) return path;
  if (locale === DEFAULT_LOCALE || !isLocaleCode(locale)) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}
