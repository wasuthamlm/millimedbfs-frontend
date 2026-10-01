import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { BoxIcon } from "@/components/ui/admin-icons";
import { CategoryManager, type CategoryRow } from "@/components/admin/categories/CategoryManager";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";
import {
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  deleteProductCategories,
  toggleProductCategory,
  setProductCategoriesActive,
  reorderProductCategories,
} from "./actions";

export const metadata: Metadata = { title: "จัดการหมวดหมู่สินค้า" };
export const dynamic = "force-dynamic";

export default async function ProductCategoriesPage() {
  const [categories, role] = await Promise.all([
    prisma.productCategory.findMany({
      orderBy: [{ order: "asc" }, { nameTh: "asc" }],
      include: {
        _count: { select: { products: { where: { deletedAt: null } }, subCategoryProducts: { where: { deletedAt: null } } } },
        products: { where: { deletedAt: null }, select: { nameTh: true }, take: 10 },
        subCategoryProducts: { where: { deletedAt: null }, select: { nameTh: true }, take: 10 },
      },
    }),
    getAdminRole(),
  ]);

  const rows: CategoryRow[] = categories.map((c) => ({
    id: c.id,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    slug: c.slug,
    active: c.active,
    parentId: c.parentId,
    itemCount: c._count.products + c._count.subCategoryProducts,
    descriptionTh: c.descriptionTh,
    descriptionEn: c.descriptionEn,
    itemTitles: [...c.products, ...c.subCategoryProducts].slice(0, 10).map((p) => p.nameTh),
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={BoxIcon} title="จัดการหมวดหมู่สินค้า" subtitle={`หมวดหมู่ทั้งหมด ${rows.length} รายการ`} />
      <CategoryManager
        itemCountLabel="สินค้า"
        hasHierarchy
        initialCategories={rows}
        onCreate={createProductCategory}
        onUpdate={updateProductCategory}
        onDelete={deleteProductCategory}
        onToggle={toggleProductCategory}
        onReorder={reorderProductCategories}
        onBulkDelete={deleteProductCategories}
        onBulkActive={setProductCategoriesActive}
        canDelete={canDo(role, "category.delete")}
        canPublish={canDo(role, "category.publish")}
      />
    </div>
  );
}
