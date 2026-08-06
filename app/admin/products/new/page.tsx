import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { BoxIcon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.productCategory.findMany({
    where: { active: true },
    orderBy: [{ order: "asc" }, { nameTh: "asc" }],
    select: { id: true, nameTh: true, parentId: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={BoxIcon} title="เพิ่มสินค้าใหม่" />
      <ProductForm categories={categories} />
    </div>
  );
}
