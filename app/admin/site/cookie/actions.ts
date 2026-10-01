"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";
import { revalidateSite } from "@/lib/revalidate-site";
import { setSiteConfig, SITE_CONFIG_KEYS } from "@/lib/site-config";
import { isLocaleCode } from "@/lib/i18n/locales";
import type { CookieConsentConfig } from "@/lib/i18n/cookie-strings";

const schema = z.object({
  texts: z.record(z.string().refine(isLocaleCode), z.record(z.string().max(40), z.string().max(1000))),
  policyLinks: z
    .array(
      z.object({
        labelTh: z.string().trim().min(1, "กรุณาระบุชื่อลิงก์").max(120),
        labelEn: z.string().max(120),
        // Relative site paths or https URLs only.
        url: z.string().trim().regex(/^(\/[^\s]*|https:\/\/[^\s]+)$/, "ลิงก์ต้องขึ้นต้นด้วย / หรือ https://"),
      }),
    )
    .max(6),
});

// Admin + approver only (lib/admin-roles.ts "settings.edit"), like the legacy page.
export async function saveCookieConfig(input: CookieConsentConfig): Promise<{ error?: string }> {
  const session = await requirePermission("settings.edit");
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  // Drop empty overrides so the built-in copy keeps applying.
  const texts = Object.fromEntries(
    Object.entries(parsed.data.texts)
      .map(([lang, fields]) => [lang, Object.fromEntries(Object.entries(fields).filter(([, v]) => v.trim()))])
      .filter(([, fields]) => Object.keys(fields as object).length),
  );
  await setSiteConfig(SITE_CONFIG_KEYS.cookieConsent, { texts, policyLinks: parsed.data.policyLinks });
  await logActivity(session.user, "update", "CookieConsent", { targetLabel: "Cookie Consent" });
  revalidatePath("/admin/site/cookie");
  revalidateSite();
  return {};
}
