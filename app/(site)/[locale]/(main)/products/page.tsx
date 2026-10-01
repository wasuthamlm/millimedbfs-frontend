import type { Metadata } from "next";
import { ProductListing } from "@/components/products/ProductListing";
import { SectionsWithData } from "@/components/site/SectionsWithData";
import { MarketingEligibility } from "@/components/analytics/PageTracking";
import { prisma } from "@/lib/prisma";
import { localeAlternates } from "@/lib/i18n/alternates";
import { loadLocalizer } from "@/lib/i18n/localize";
import { ui } from "@/lib/i18n/ui";
import { parseListingParams } from "@/lib/product-listing";

export const dynamic = "force-dynamic";

// Blocks added to the "products" page in the page builder render below the listing (legacy CustomSections).
function productsCmsPage() {
  return prisma.page.findFirst({
    where: { slug: "products", status: "PUBLISHED", archived: false, deletedAt: null },
    include: { sections: { orderBy: { order: "asc" } } },
  });
}

export async function generateMetadata({ params, searchParams }: PageProps<"/[locale]/products">): Promise<Metadata> {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  const listing = parseListingParams(sp);
  return {
    title: ui(locale, "products"),
    description: ui(locale, "productsDesc"),
    alternates: await localeAlternates(locale, "/products"),
    // Search / filter variants are the same content — keep only the clean listing indexed.
    ...(listing.q || listing.price !== "all" || listing.sort !== "default" ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ProductsPage({ params, searchParams }: PageProps<"/[locale]/products">) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  const cmsPage = await productsCmsPage();
  const t = cmsPage ? await loadLocalizer(locale, [["PAGE", [cmsPage.id]]]) : null;

  return (
    <>
      <MarketingEligibility eligible={cmsPage?.marketingEligible === true} />
      <ProductListing
        locale={locale}
        params={parseListingParams(sp)}
        title={cmsPage && t ? t("PAGE", cmsPage.id, "title", cmsPage.titleTh, cmsPage.titleEn) : ui(locale, "products")}
        heroPage={cmsPage}
      />
      {cmsPage && cmsPage.sections.length > 0 && <SectionsWithData sections={cmsPage.sections} locale={locale} />}
    </>
  );
}
