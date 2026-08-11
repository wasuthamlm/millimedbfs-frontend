import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/prisma";
import { buildBreadcrumbJsonLd, buildOpenGraph, SITE_URL } from "@/lib/site";

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { image: true },
  });
  if (!product || product.status !== "ACTIVE") return null;
  return product;
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { id: true },
  });
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return {};
  const title = product.seoTitle || product.nameTh;
  const description = product.seoDesc || product.descriptionTh || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/products/${id}` },
    openGraph: product.image
      ? buildOpenGraph({ title, description, images: [product.image.url] })
      : undefined,
    ...(product.seoNoIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameTh,
    sku: product.sku,
    description: product.descriptionTh ?? undefined,
    image: product.image ? [product.image.url] : undefined,
    offers:
      product.price != null
        ? {
            "@type": "Offer",
            url: `${SITE_URL}/products/${id}`,
            priceCurrency: "THB",
            price: product.price,
            availability: "https://schema.org/InStock",
          }
        : undefined,
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "หน้าแรก", path: "/" },
    { name: "ผลิตภัณฑ์", path: "/products" },
    { name: product.nameTh, path: `/products/${id}` },
  ]);

  return (
    <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.nameTh}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-300">
            ไม่มีรูปภาพ
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-400">{product.sku}</p>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{product.nameTh}</h1>
        {product.nameEn && <p className="text-base text-slate-500">{product.nameEn}</p>}
        {product.descriptionTh && (
          <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
            {product.descriptionTh}
          </p>
        )}
      </div>
    </Container>
  );
}
