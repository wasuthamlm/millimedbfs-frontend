"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate-site";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requirePermission } from "@/lib/require-admin";
import { DEFAULT_LOCALE, isLocaleCode } from "@/lib/i18n/locales";
import { invalidateEnabledLocales } from "@/lib/i18n/enabled-locales";
import { logActivity } from "@/lib/activity-log";
import { getOrCreateMedia } from "@/lib/media";
import type { AiProvider } from "@/lib/generated/prisma/client";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "กรุณาระบุรหัสผ่านปัจจุบัน"),
  newPassword: z.string().min(8, "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร").max(72),
});

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ error?: string }> {
  const session = await requireAdmin();
  const email = session?.user?.email;
  if (!email) {
    return { error: "ไม่พบข้อมูลผู้ใช้ในเซสชัน" };
  }

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    return { error: "ไม่พบบัญชีผู้ใช้" };
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { email }, data: { passwordHash } });
  await logActivity(session.user, "password_reset", "User", { targetId: user.id, targetLabel: email, details: "เปลี่ยนรหัสผ่านของตัวเอง" });

  return {};
}

function revalidateSettings() {
  revalidatePath("/admin/settings");
  revalidateSite();
}

// ───────────────────────── Site Settings tab ─────────────────────────

export type GeneralSettingsInput = {
  siteNameTh: string;
  siteNameEn: string;
  siteUrl: string;
};

export async function saveGeneralSettings(input: GeneralSettingsInput) {
  const session = await requirePermission("settings.edit");
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      siteNameTh: input.siteNameTh || null,
      siteNameEn: input.siteNameEn || null,
      siteUrl: input.siteUrl || null,
    },
    create: {
      id: "singleton",
      siteNameTh: input.siteNameTh || null,
      siteNameEn: input.siteNameEn || null,
      siteUrl: input.siteUrl || null,
    },
  });
  await logActivity(session.user, "update", "Settings", { targetLabel: "ทั่วไป" });
  revalidateSettings();
}

export async function saveHomepageSettings(input: { youtubeEmbedUrl: string }) {
  const session = await requirePermission("settings.edit");
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { youtubeEmbedUrl: input.youtubeEmbedUrl || null },
    create: { id: "singleton", youtubeEmbedUrl: input.youtubeEmbedUrl || null },
  });
  await logActivity(session.user, "update", "Settings", { targetLabel: "หน้าแรก" });
  revalidateSettings();
}

export type ContactInfoInput = {
  companyNameTh: string;
  companyNameEn: string;
  taxId: string;
  addressTh: string;
  addressEn: string;
  phone: string;
  email: string;
  lineId: string;
  googleMapsEmbedUrl: string;
};

export async function saveContactInfo(input: ContactInfoInput) {
  const session = await requirePermission("settings.edit");
  const data = {
    companyNameTh: input.companyNameTh || null,
    companyNameEn: input.companyNameEn || null,
    taxId: input.taxId || null,
    address: input.addressTh || null,
    addressEn: input.addressEn || null,
    phone: input.phone || null,
    email: input.email || null,
    lineId: input.lineId || null,
    googleMapsEmbedUrl: input.googleMapsEmbedUrl || null,
  };
  await prisma.footerContact.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  await logActivity(session.user, "update", "Settings", { targetLabel: "ข้อมูลติดต่อ" });
  revalidateSettings();
}

export async function saveBrandingSettings(input: { taglineTh: string; taglineEn: string }) {
  const session = await requirePermission("settings.edit");
  const data = { tagline: input.taglineTh || null, taglineEn: input.taglineEn || null };
  await prisma.footerContact.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  await logActivity(session.user, "update", "Settings", { targetLabel: "แบรนด์" });
  revalidateSettings();
}

export type AnalyticsSettingsInput = {
  gtmId: string;
  ga4Id: string;
  fbPixelId: string;
  tiktokPixelId: string;
};

export async function saveAnalyticsSettings(input: AnalyticsSettingsInput) {
  const session = await requirePermission("settings.edit");
  const data = {
    gtmId: input.gtmId || null,
    ga4Id: input.ga4Id || null,
    fbPixelId: input.fbPixelId || null,
    tiktokPixelId: input.tiktokPixelId || null,
  };
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  await logActivity(session.user, "update", "Settings", { targetLabel: "Analytics / Tracking" });
  revalidateSettings();
}

export async function saveSeoDefaults(input: { seoMetaTitleTh: string; seoMetaDescTh: string }) {
  const session = await requirePermission("settings.edit");
  const data = {
    seoMetaTitleTh: input.seoMetaTitleTh || null,
    seoMetaDescTh: input.seoMetaDescTh || null,
  };
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  await logActivity(session.user, "update", "Settings", { targetLabel: "SEO เริ่มต้น" });
  revalidateSettings();
}

