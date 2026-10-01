import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm, type InitialProduct } from "@/components/admin/products/ProductForm";
import { BoxIcon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, role] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { image: true, gallery: { orderBy: { order: "asc" } } } }),
    prisma.productCategory.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { nameTh: "asc" }],
      select: { id: true, nameTh: true, parentId: true, slug: true },
    }),
    getAdminRole(),
  ]);
  if (!product) notFound();

  const initialProduct: InitialProduct = {
    id: product.id,
    sku: product.sku,
    slug: product.slug ?? product.sku.toLowerCase(),
    status: product.status,
    nameTh: product.nameTh,
    nameEn: product.nameEn ?? "",
    shortDescTh: product.shortDescTh ?? "",
    shortDescEn: product.shortDescEn ?? "",
    descriptionTh: product.descriptionTh ?? "",
    descriptionEn: product.descriptionEn ?? "",
    imageUrl: product.image?.url ?? "",
    gallery: product.gallery.map((g) => ({ url: g.url, alt: g.alt ?? "" })),
    categoryId: product.categoryId ?? "",
    subCategoryId: product.subCategoryId ?? "",
    unit: product.unit ?? "",
    price: product.price != null ? String(product.price) : "",
    featured: product.featured,
    bestSeller: product.bestSeller,
    seoTitle: product.seoTitle ?? "",
    seoDesc: product.seoDesc ?? "",
    seoTitleEn: product.seoTitleEn ?? "",
    seoDescEn: product.seoDescEn ?? "",
    seoNoIndex: product.seoNoIndex,
    focusKeyword: product.focusKeyword ?? "",
    secondaryKeywords: product.secondaryKeywords,
    ogTitle: product.ogTitle ?? "",
    ogTitleEn: product.ogTitleEn ?? "",
    ogDesc: product.ogDesc ?? "",
    ogDescEn: product.ogDescEn ?? "",
    ogImageUrl: product.ogImageUrl ?? "",
    canonicalUrl: product.canonicalUrl ?? "",
    marketingEligible: product.marketingEligible,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={BoxIcon} title="แก้ไขสินค้า" subtitle={product.deletedAt ? `${product.nameTh} (อยู่ในถังขยะ)` : product.nameTh} />
      <ProductForm
        initialProduct={initialProduct}
        categories={categories}
        canPublish={canDo(role, "product.publish")}
        canDelete={canDo(role, "product.delete") && !product.deletedAt}
      />
    </div>
  );
}
