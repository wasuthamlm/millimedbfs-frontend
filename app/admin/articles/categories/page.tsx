import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { FileTextIcon } from "@/components/ui/admin-icons";
import { CategoryManager, type CategoryRow } from "@/components/admin/categories/CategoryManager";
import { prisma } from "@/lib/prisma";
import {
  createArticleCategory,
  updateArticleCategory,
  deleteArticleCategory,
  toggleArticleCategory,
  reorderArticleCategories,
} from "./actions";

export const metadata: Metadata = { title: "จัดการประเภทบทความ" };
export const dynamic = "force-dynamic";

export default async function ArticleCategoriesPage() {
  const categories = await prisma.articleCategory.findMany({
    orderBy: [{ order: "asc" }, { nameTh: "asc" }],
    include: { _count: { select: { posts: true } } },
  });

  const rows: CategoryRow[] = categories.map((c) => ({
    id: c.id,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    slug: c.slug,
    active: c.active,
    parentId: null,
    itemCount: c._count.posts,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={FileTextIcon} title="จัดการประเภทบทความ" subtitle={`ประเภททั้งหมด ${rows.length} รายการ`} />
      <CategoryManager
        itemCountLabel="บทความ"
        hasHierarchy={false}
        initialCategories={rows}
        onCreate={createArticleCategory}
        onUpdate={updateArticleCategory}
        onDelete={deleteArticleCategory}
        onToggle={toggleArticleCategory}
        onReorder={reorderArticleCategories}
      />
    </div>
  );
}
