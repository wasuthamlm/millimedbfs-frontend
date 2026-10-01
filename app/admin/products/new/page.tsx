import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { BoxIcon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, role] = await Promise.all([
    prisma.productCategory.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { nameTh: "asc" }],
      select: { id: true, nameTh: true, parentId: true, slug: true },
    }),
    getAdminRole(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={BoxIcon} title="เพิ่มสินค้าใหม่" />
      <ProductForm categories={categories} canPublish={canDo(role, "product.publish")} canDelete={false} />
    </div>
  );
}
