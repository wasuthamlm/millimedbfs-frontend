import { prisma } from "@/lib/prisma";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

// proxy.ts consults this on every public request, so keep a short in-memory
// cache instead of hitting the database each time. Admin changes to the
// language list take effect within TTL_MS.
const TTL_MS = 60_000;
let cache: { at: number; codes: string[] } | null = null;

/** Enabled locale codes in display order. The default locale is always included. */
export async function getEnabledLocales(): Promise<string[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.codes;
  try {
    const rows = await prisma.language.findMany({ where: { enabled: true }, orderBy: { order: "asc" } });
    const codes = rows.map((r) => r.code);
    if (!codes.includes(DEFAULT_LOCALE)) codes.unshift(DEFAULT_LOCALE);
    cache = { at: Date.now(), codes };
    return codes;
  } catch {
    // Never take the public site down over the language list.
    return cache?.codes ?? [DEFAULT_LOCALE];
  }
}

export function invalidateEnabledLocales() {
  cache = null;
}
