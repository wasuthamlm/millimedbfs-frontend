import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { PostForm, type InitialPost } from "@/components/admin/articles/PostForm";
import { FileTextIcon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id }, include: { coverImage: true } });
  if (!post) notFound();

  const initialPost: InitialPost = {
    id: post.id,
    kind: post.kind,
    status: post.status,
    slug: post.slug,
    titleTh: post.titleTh,
    titleEn: post.titleEn ?? "",
    excerptTh: post.excerptTh ?? "",
    excerptEn: post.excerptEn ?? "",
    bodyTh: post.bodyTh ?? "",
    bodyEn: post.bodyEn ?? "",
    category: post.category ?? "",
    featured: post.featured,
    coverImageUrl: post.coverImage?.url ?? "",
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={FileTextIcon} title="แก้ไขบทความ" subtitle={post.titleTh} />
      <PostForm initialPost={initialPost} />
    </div>
  );
}
