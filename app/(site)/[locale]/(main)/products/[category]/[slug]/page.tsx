import type { Metadata } from "next";
import Link from "next/link";
import { ProductGallery } from "@/components/products/ProductGallery";
import { TrackViewContent } from "@/components/analytics/PageTracking";
import { PRODUCT_CARD_SELECT, ProductGrid } from "@/components/products/ProductGrid";
import { sanitizeHtml } from "@/lib/sanitize";
import { formatCurrencyTHB } from "@/lib/utils";
import { notFound, permanentRedirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/prisma";
import { buildBreadcrumbJsonLd, buildOpenGraph, SITE_URL } from "@/lib/site";
import { decodeParam, productCategorySlug, productPath } from "@/lib/public-urls";
import { localePath } from "@/lib/i18n/locales";
import { loadLocalizer } from "@/lib/i18n/localize";
import { localeAlternates } from "@/lib/i18n/alternates";
import { ui } from "@/lib/i18n/ui";

export const dynamic = "force-dynamic";

type Params = { locale: string; category: string; slug: string };

async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    // slug is the canonical key; sku is accepted for rows created before slugs existed
    where: { OR: [{ slug }, { sku: slug }] },
    include: {
      image: true,
      category: { select: { id: true, slug: true, nameTh: true, nameEn: true } },
      gallery: { orderBy: { order: "asc" } },
    },
  });
  if (!product || product.status !== "ACTIVE" || product.deletedAt) return null;
  return product;
}

type LoadedProduct = NonNullable<Awaited<ReturnType<typeof getProduct>>>;

