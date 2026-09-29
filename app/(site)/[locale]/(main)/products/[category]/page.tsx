import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PRODUCT_CARD_SELECT, ProductGrid } from "@/components/products/ProductGrid";
import { prisma } from "@/lib/prisma";
import { decodeParam, productPath } from "@/lib/public-urls";
import { localePath } from "@/lib/i18n/locales";

type Params = { locale: string; category: string };

async function getCategory(slug: string) {
  const category = await prisma.productCategory.findUnique({ where: { slug } });
  return category?.active && category.status === "PUBLISHED" ? category : null;
}

/** The category plus every descendant — a parent's page lists its sub-categories' products too. */
async function categoryTreeIds(rootId: string): Promise<string[]> {
  const all = await prisma.productCategory.findMany({ select: { id: true, parentId: true } });
  const ids = [rootId];
  for (let i = 0; i < ids.length; i++) {
    for (const c of all) if (c.parentId === ids[i]) ids.push(c.id);
  }
  return ids;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const category = await getCategory(decodeParam((await params).category));
  if (!category) return {};
  return {
    title: category.nameTh,
    description: category.descriptionTh || undefined,
    alternates: { canonical: `/products/${encodeURIComponent(category.slug)}` },
  };
}

export default async function ProductCategoryPage({ params }: { params: Promise<Params> }) {
  const { locale, category: rawCategory } = await params;
  const slug = decodeParam(rawCategory);
  const category = await getCategory(slug);

  if (!category) {
    // Old /products/<uuid> URLs from before the legacy URL scheme was restored.
    const product = await prisma.product.findUnique({
      where: { id: slug },
      select: { slug: true, sku: true, status: true, category: { select: { slug: true } } },
    }).catch(() => null);
    if (product?.status === "ACTIVE") permanentRedirect(localePath(locale, productPath(product)));
    notFound();
  }

  const ids = await categoryTreeIds(category.id);
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
      OR: [{ categoryId: { in: ids } }, { subCategoryId: { in: ids } }],
    },
    orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
    select: PRODUCT_CARD_SELECT,
  });

  return (
    <Container className="flex flex-col gap-8 py-14 sm:py-20">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{category.nameTh}</h1>
      {category.descriptionTh && <p className="max-w-3xl text-slate-600">{category.descriptionTh}</p>}
      {products.length === 0 ? (
        <p className="py-16 text-center text-slate-400">ยังไม่มีสินค้าในหมวดนี้</p>
      ) : (
        <ProductGrid products={products} locale={locale} />
      )}
    </Container>
  );
}
