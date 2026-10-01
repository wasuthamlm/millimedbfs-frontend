import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Key/value JSON config blobs (SiteConfig table) — the counterpart of the
 * legacy SiteSetting JSON keys. Reads merge the stored object over defaults so
 * adding a field never breaks existing rows.
 */

export const SITE_CONFIG_KEYS = {
  pageHero: "page_hero_config",
  cookieConsent: "cookie_consent_config",
  contact: "contact_config",
  contactMarketingEligible: "contact_marketing_eligible",
  footerBlocks: "footer_blocks",
} as const;

export async function getSiteConfig<T extends object>(key: string, defaults: T): Promise<T> {
  const row = await prisma.siteConfig.findUnique({ where: { key } }).catch(() => null);
  const stored = row?.value && typeof row.value === "object" && !Array.isArray(row.value) ? (row.value as Partial<T>) : {};
  return { ...defaults, ...stored };
}

export async function setSiteConfig(key: string, value: object) {
  await prisma.siteConfig.upsert({
    where: { key },
    update: { value: value as Prisma.InputJsonValue },
    create: { key, value: value as Prisma.InputJsonValue },
  });
}
