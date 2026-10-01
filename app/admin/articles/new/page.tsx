import { PageHeader } from "@/components/admin/PageHeader";
import { PostForm } from "@/components/admin/articles/PostForm";
import { FileTextIcon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const [categories, role, postOptions, productOptions] = await Promise.all([
    prisma.articleCategory.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { nameTh: "asc" }],
      select: { id: true, nameTh: true, slug: true },
    }),
    getAdminRole(),
    prisma.post.findMany({ where: { deletedAt: null }, select: { id: true, titleTh: true }, orderBy: { updatedAt: "desc" } }),
    prisma.product.findMany({ where: { deletedAt: null }, select: { id: true, nameTh: true }, orderBy: { nameTh: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={FileTextIcon} title="เพิ่มบทความใหม่" />
      <PostForm
        categories={categories}
        canPublish={canDo(role, "article.publish")}
        canDelete={false}
        postOptions={postOptions.map((p) => ({ id: p.id, label: p.titleTh }))}
        productOptions={productOptions.map((p) => ({ id: p.id, label: p.nameTh }))}
      />
    </div>
  );
}
