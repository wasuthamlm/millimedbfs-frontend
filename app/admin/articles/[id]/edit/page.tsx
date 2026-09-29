import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { PostForm, type InitialPost } from "@/components/admin/articles/PostForm";
import type { FaqItem } from "@/components/admin/FaqEditor";
import { FileTextIcon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";
import { toBangkokInput } from "@/lib/utils";

export const dynamic = "force-dynamic";

function asFaq(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((f) => ({
    qTh: String(f?.qTh ?? f?.q_th ?? ""),
    aTh: String(f?.aTh ?? f?.a_th ?? ""),
    qEn: String(f?.qEn ?? f?.q_en ?? ""),
    aEn: String(f?.aEn ?? f?.a_en ?? ""),
  }));
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories, role] = await Promise.all([
    prisma.post.findUnique({ where: { id }, include: { coverImage: true } }),
    prisma.articleCategory.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { nameTh: "asc" }],
      select: { id: true, nameTh: true, slug: true },
    }),
    getAdminRole(),
  ]);
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
    categoryId: post.categoryId ?? "",
    featured: post.featured,
    coverImageUrl: post.coverImage?.url ?? "",
    publishedAt: toBangkokInput(post.publishedAt),
    seoTitle: post.seoTitle ?? "",
    seoDesc: post.seoDesc ?? "",
    seoTitleEn: post.seoTitleEn ?? "",
    seoDescEn: post.seoDescEn ?? "",
    seoNoIndex: post.seoNoIndex,
    focusKeyword: post.focusKeyword ?? "",
    secondaryKeywords: post.secondaryKeywords,
    ogTitle: post.ogTitle ?? "",
    ogTitleEn: post.ogTitleEn ?? "",
    ogDesc: post.ogDesc ?? "",
    ogDescEn: post.ogDescEn ?? "",
    ogImageUrl: post.ogImageUrl ?? "",
    canonicalUrl: post.canonicalUrl ?? "",
    marketingEligible: post.marketingEligible,
    faq: asFaq(post.faq),
    schemaArticle:
      post.schemaArticle && typeof post.schemaArticle === "object" && !Array.isArray(post.schemaArticle)
        ? (post.schemaArticle as Record<string, unknown>)
        : null,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={FileTextIcon}
        title={`แก้ไข: ${post.titleTh}`}
        subtitle={post.deletedAt ? "บทความนี้อยู่ในถังขยะ — กู้คืนได้จากรายการบทความ" : undefined}
      />
      <PostForm
        initialPost={initialPost}
        categories={categories}
        canPublish={canDo(role, "article.publish")}
        canDelete={canDo(role, "article.delete") && !post.deletedAt}
      />
    </div>
  );
}
