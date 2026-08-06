"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
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

  return {};
}

function revalidateSite() {
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

// ───────────────────────── Site Settings tab ─────────────────────────

export type GeneralSettingsInput = {
  siteNameTh: string;
  siteNameEn: string;
  siteUrl: string;
};

export async function saveGeneralSettings(input: GeneralSettingsInput) {
  await requireAdmin();
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
  revalidateSite();
}

export async function saveHomepageSettings(input: { youtubeEmbedUrl: string }) {
  await requireAdmin();
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { youtubeEmbedUrl: input.youtubeEmbedUrl || null },
    create: { id: "singleton", youtubeEmbedUrl: input.youtubeEmbedUrl || null },
  });
  revalidateSite();
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
  await requireAdmin();
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
  revalidateSite();
}

export async function saveBrandingSettings(input: { taglineTh: string; taglineEn: string }) {
  await requireAdmin();
  const data = { tagline: input.taglineTh || null, taglineEn: input.taglineEn || null };
  await prisma.footerContact.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  revalidateSite();
}

export type AnalyticsSettingsInput = {
  gtmId: string;
  ga4Id: string;
  fbPixelId: string;
  tiktokPixelId: string;
};

export async function saveAnalyticsSettings(input: AnalyticsSettingsInput) {
  await requireAdmin();
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
  revalidateSite();
}

export async function saveSeoDefaults(input: { seoMetaTitleTh: string; seoMetaDescTh: string }) {
  await requireAdmin();
  const data = {
    seoMetaTitleTh: input.seoMetaTitleTh || null,
    seoMetaDescTh: input.seoMetaDescTh || null,
  };
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  revalidateSite();
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
  await requireAdmin();
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
  revalidateSite();
}

export async function saveSiteAssets(input: { siteLogoUrl: string; faviconUrl: string; loginBgUrl: string }) {
  await requireAdmin();

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
  revalidateSite();
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
};

export async function saveGlobalTheme(input: GlobalThemeInput) {
  await requireAdmin();
  await prisma.globalTheme.upsert({
    where: { id: "singleton" },
    update: input,
    create: { id: "singleton", ...input },
  });
  revalidateSite();
}

// ───────────────────────── AI Settings tab ─────────────────────────

export async function saveAiSettings(input: { provider: AiProvider; model: string }) {
  await requireAdmin();
  await prisma.aiSettings.upsert({
    where: { id: "singleton" },
    update: { provider: input.provider, model: input.model || null },
    create: { id: "singleton", provider: input.provider, model: input.model || null },
  });
  revalidatePath("/admin/settings");
  revalidatePath("/admin/translations");
}
