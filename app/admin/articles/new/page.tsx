import { PageHeader } from "@/components/admin/PageHeader";
import { PostForm } from "@/components/admin/articles/PostForm";
import { FileTextIcon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const [categories, role] = await Promise.all([
    prisma.articleCategory.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { nameTh: "asc" }],
      select: { id: true, nameTh: true, slug: true },
    }),
    getAdminRole(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={FileTextIcon} title="เพิ่มบทความใหม่" />
      <PostForm categories={categories} canPublish={canDo(role, "article.publish")} canDelete={false} />
    </div>
  );
}
