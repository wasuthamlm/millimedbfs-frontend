import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { BoxIcon } from "@/components/ui/admin-icons";
import { CategoryManager, type CategoryRow } from "@/components/admin/categories/CategoryManager";
import { prisma } from "@/lib/prisma";
import {
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  toggleProductCategory,
  reorderProductCategories,
} from "./actions";

export const metadata: Metadata = { title: "จัดการหมวดหมู่สินค้า" };
export const dynamic = "force-dynamic";

export default async function ProductCategoriesPage() {
  const categories = await prisma.productCategory.findMany({
    orderBy: [{ order: "asc" }, { nameTh: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  const rows: CategoryRow[] = categories.map((c) => ({
    id: c.id,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    slug: c.slug,
    active: c.active,
    parentId: c.parentId,
    itemCount: c._count.products,
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
      />
    </div>
  );
}
