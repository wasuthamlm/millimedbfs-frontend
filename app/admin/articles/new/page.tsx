import { PageHeader } from "@/components/admin/PageHeader";
import { PostForm } from "@/components/admin/articles/PostForm";
import { FileTextIcon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const categories = await prisma.articleCategory.findMany({
    where: { active: true },
    orderBy: [{ order: "asc" }, { nameTh: "asc" }],
    select: { id: true, nameTh: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={FileTextIcon} title="เพิ่มบทความใหม่" />
      <PostForm categories={categories} />
    </div>
  );
}
