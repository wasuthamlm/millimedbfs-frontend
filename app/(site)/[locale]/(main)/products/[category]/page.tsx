import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ProductListing } from "@/components/products/ProductListing";
import { prisma } from "@/lib/prisma";
import { decodeParam, productPath } from "@/lib/public-urls";
import { localePath } from "@/lib/i18n/locales";
import { loadLocalizer } from "@/lib/i18n/localize";
import { localeAlternates } from "@/lib/i18n/alternates";
import { categoryTreeIds, parseListingParams } from "@/lib/product-listing";

export const dynamic = "force-dynamic";

type Props = PageProps<"/[locale]/products/[category]">;

async function getCategory(slug: string) {
  const category = await prisma.productCategory.findUnique({ where: { slug } });
  return category?.active && category.status === "PUBLISHED" ? category : null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ locale, category: raw }, sp] = await Promise.all([params, searchParams]);
  const category = await getCategory(decodeParam(raw));
  if (!category) return {};
  const t = await loadLocalizer(locale, [["PRODUCT_CATEGORY", [category.id]]]);
  const listing = parseListingParams(sp);
  return {
    title: t("PRODUCT_CATEGORY", category.id, "name", category.nameTh, category.nameEn),
    description: t("PRODUCT_CATEGORY", category.id, "description", category.descriptionTh, category.descriptionEn) || undefined,
    alternates: await localeAlternates(locale, `/products/${encodeURIComponent(category.slug)}`),
    ...(listing.q || listing.price !== "all" || listing.sort !== "default" ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ProductCategoryPage({ params, searchParams }: Props) {
  const [{ locale, category: rawCategory }, sp] = await Promise.all([params, searchParams]);
  const slug = decodeParam(rawCategory);
  const category = await getCategory(slug);

  if (!category) {
    // Old /products/<uuid> URLs from before the legacy URL scheme was restored.
    const product = await prisma.product
      .findUnique({
        where: { id: slug },
        select: { slug: true, sku: true, status: true, category: { select: { slug: true } } },
      })
      .catch(() => null);
    if (product?.status === "ACTIVE") permanentRedirect(localePath(locale, productPath(product)));
    notFound();
  }

  // The top-level ancestor decides which category tab is highlighted.
  const all = await prisma.productCategory.findMany({ select: { id: true, parentId: true } });
  let rootId = category.id;
  for (let guard = 0; guard < 10; guard++) {
    const parent = all.find((c) => c.id === rootId)?.parentId;
    if (!parent) break;
    rootId = parent;
  }

  const t = await loadLocalizer(locale, [["PRODUCT_CATEGORY", [category.id]]]);

  return (
    <ProductListing
      locale={locale}
      params={parseListingParams(sp)}
      title={t("PRODUCT_CATEGORY", category.id, "name", category.nameTh, category.nameEn)}
      subtitle={t("PRODUCT_CATEGORY", category.id, "description", category.descriptionTh, category.descriptionEn)}
      activeCategory={category}
      activeRootId={rootId}
      categoryIds={await categoryTreeIds(category.id)}
    />
  );
}
