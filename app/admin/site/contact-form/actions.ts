"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";
import { revalidateSite } from "@/lib/revalidate-site";
import { setSiteConfig, SITE_CONFIG_KEYS } from "@/lib/site-config";
import { contactFormFingerprint, normalizeContactConfig, type ContactConfig } from "@/lib/contact-config";

const validation = z.enum(["none", "email", "phone", "number", "url"]);
const field = z.object({ enabled: z.boolean(), required: z.boolean(), validation });
const schema = z.object({
  layout: z.enum(["info-left", "info-right", "stacked"]),
  showMap: z.boolean(),
  fields: z.object({ name: field, email: field, phone: field, subject: field, message: field }),
  customFields: z
    .array(
      z.object({
        id: z.string().min(1).max(40),
        labelTh: z.string().max(120),
        labelEn: z.string().max(120),
        type: z.enum(["text", "select", "checkbox"]),
        options: z.string().max(2000),
        required: z.boolean(),
        validation,
      }),
    )
    .max(20, "เพิ่มช่องได้ไม่เกิน 20 ช่อง"),
});

/**
 * `marketingEligible` is the admin's review that this is a general business enquiry
 * form (not a health-intake form). It's stored with the form's field fingerprint, so
 * any later change to the fields switches it off until someone reviews it again.
 */
export async function saveContactConfig(input: ContactConfig, marketingEligible = false): Promise<{ error?: string }> {
  const session = await requirePermission("site.edit");
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  const config = normalizeContactConfig(parsed.data);
  await setSiteConfig(SITE_CONFIG_KEYS.contact, config);
  await setSiteConfig(SITE_CONFIG_KEYS.contactMarketingEligible, {
    enabled: marketingEligible === true,
    fingerprint: contactFormFingerprint(config),
  });
  await logActivity(session.user, "update", "Settings", { targetLabel: "ฟอร์มติดต่อ" });
  revalidatePath("/admin/site/contact-form");
  revalidateSite();
  return {};
}
