import "server-only";
import type { Metadata } from "next";
import { getEnabledLocales } from "@/lib/i18n/enabled-locales";
import { localeInfo, localePath } from "@/lib/i18n/locales";

/**
 * `alternates` for generateMetadata: canonical for this language plus an
 * hreflang link per enabled language and x-default (Thai, unprefixed).
 * `path` is the locale-less path, e.g. "/products/eye-care".
 */
export async function localeAlternates(locale: string, path: string, canonical?: string | null): Promise<NonNullable<Metadata["alternates"]>> {
  const locales = await getEnabledLocales();
  const languages: Record<string, string> = {};
  for (const code of locales) languages[localeInfo(code).hreflang] = localePath(code, path);
  languages["x-default"] = localePath("th", path);
  return { canonical: canonical || localePath(locale, path), languages };
}
