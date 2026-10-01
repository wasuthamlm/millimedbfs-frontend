import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { FileTextIcon } from "@/components/ui/admin-icons";
import { CategoryManager, type CategoryRow } from "@/components/admin/categories/CategoryManager";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";
import {
  createArticleCategory,
  updateArticleCategory,
  deleteArticleCategory,
  deleteArticleCategories,
  toggleArticleCategory,
  setArticleCategoriesActive,
  reorderArticleCategories,
} from "./actions";

export const metadata: Metadata = { title: "จัดการประเภทบทความ" };
export const dynamic = "force-dynamic";

export default async function ArticleCategoriesPage() {
  const [categories, role] = await Promise.all([
    prisma.articleCategory.findMany({
      orderBy: [{ order: "asc" }, { nameTh: "asc" }],
      include: {
        _count: { select: { posts: { where: { deletedAt: null } } } },
        posts: { where: { deletedAt: null }, select: { titleTh: true }, take: 10, orderBy: { updatedAt: "desc" } },
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
    itemCount: c._count.posts,
    descriptionTh: c.descriptionTh,
    descriptionEn: c.descriptionEn,
    itemTitles: c.posts.map((p) => p.titleTh),
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={FileTextIcon} title="จัดการประเภทบทความ" subtitle={`ประเภททั้งหมด ${rows.length} รายการ`} />
      <CategoryManager
        itemCountLabel="บทความ"
        hasHierarchy
        initialCategories={rows}
        onCreate={createArticleCategory}
        onUpdate={updateArticleCategory}
        onDelete={deleteArticleCategory}
        onToggle={toggleArticleCategory}
        onReorder={reorderArticleCategories}
        onBulkDelete={deleteArticleCategories}
        onBulkActive={setArticleCategoriesActive}
        canDelete={canDo(role, "category.delete")}
        canPublish={canDo(role, "category.publish")}
      />
    </div>
  );
}
