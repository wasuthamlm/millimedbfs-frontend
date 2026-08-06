import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsClient } from "@/components/admin/settings/SettingsClient";
import { SettingsIcon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [siteSettings, footerContact, globalTheme, aiSettings] = await Promise.all([
    prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      include: { siteLogo: true, favicon: true, loginBg: true },
    }),
    prisma.footerContact.findUnique({ where: { id: "singleton" } }),
    prisma.globalTheme.findUnique({ where: { id: "singleton" } }),
    prisma.aiSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={SettingsIcon} title="การตั้งค่า" />
      <SettingsClient
        siteSettings={{
          siteNameTh: siteSettings?.siteNameTh ?? "",
          siteNameEn: siteSettings?.siteNameEn ?? "",
          siteUrl: siteSettings?.siteUrl ?? "",
          youtubeEmbedUrl: siteSettings?.youtubeEmbedUrl ?? "",
          gtmId: siteSettings?.gtmId ?? "",
          ga4Id: siteSettings?.ga4Id ?? "",
          fbPixelId: siteSettings?.fbPixelId ?? "",
          tiktokPixelId: siteSettings?.tiktokPixelId ?? "",
          seoMetaTitleTh: siteSettings?.seoMetaTitleTh ?? "",
          seoMetaDescTh: siteSettings?.seoMetaDescTh ?? "",
          facebookUrl: siteSettings?.facebookUrl ?? "",
          instagramUrl: siteSettings?.instagramUrl ?? "",
          youtubeUrl: siteSettings?.youtubeUrl ?? "",
          tiktokUrl: siteSettings?.tiktokUrl ?? "",
          lineUrl: siteSettings?.lineUrl ?? "",
          socialIconStyle: siteSettings?.socialIconStyle ?? "circle-outline",
          showSocialInHeader: siteSettings?.showSocialInHeader ?? false,
          siteLogoUrl: siteSettings?.siteLogo?.url ?? "",
          faviconUrl: siteSettings?.favicon?.url ?? "",
          loginBgUrl: siteSettings?.loginBg?.url ?? "",
        }}
        contactInfo={{
          companyNameTh: footerContact?.companyNameTh ?? "",
          companyNameEn: footerContact?.companyNameEn ?? "",
          taxId: footerContact?.taxId ?? "",
          addressTh: footerContact?.address ?? "",
          addressEn: footerContact?.addressEn ?? "",
          phone: footerContact?.phone ?? "",
          email: footerContact?.email ?? "",
          lineId: footerContact?.lineId ?? "",
          googleMapsEmbedUrl: footerContact?.googleMapsEmbedUrl ?? "",
        }}
        branding={{
          taglineTh: footerContact?.tagline ?? "",
          taglineEn: footerContact?.taglineEn ?? "",
        }}
        globalTheme={{
          fontHeader: globalTheme?.fontHeader ?? "Prompt",
          fontBody: globalTheme?.fontBody ?? "Sarabun",
          colorPrimary: globalTheme?.colorPrimary ?? "#032f87",
          colorPrimaryHover: globalTheme?.colorPrimaryHover ?? "#ffe45c",
          colorAccent: globalTheme?.colorAccent ?? "#fed22f",
          colorBackground: globalTheme?.colorBackground ?? "#dfedfb",
          colorText: globalTheme?.colorText ?? "#121212",
          buttonRadius: globalTheme?.buttonRadius ?? "soft-sm",
        }}
        aiSettings={{
          provider: aiSettings?.provider ?? "GEMINI",
          model: aiSettings?.model ?? "",
        }}
      />
    </div>
  );
}
