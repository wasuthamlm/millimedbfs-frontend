import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm, type InitialProduct } from "@/components/admin/products/ProductForm";
import { BoxIcon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { image: true } });
  if (!product) notFound();

  const initialProduct: InitialProduct = {
    id: product.id,
    sku: product.sku,
    status: product.status,
    nameTh: product.nameTh,
    nameEn: product.nameEn ?? "",
    descriptionTh: product.descriptionTh ?? "",
    descriptionEn: product.descriptionEn ?? "",
    imageUrl: product.image?.url ?? "",
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={BoxIcon} title="แก้ไขสินค้า" subtitle={product.nameTh} />
      <ProductForm initialProduct={initialProduct} />
    </div>
  );
}
