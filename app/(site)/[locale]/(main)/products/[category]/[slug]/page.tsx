import type { Metadata } from "next";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/prisma";
import { buildBreadcrumbJsonLd, buildOpenGraph, SITE_URL } from "@/lib/site";
import { decodeParam, productCategorySlug, productPath } from "@/lib/public-urls";
import { localePath } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

type Params = { locale: string; category: string; slug: string };

async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    // slug is the canonical key; sku is accepted for rows created before slugs existed
    where: { OR: [{ slug }, { sku: slug }] },
    include: { image: true, category: { select: { slug: true, nameTh: true } } },
  });
  if (!product || product.status !== "ACTIVE" || product.deletedAt) return null;
  return product;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const product = await getProduct(decodeParam((await params).slug));
  if (!product) return {};
  const title = product.seoTitle || product.nameTh;
  const description = product.seoDesc || product.shortDescTh || product.descriptionTh || undefined;
  const image = product.ogImageUrl || product.image?.url;
  return {
    title,
    description,
    alternates: { canonical: product.canonicalUrl || productPath(product) },
    openGraph: image
      ? buildOpenGraph({ title: product.ogTitle || title, description: product.ogDesc || description, images: [image] })
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

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameTh,
    sku: product.sku,
    description: product.shortDescTh ?? product.descriptionTh ?? undefined,
    image: product.image ? [product.image.url] : undefined,
    offers:
      product.price != null
        ? {
            "@type": "Offer",
            url: `${SITE_URL}${path}`,
            priceCurrency: "THB",
            price: product.price,
            availability: "https://schema.org/InStock",
          }
        : undefined,
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "หน้าแรก", path: "/" },
    { name: "ผลิตภัณฑ์", path: "/products" },
    ...(product.category
      ? [{ name: product.category.nameTh, path: `/products/${encodeURIComponent(product.category.slug)}` }]
      : []),
    { name: product.nameTh, path },
  ]);

  return (
    <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-2">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.nameTh}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-300">ไม่มีรูปภาพ</div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-400">{product.sku}</p>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{product.nameTh}</h1>
        {product.nameEn && <p className="text-base text-slate-500">{product.nameEn}</p>}
        {product.descriptionTh && (
          <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">{product.descriptionTh}</p>
        )}
      </div>
    </Container>
  );
}
