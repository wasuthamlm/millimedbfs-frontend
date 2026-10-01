import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { SecretAdminAccess } from "@/components/layout/SecretAdminAccess";
import { Popups } from "@/components/layout/Popups";
import { SocialFloatButtons, type SocialFloatItem } from "@/components/layout/SocialFloatButtons";
import { FloatingWidgets } from "@/components/layout/FloatingWidgets";
import { prisma } from "@/lib/prisma";
import { loadLocalizer } from "@/lib/i18n/localize";
import { FacebookIcon, InstagramIcon, LineIcon, TikTokIcon, YoutubeIcon } from "@/components/ui/social-icons";
import { getSiteConfig, SITE_CONFIG_KEYS } from "@/lib/site-config";
import { DEFAULT_COOKIE_CONFIG } from "@/lib/i18n/cookie-strings";
import { SiteTracking, SiteCookieConsent } from "@/components/layout/SiteTracking";
import { EMPTY_FOOTER_BLOCKS } from "@/lib/footer-blocks";
import { globalThemeStyle, themeFontHrefs } from "@/lib/theme";
import { buildOpenGraph, SITE_NAME, SITE_URL } from "@/lib/site";
import type { NavLink } from "@/data/nav";

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    include: { favicon: true, siteLogo: true },
  });
  return {
    // Admin-editable site-wide SEO title/description (Settings > Site Settings).
    // Pages that define their own title/description still win — Next merges
    // top-level Metadata keys individually, not the whole object.
    title: siteSettings?.seoMetaTitleTh || undefined,
    description: siteSettings?.seoMetaDescTh || undefined,
    icons: siteSettings?.favicon?.url ? { icon: siteSettings.favicon.url } : undefined,
    // Fallback OG image for any page under (site) that doesn't set its own —
    // more specific page metadata overwrites this entirely (Next merges
    // openGraph by full replacement, not deep merge). IMPORTANT: omit this key
    // entirely rather than setting it to `undefined` when there's no logo —
    // an explicit `undefined` still counts as "set" and wipes out the root
    // layout's openGraph defaults instead of inheriting them.
    ...(siteSettings?.siteLogo?.url
      ? { openGraph: buildOpenGraph({ images: [siteSettings.siteLogo.url] }) }
      : {}),
  };
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [navRows, footerColumns, footerContact, widgets, popupRows, headerConfig, footerConfig, siteSettings, globalTheme] =
    await Promise.all([
      prisma.navLink.findMany({
        where: { placement: "HEADER", active: true },
        orderBy: { order: "asc" },
        include: {
          children: {
            where: { active: true },
            orderBy: { order: "asc" },
            include: { children: { where: { active: true }, orderBy: { order: "asc" } } },
          },
        },
      }),
      prisma.footerColumn.findMany({
        orderBy: { order: "asc" },
        include: { links: { orderBy: { order: "asc" } } },
      }),
      prisma.footerContact.findUnique({ where: { id: "singleton" } }),
      prisma.widget.findMany(),
      prisma.popup.findMany({
        where: { status: "PUBLISHED", active: true, deletedAt: null },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
      prisma.siteHeaderConfig.findUnique({ where: { id: "singleton" } }),
      prisma.footerConfig.findUnique({ where: { id: "singleton" } }),
      prisma.siteSettings.findUnique({ where: { id: "singleton" }, include: { siteLogo: true } }),
      prisma.globalTheme.findUnique({ where: { id: "singleton" } }),
    ]);
  const [cookieConfig, footerBlocks] = await Promise.all([
    getSiteConfig(SITE_CONFIG_KEYS.cookieConsent, DEFAULT_COOKIE_CONFIG),
    getSiteConfig(SITE_CONFIG_KEYS.footerBlocks, EMPTY_FOOTER_BLOCKS),
  ]);

  // Menu labels: EN column, Translation rows (NAV_LINK/label) for other languages, else Thai.
  const navIds = navRows.flatMap((r) => [r.id, ...r.children.flatMap((c) => [c.id, ...c.children.map((g) => g.id)])]);
  const tNav = await loadLocalizer(locale, [["NAV_LINK", navIds]]);
  type NavRow = { id: string; labelTh: string; labelEn: string | null; href: string; openInNewTab: boolean; parentId: string | null };
  const toLink = (row: NavRow & { children?: (NavRow & { children?: NavRow[] })[] }): NavLink => ({
    id: row.id,
    label: tNav("NAV_LINK", row.id, "label", row.labelTh, row.labelEn),
    href: row.href,
    newTab: row.openInNewTab,
    children: row.children?.length ? row.children.map(toLink) : undefined,
  });
  const navLinks: NavLink[] = navRows.filter((row) => !row.parentId).map(toLink);
  const languageRows = await prisma.language.findMany({ where: { enabled: true }, orderBy: { order: "asc" } });
  const languages = languageRows.map((l) => ({ code: l.code, label: l.labelLocal }));
  const headerSocial = siteSettings?.showSocialInHeader
    ? [
        { href: siteSettings.facebookUrl, label: "Facebook", icon: <FacebookIcon className="h-4 w-4" /> },
        { href: siteSettings.instagramUrl, label: "Instagram", icon: <InstagramIcon className="h-4 w-4" /> },
        { href: siteSettings.youtubeUrl, label: "YouTube", icon: <YoutubeIcon className="h-4 w-4" /> },
        { href: siteSettings.tiktokUrl, label: "TikTok", icon: <TikTokIcon className="h-4 w-4" /> },
        { href: siteSettings.lineUrl, label: "LINE", icon: <LineIcon className="h-4 w-4" /> },
      ].filter((x): x is { href: string; label: string; icon: React.JSX.Element } => !!x.href)
    : [];

  const widgetByKey = new Map(widgets.map((w) => [w.key, w]));
  const scrollToTopEnabled = widgetByKey.get("scroll-to-top")?.enabled ?? false;
  const cookieConsentEnabled = widgetByKey.get("cookie-consent")?.enabled ?? false;

  const socialFloats: SocialFloatItem[] = (["line-official-account", "facebook-messenger"] as const)
    .map((key) => {
      const widget = widgetByKey.get(key);
      if (!widget?.enabled || !widget.link) return null;
      return { key, link: widget.link };
    })
    .filter((item): item is SocialFloatItem => item !== null);

  const popups = popupRows.map((p) => ({
    ...p,
    startDate: p.startDate?.toISOString() ?? null,
    endDate: p.endDate?.toISOString() ?? null,
  }));

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteSettings?.siteNameTh || SITE_NAME,
    url: SITE_URL,
    logo: siteSettings?.siteLogo?.url,
    sameAs: [
      siteSettings?.facebookUrl,
      siteSettings?.instagramUrl,
      siteSettings?.youtubeUrl,
      siteSettings?.tiktokUrl,
      siteSettings?.lineUrl,
    ].filter((url): url is string => !!url),
    contactPoint: footerContact?.phone
      ? {
          "@type": "ContactPoint",
          telephone: footerContact.phone,
          email: footerContact.email ?? undefined,
          contactType: "customer service",
        }
      : undefined,
  };

  return (
    <div className="flex min-h-full flex-1 flex-col" style={globalTheme ? globalThemeStyle(globalTheme) : undefined}>
      {themeFontHrefs(globalTheme).map((href) => (
        // React hoists these into <head>; fonts.googleapis.com is allowed by the CSP.
        <link key={href} rel="stylesheet" href={href} precedence="default" />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <SiteTracking siteSettings={siteSettings} consentEnabled={cookieConsentEnabled} />
      <Navbar
        languages={languages}
        socialLinks={headerSocial}
        navLinks={navLinks}
        logoUrl={siteSettings?.siteLogo?.url}
        siteName={siteSettings?.siteNameTh}
        config={
          headerConfig
            ? {
                layout: headerConfig.layout,
                height: headerConfig.height,
                shadow: headerConfig.shadow,
                position: headerConfig.position,
                bgColor: headerConfig.bgColor,
                textColor: headerConfig.textColor,
                hoverBgColor: headerConfig.hoverBgColor,
                hoverTextColor: headerConfig.hoverTextColor,
                activeBgColor: headerConfig.activeBgColor,
                activeTextColor: headerConfig.activeTextColor,
                iconTextColor: headerConfig.iconTextColor,
                logoMode: headerConfig.logoMode,
                logoTextTh: headerConfig.logoTextTh,
                logoTextEn: headerConfig.logoTextEn,
                menuWrap: headerConfig.menuWrap,
                menuFontSize: headerConfig.menuFontSize,
                menuLevels: headerConfig.menuLevels,
                submenuStyle: headerConfig.submenuStyle,
                submenuChildBehavior: headerConfig.submenuChildBehavior,
                showSearch: headerConfig.showSearch,
                showLanguage: headerConfig.showLanguage,
              }
            : undefined
        }
      />
      <main className="flex-1">{children}</main>
      <Footer
        columns={footerColumns}
        contact={footerContact}
        theme={footerConfig}
        logoUrl={siteSettings?.siteLogo?.url}
        blocks={footerBlocks}
        policyLinks={cookieConfig.policyLinks}
        lang={locale}
        social={
          siteSettings
            ? {
                facebookUrl: siteSettings.facebookUrl,
                instagramUrl: siteSettings.instagramUrl,
                youtubeUrl: siteSettings.youtubeUrl,
                tiktokUrl: siteSettings.tiktokUrl,
                lineUrl: siteSettings.lineUrl,
              }
            : null
        }
      />
      {scrollToTopEnabled && <ScrollToTopButton />}
      {cookieConsentEnabled && <SiteCookieConsent locale={locale} config={cookieConfig} />}
      <SocialFloatButtons items={socialFloats} locale={locale} />
      <FloatingWidgets
        lang={locale === "en" ? "en" : "th"}
        widgets={widgets
          .filter((w) => w.type && w.enabled)
          .sort((a, b) => a.order - b.order)
          .map((w) => ({
            id: w.id,
            labelTh: w.labelTh ?? w.name,
            labelEn: w.labelEn,
            type: w.type!,
            icon: w.icon ?? "external-link",
            link: w.link,
            phone: w.phone,
            position: w.position,
            design: w.design,
            color: w.color,
            openInNewTab: w.openInNewTab,
          }))}
      />
      <Popups popups={popups} lang={locale === "en" ? "en" : "th"} />
      <SecretAdminAccess />
    </div>
  );
}
