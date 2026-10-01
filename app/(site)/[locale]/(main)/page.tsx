import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SectionsWithData } from "@/components/site/SectionsWithData";
import { MarketingEligibility } from "@/components/analytics/PageTracking";
import { loadLocalizer } from "@/lib/i18n/localize";
import { localeAlternates } from "@/lib/i18n/alternates";
import { localeInfo, localePath } from "@/lib/i18n/locales";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { SectionType } from "@/lib/generated/prisma/client";

export const dynamic = "force-dynamic";

async function loadHome() {
  return prisma.page.findUnique({ where: { slug: "home" }, include: { sections: { orderBy: { order: "asc" } } } });
}

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const page = await loadHome();
  const t = page ? await loadLocalizer(locale, [["PAGE", [page.id]]]) : null;
  const title = page && t ? t("PAGE", page.id, "seoTitle", page.seoTitle, page.seoTitleEn) || t("PAGE", page.id, "title", page.titleTh, page.titleEn) : "";
  const description = page && t ? t("PAGE", page.id, "seoDesc", page.seoDesc, page.seoDescEn) : "";
  return {
    title: title || undefined,
    description: description || undefined,
    alternates: await localeAlternates(locale, "/", page?.canonicalUrl),
    ...(page?.seoNoIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

const DEFAULT_SECTIONS = [
  { id: "default-hero", type: "HERO_BANNERS" as SectionType },
  { id: "default-news", type: "LATEST_NEWS" as SectionType },
].map((s, i) => ({
  ...s,
  order: i,
  titleTh: "",
  titleEn: null,
  visibleDesktop: true,
  visibleTablet: true,
  visibleMobile: true,
  columns: null,
  itemsToShow: null,
  config: null,
}));

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  const [page, settings, contact] = await Promise.all([
    loadHome(),
    prisma.siteSettings.findUnique({ where: { id: "singleton" }, include: { siteLogo: true } }),
    prisma.footerContact.findUnique({ where: { id: "singleton" } }),
  ]);

  // Fallback to hardcoded defaults if the "home" page hasn't been configured
  // in the DB yet (e.g. fresh install before seeding), so the homepage never
  // renders blank.
  const sections = page && page.sections.length > 0 ? page.sections : DEFAULT_SECTIONS;

  const en = locale === "en";
  const siteName = (en && settings?.siteNameEn) || settings?.siteNameTh || SITE_NAME;
  const home = `${SITE_URL}${localePath(locale, "/")}`;
  // WebSite (+ sitelinks search box) and LocalBusiness — home page only (legacy SeoHead).
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: home,
      inLanguage: localeInfo(locale).hreflang,
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}${localePath(locale, "/search")}?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    ...(contact
      ? [
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: (en && contact.companyNameEn) || contact.companyNameTh || siteName,
            url: home,
            ...(settings?.siteLogo?.url ? { image: settings.siteLogo.url, logo: settings.siteLogo.url } : {}),
            ...(contact.phone ? { telephone: contact.phone } : {}),
            ...(contact.email ? { email: contact.email } : {}),
            ...(((en && contact.addressEn) || contact.address) ? { address: (en && contact.addressEn) || contact.address } : {}),
            ...(contact.taxId ? { taxID: contact.taxId } : {}),
          },
        ]
      : []),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <MarketingEligibility eligible={page?.marketingEligible === true} />
      <SectionsWithData sections={sections} locale={locale} />
    </>
  );
}
