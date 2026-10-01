import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";
import { SectionsWithData } from "@/components/site/SectionsWithData";
import { MarketingEligibility } from "@/components/analytics/PageTracking";
import { loadLocalizer } from "@/lib/i18n/localize";
import { localeAlternates } from "@/lib/i18n/alternates";

// Renders a CMS-managed page (Page + PageSection, editable from /admin/pages)
// when one exists for `slug`, otherwise falls back to the "coming soon"
// placeholder. Use this instead of a bare <PlaceholderPage /> for any route
// that also has a fixed URL segment (so it can't go through the [...slug]
// catch-all) — that way content added later in the admin actually shows up,
// instead of being shadowed by a hardcoded placeholder forever.

function findPage(slug: string) {
  return prisma.page.findFirst({
    where: { slug, status: "PUBLISHED", archived: false, deletedAt: null },
    include: { sections: { orderBy: { order: "asc" } } },
  });
}

/** Metadata for a fixed route backed by a CMS page: the page's (localized) SEO fields, else the fallbacks. */
export async function cmsPageMetadata(locale: string, slug: string, fallback: { title: string; description?: string }): Promise<Metadata> {
  const page = await prisma.page.findFirst({ where: { slug, status: "PUBLISHED", archived: false, deletedAt: null } });
  const t = page ? await loadLocalizer(locale, [["PAGE", [page.id]]]) : null;
  const title = page && t ? t("PAGE", page.id, "seoTitle", page.seoTitle, page.seoTitleEn) || t("PAGE", page.id, "title", page.titleTh, page.titleEn) : "";
  const description = page && t ? t("PAGE", page.id, "seoDesc", page.seoDesc, page.seoDescEn) : "";
  return {
    title: title || fallback.title,
    description: description || fallback.description,
    alternates: await localeAlternates(locale, `/${slug}`, page?.canonicalUrl),
    ...(page?.seoNoIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export async function CmsPageOrPlaceholder({ slug, title, locale = "th" }: { slug: string; title: string; locale?: string }) {
  const page = await findPage(slug);

  if (!page || page.sections.length === 0) {
    const t = page ? await loadLocalizer(locale, [["PAGE", [page.id]]]) : null;
    return <PlaceholderPage title={page && t ? t("PAGE", page.id, "title", page.titleTh, page.titleEn) : title} locale={locale} />;
  }

  return (
    <>
      <MarketingEligibility eligible={page.marketingEligible} />
      <SectionsWithData sections={page.sections} locale={locale} />
    </>
  );
}