function localizerFor(locale: string, product: LoadedProduct) {
  return loadLocalizer(locale, [
    ["PRODUCT", [product.id]],
    ["PRODUCT_CATEGORY", [product.category?.id]],
  ]);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(decodeParam(slug));
  if (!product) return {};
  const t = await localizerFor(locale, product);
  const name = t("PRODUCT", product.id, "name", product.nameTh, product.nameEn);
  const title = t("PRODUCT", product.id, "seoTitle", product.seoTitle, product.seoTitleEn) || name;
  const description =
    t("PRODUCT", product.id, "seoDesc", product.seoDesc, product.seoDescEn) ||
    t("PRODUCT", product.id, "shortDesc", product.shortDescTh, product.shortDescEn) ||
    t("PRODUCT", product.id, "description", product.descriptionTh, product.descriptionEn).replace(/<[^>]*>/g, " ").slice(0, 160) ||
    undefined;
  const image = product.ogImageUrl || product.image?.url;
  return {
    title,
    description,
    alternates: await localeAlternates(locale, productPath(product), product.canonicalUrl),
    openGraph: image
      ? buildOpenGraph({
          title: t("PRODUCT", product.id, "ogTitle", product.ogTitle, product.ogTitleEn) || title,
          description: t("PRODUCT", product.id, "ogDesc", product.ogDesc, product.ogDescEn) || description,
          images: [image],
        })
      : undefined,
    ...(product.seoNoIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { locale, category, slug } = await params;
  const product = await getProduct(decodeParam(slug));
  if (!product) notFound();

  // One canonical URL per product: a wrong category segment or an sku in
  // place of the slug redirects.
  const path = productPath(product);
  if (decodeParam(category) !== productCategorySlug(product) || decodeParam(slug) !== (product.slug || product.sku)) {
    permanentRedirect(localePath(locale, path));
  }

  const t = await localizerFor(locale, product);
  const name = t("PRODUCT", product.id, "name", product.nameTh, product.nameEn);
  const shortDesc = t("PRODUCT", product.id, "shortDesc", product.shortDescTh, product.shortDescEn);
  const categoryName = product.category
    ? t("PRODUCT_CATEGORY", product.category.id, "name", product.category.nameTh, product.category.nameEn)
    : null;
  const localPath = localePath(locale, path);

  // Legacy "related products": three more from the same category.
  const related = product.categoryId
    ? await prisma.product.findMany({
        where: {
          status: "ACTIVE",
          deletedAt: null,
          id: { not: product.id },
          OR: [{ categoryId: product.categoryId }, { subCategoryId: product.categoryId }],
        },
        orderBy: [{ bestSeller: "desc" }, { order: "asc" }, { updatedAt: "desc" }],
        take: 3,
        select: PRODUCT_CARD_SELECT,
      })
    : [];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    sku: product.sku,
    description: shortDesc || undefined,
    image: [product.image?.url, ...product.gallery.map((g) => g.url)].filter(Boolean),
    offers:
      product.price != null
        ? {
            "@type": "Offer",
            url: `${SITE_URL}${localPath}`,
            priceCurrency: "THB",
            price: product.price,
            availability: "https://schema.org/InStock",
          }
        : undefined,
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: ui(locale, "home"), path: localePath(locale, "/") },
    { name: ui(locale, "products"), path: localePath(locale, "/products") },
    ...(product.category && categoryName
      ? [{ name: categoryName, path: localePath(locale, `/products/${encodeURIComponent(product.category.slug)}`) }]
      : []),
    { name, path: localPath },
  ]);

  const galleryImages = [
    ...(product.image ? [{ url: product.image.url, alt: (locale === "en" && product.image.altEn) || product.image.altTh || name }] : []),
    ...product.gallery.map((g) => ({ url: g.url, alt: g.alt || name })),
  ];
  const description = t("PRODUCT", product.id, "description", product.descriptionTh, product.descriptionEn);
  const descriptionIsHtml = /<[a-z][\s\S]*>/i.test(description);

  return (
    <>
    <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-2">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      <TrackViewContent contentKey={`product.${product.id}`} productId={product.id} sku={product.sku} marketingEligible={product.marketingEligible} />
      <ProductGallery images={galleryImages} locale={locale} />

      <div className="flex flex-col gap-4">
        <nav className="text-xs text-slate-400" aria-label="breadcrumb">
          <Link href={localePath(locale, "/products")} className="hover:text-brand-navy">{ui(locale, "products")}</Link>
          {product.category && (
            <>
              {" › "}
              <Link href={localePath(locale, `/products/${encodeURIComponent(product.category.slug)}`)} className="hover:text-brand-navy">
                {categoryName}
              </Link>
            </>
          )}
        </nav>
        <div className="flex flex-wrap gap-2">
          {product.bestSeller && <span className="rounded-full bg-brand-gold/20 px-3 py-1 text-xs font-semibold text-brand-gold-dark">{ui(locale, "bestSeller")}</span>}
          {categoryName && <span className="rounded-full bg-brand-navy/10 px-3 py-1 text-xs font-medium text-brand-navy">{categoryName}</span>}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{name}</h1>
        {locale === "th" && product.nameEn && <p className="text-base text-slate-500">{product.nameEn}</p>}
        <p className="text-sm text-slate-400">
          {ui(locale, "sku")} {product.sku}
        </p>
        {product.price != null && (
          <p className="text-2xl font-bold text-brand-navy">
            {formatCurrencyTHB(product.price)}
            {product.unit && <span className="text-base font-normal text-slate-500"> / {product.unit}</span>}
          </p>
        )}
        {shortDesc && <p className="text-base leading-relaxed text-slate-700">{shortDesc}</p>}
        {description &&
          (descriptionIsHtml ? (
            <div className="prose prose-slate max-w-none prose-a:text-brand-navy" dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }} />
          ) : (
            <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">{description}</p>
          ))}
      </div>
    </Container>
    {related.length > 0 && (
      <Container className="flex flex-col gap-4 pb-16">
        <h2 className="text-xl font-bold text-slate-900">{ui(locale, "relatedProducts")}</h2>
        <ProductGrid products={related} locale={locale} />
      </Container>
    )}
    </>
  );
}
