import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminRole } from "@/lib/require-admin";
import { sanitizeHtml } from "@/lib/sanitize";
import { buildOpenGraph, SITE_URL } from "@/lib/site";
import { localePath } from "@/lib/i18n/locales";
import { localeAlternates } from "@/lib/i18n/alternates";
import { decodeParam } from "@/lib/public-urls";
import { getSiteConfig, SITE_CONFIG_KEYS } from "@/lib/site-config";
import { DEFAULT_COOKIE_CONFIG } from "@/lib/i18n/cookie-strings";
import { globalThemeStyle, themeFontHrefs } from "@/lib/theme";
import { parseLandingFaq, parseLandingFooter, parseLandingHeader, parseLandingWidget, type LandingPreviewConfig } from "@/lib/landing";
import { LandingShell } from "@/components/landing/LandingShell";
import { MarketingEligibility } from "@/components/analytics/PageTracking";
import { SectionsWithData } from "@/components/site/SectionsWithData";
import { SiteCookieConsent, SiteTracking } from "@/components/layout/SiteTracking";

// Standalone campaign page — sits outside the (main) group, so no site header/footer/widgets.
export const dynamic = "force-dynamic";

type Props = PageProps<"/[locale]/lp/[slug]">;

async function loadLanding(slug: string, preview: boolean) {
  const page = await prisma.landingPage.findUnique({
    where: { slug },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  if (!page || page.deletedAt) return null;
  // Drafts are only visible to signed-in admins through the editor's preview.
  if (page.status !== "PUBLISHED" && !(preview && (await getAdminRole()))) return null;
  return page;
}

const isPreview = (sp: Record<string, string | string[] | undefined>) => sp.preview === "1";

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug, locale }, sp] = await Promise.all([params, searchParams]);
  const preview = isPreview(sp);
  const page = await loadLanding(decodeParam(slug), preview);
  if (!page) return {};
  const en = locale === "en";
  const title = (en && (page.seoTitleEn || page.titleEn)) || page.seoTitle || page.titleTh;
  const description = (en && page.seoDescEn) || page.seoDesc || undefined;
  const ogImage = page.ogImageUrl || page.coverImageUrl;
  return {
    title: { absolute: title },
    description,
    ...(page.focusKeyword ? { keywords: page.focusKeyword } : {}),
    alternates: await localeAlternates(locale, `/lp/${page.slug}`, page.canonicalUrl),
    openGraph: buildOpenGraph({
      title: (en && page.ogTitleEn) || page.ogTitle || title,
      description: (en && page.ogDescEn) || page.ogDesc || description,
      url: localePath(locale, `/lp/${page.slug}`),
      ...(ogImage ? { images: [ogImage] } : {}),
    }),
    ...(page.noIndex || preview ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function LandingPageRoute({ params, searchParams }: Props) {
  const [{ slug, locale }, sp] = await Promise.all([params, searchParams]);
  const preview = isPreview(sp);
  const page = await loadLanding(decodeParam(slug), preview);
  if (!page) notFound();

  const [siteSettings, widgets, globalTheme, cookieConfig] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.widget.findUnique({ where: { key: "cookie-consent" } }),
    prisma.globalTheme.findUnique({ where: { id: "singleton" } }),
    getSiteConfig(SITE_CONFIG_KEYS.cookieConsent, DEFAULT_COOKIE_CONFIG),
  ]);
  const consentEnabled = widgets?.enabled ?? false;

  const initial: LandingPreviewConfig = {
    header: parseLandingHeader(page.headerConfig),
    footer: parseLandingFooter(page.footerConfig),
    widget: parseLandingWidget(page.widgetConfig),
    theme: {
      useSiteColors: page.useSiteColors,
      primaryColor: page.primaryColor,
      accentColor: page.accentColor,
      bgColor: page.bgColor,
      textColor: page.textColor,
    },
    faq: parseLandingFaq(page.faq),
  };

  const en = locale === "en";
  const title = (en && (page.seoTitleEn || page.titleEn)) || page.seoTitle || page.titleTh;
  const faq = initial.faq
    .map((f) => ({ q: (en && f.qEn) || f.qTh, a: (en && f.aEn) || f.aTh }))
    .filter((f) => f.q && f.a);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description: (en && page.seoDescEn) || page.seoDesc || undefined,
      url: `${SITE_URL}${localePath(locale, `/lp/${page.slug}`)}`,
      ...(page.focusKeyword ? { keywords: page.focusKeyword } : {}),
    },
    ...(faq.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]
      : []),
    ...(page.geoPlaceName
      ? [
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: page.geoPlaceName,
            ...(page.geoAddress ? { address: page.geoAddress } : {}),
            ...(page.geoLatitude && page.geoLongitude
              ? { geo: { "@type": "GeoCoordinates", latitude: page.geoLatitude, longitude: page.geoLongitude } }
              : {}),
          },
        ]
      : []),
  ];

  return (
    // Fonts / radius follow the site theme; colours come from the landing page itself (LandingShell).
    <div className="flex min-h-full flex-1 flex-col" style={globalThemeStyle(globalTheme)}>
      {themeFontHrefs(globalTheme).map((href) => (
        <link key={href} rel="stylesheet" href={href} precedence="default" />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {!preview && <SiteTracking siteSettings={siteSettings} consentEnabled={consentEnabled} />}
      {!preview && <MarketingEligibility eligible={page.marketingEligible} />}
      <LandingShell
        initial={initial}
        footerHtml={sanitizeHtml(initial.footer.text)}
        siteColors={globalTheme}
        preview={preview}
        lang={locale}
      >
        <SectionsWithData sections={page.sections} locale={locale} />
      </LandingShell>
      {!preview && consentEnabled && <SiteCookieConsent locale={locale} config={cookieConfig} />}
    </div>
  );
}
