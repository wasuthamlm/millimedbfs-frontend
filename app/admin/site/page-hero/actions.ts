"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";
import { revalidateSite } from "@/lib/revalidate-site";
import { setSiteConfig, SITE_CONFIG_KEYS } from "@/lib/site-config";
import type { PageHeroConfig } from "@/lib/page-hero";

const color = z.string().regex(/^(#[0-9a-fA-F]{3,8})?$/, "สีต้องเป็นรหัส hex เช่น #DDE9F8");
const num = z.number().int().min(0).max(600);

const schema = z.object({
  mode: z.enum(["solid", "gradient", "pattern", "image", "none"]),
  bgColor: color,
  bgColorTo: color,
  pattern: z.enum(["dots", "grid", "diagonal", "waves"]),
  patternColor: color,
  patternOpacity: z.number().min(0).max(100),
  imageUrl: z.string().max(1000),
  overlayColor: color,
  overlayOpacity: z.number().min(0).max(100),
  fadeEdge: z.enum(["none", "top", "bottom", "both"]),
  fadeColor: color,
  titleColor: color,
  subtitleColor: color,
  align: z.enum(["center", "left"]),
  minHeight: num,
  paddingY: num,
  paddingX: num,
  marginTop: num,
  marginBottom: num,
});

export async function savePageHeroConfig(input: PageHeroConfig): Promise<{ error?: string }> {
  const session = await requirePermission("site.edit");
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  await setSiteConfig(SITE_CONFIG_KEYS.pageHero, parsed.data);
  await logActivity(session.user, "update", "PageHero", { targetLabel: "หัวข้อหน้า (Page Hero)" });
  revalidatePath("/admin/site/page-hero");
  revalidateSite();
  return {};
}