export type SocialSettingsInput = {
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  lineUrl: string;
  socialIconStyle: string;
  showSocialInHeader: boolean;
};

export async function saveSocialSettings(input: SocialSettingsInput) {
  const session = await requirePermission("settings.edit");
  const data = {
    facebookUrl: input.facebookUrl || null,
    instagramUrl: input.instagramUrl || null,
    youtubeUrl: input.youtubeUrl || null,
    tiktokUrl: input.tiktokUrl || null,
    lineUrl: input.lineUrl || null,
    socialIconStyle: input.socialIconStyle,
    showSocialInHeader: input.showSocialInHeader,
  };
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  await logActivity(session.user, "update", "Settings", { targetLabel: "โซเชียล" });
  revalidateSettings();
}

export async function saveSiteAssets(input: { siteLogoUrl: string; faviconUrl: string; loginBgUrl: string }) {
  const session = await requirePermission("settings.edit");

  const [siteLogo, favicon, loginBg] = await Promise.all([
    input.siteLogoUrl ? getOrCreateMedia(prisma, input.siteLogoUrl) : null,
    input.faviconUrl ? getOrCreateMedia(prisma, input.faviconUrl) : null,
    input.loginBgUrl ? getOrCreateMedia(prisma, input.loginBgUrl) : null,
  ]);

  const data = {
    siteLogoId: siteLogo?.id ?? null,
    faviconId: favicon?.id ?? null,
    loginBgId: loginBg?.id ?? null,
  };
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  await logActivity(session.user, "update", "Settings", { targetLabel: "โลโก้ / Favicon" });
  revalidateSettings();
  revalidatePath("/admin/login");
}

// ───────────────────────── Global Settings tab ─────────────────────────

export type GlobalThemeInput = {
  fontHeader: string;
  fontBody: string;
  colorPrimary: string;
  colorPrimaryHover: string;
  colorAccent: string;
  colorBackground: string;
  colorText: string;
  buttonRadius: string;
  fontHeaderCustom: string;
  fontBodyCustom: string;
};

export async function saveGlobalTheme(input: GlobalThemeInput) {
  const session = await requirePermission("settings.edit");
  // Custom fonts are Google Fonts family names — keep them to safe characters since they end up in a URL and CSS.
  const fontName = (v: string) => (/^[A-Za-z0-9 ]{0,60}$/.test(v.trim()) ? v.trim() || null : null);
  const data = { ...input, fontHeaderCustom: fontName(input.fontHeaderCustom), fontBodyCustom: fontName(input.fontBodyCustom) };
  await prisma.globalTheme.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  await logActivity(session.user, "update", "Settings", { targetLabel: "ธีมเว็บไซต์" });
  revalidateSettings();
}

// ───────────────────────── AI Settings tab ─────────────────────────

export async function saveAiSettings(input: { provider: AiProvider; model: string }) {
  const session = await requirePermission("settings.edit");
  await prisma.aiSettings.upsert({
    where: { id: "singleton" },
    update: { provider: input.provider, model: input.model || null },
    create: { id: "singleton", provider: input.provider, model: input.model || null },
  });
  await logActivity(session.user, "update", "Settings", { targetLabel: "AI" });
  revalidatePath("/admin/settings");
  revalidatePath("/admin/translations");
}

// ───────────────────────── Languages tab ─────────────────────────

const languagesSchema = z
  .array(
    z.object({
      code: z.string().refine(isLocaleCode, "รหัสภาษาไม่ถูกต้อง"),
      labelLocal: z.string().trim().min(1, "กรุณาระบุชื่อภาษา").max(40),
      enabled: z.boolean(),
    }),
  )
  .min(1);

/** Saves the enabled/ordered language list. Thai is the source language and can't be disabled. */
export async function saveLanguages(input: { code: string; labelLocal: string; enabled: boolean }[]) {
  const session = await requirePermission("settings.edit");
  const parsed = languagesSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  await prisma.$transaction(
    parsed.data.map((l, order) =>
      prisma.language.upsert({
        where: { code: l.code },
        update: { labelLocal: l.labelLocal, enabled: l.code === DEFAULT_LOCALE ? true : l.enabled, order },
        create: { code: l.code, labelLocal: l.labelLocal, enabled: l.code === DEFAULT_LOCALE ? true : l.enabled, order },
      }),
    ),
  );
  invalidateEnabledLocales();
  await logActivity(session.user, "update", "Settings", {
    targetLabel: "ภาษา",
    details: `เปิดใช้: ${parsed.data.filter((l) => l.enabled || l.code === DEFAULT_LOCALE).map((l) => l.code).join(", ")}`,
  });
  revalidateSettings();
  return {};
}
