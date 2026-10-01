import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SectionsWithData } from "@/components/site/SectionsWithData";
import { PageHero } from "@/components/site/PageHero";
import { buildOpenGraph } from "@/lib/site";
import { loadLocalizer } from "@/lib/i18n/localize";
import { localeAlternates } from "@/lib/i18n/alternates";
import { ui } from "@/lib/i18n/ui";
import { MarketingEligibility } from "@/components/analytics/PageTracking";

export const dynamic = "force-dynamic";

type Props = PageProps<"/[locale]/[...slug]">;

async function getPage(slug: string) {
  return prisma.page.findFirst({
    where: { slug, status: "PUBLISHED", archived: false, deletedAt: null },
    include: { sections: { orderBy: { order: "asc" } } },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug: segments } = await params;
  const slug = segments.join("/");
  const page = await getPage(slug);
  if (!page) return {};
  const t = await loadLocalizer(locale, [["PAGE", [page.id]]]);
  const title = t("PAGE", page.id, "seoTitle", page.seoTitle, page.seoTitleEn) || t("PAGE", page.id, "title", page.titleTh, page.titleEn);
  const description = t("PAGE", page.id, "seoDesc", page.seoDesc, page.seoDescEn) || undefined;
  const ogTitle = t("PAGE", page.id, "ogTitle", page.ogTitle, page.ogTitleEn);
  const ogDesc = t("PAGE", page.id, "ogDesc", page.ogDesc, page.ogDescEn);
  return {
    title,
    description,
    alternates: await localeAlternates(locale, `/${slug}`, page.canonicalUrl),
    ...(ogTitle || ogDesc || page.ogImageUrl
      ? {
          openGraph: buildOpenGraph({
            title: ogTitle || title,
            description: ogDesc || description,
            ...(page.ogImageUrl ? { images: [page.ogImageUrl] } : {}),
          }),
        }
      : {}),
    ...(page.seoNoIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function DynamicPage({ params }: Props) {
  const { locale, slug: segments } = await params;
  const slug = segments.join("/");

  const page = await getPage(slug);
  if (!page) notFound();
  const t = await loadLocalizer(locale, [["PAGE", [page.id]]]);

  const hero = <PageHero title={t("PAGE", page.id, "title", page.titleTh, page.titleEn)} page={page} />;
  const customSchema =
    page.schemaCustom && typeof page.schemaCustom === "object" ? (
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(page.schemaCustom).replace(/</g, "\\u003c") }} />
    ) : null;

  return (
    <>
      {hero}
      {customSchema}
      <MarketingEligibility eligible={page.marketingEligible} />
      {page.sections.length === 0 ? (
        <p className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-500">{ui(locale, "comingSoon")}</p>
      ) : (
        <SectionsWithData sections={page.sections} locale={locale} />
      )}
    </>
  );
}
