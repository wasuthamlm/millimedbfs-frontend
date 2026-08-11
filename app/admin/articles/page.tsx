import Link from "next/link";
import { Prisma } from "@/lib/generated/prisma/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pager } from "@/components/admin/Pager";
import { FileTextIcon, PlusIcon } from "@/components/ui/admin-icons";
import { ArticleFilters } from "@/components/admin/articles/ArticleFilters";
import { PostStatusCell } from "@/components/admin/articles/PostStatusCell";
import { PostKindCell } from "@/components/admin/articles/PostKindCell";
import { PostCategoryCell } from "@/components/admin/articles/PostCategoryCell";
import { PostRowMenu } from "@/components/admin/articles/PostRowMenu";
import { SeoScoreBadge } from "@/components/admin/articles/SeoScoreBadge";
import { calculateSeoAeoGeo, postToScoreInput } from "@/lib/seo-score";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; kind?: string; status?: string }>;
}) {
  const { page: pageParam, q, kind, status } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.PostWhereInput = {
    ...(q
      ? {
          OR: [
            { titleTh: { contains: q, mode: "insensitive" } },
            { titleEn: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(kind ? { kind: kind as "ARTICLE" | "NEWS" } : {}),
    ...(status ? { status: status as "DRAFT" | "PUBLISHED" } : {}),
  };

  const [posts, totalArticles, publishedArticles, categories] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.post.count({ where }),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.articleCategory.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { nameTh: "asc" }],
      select: { id: true, nameTh: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalArticles / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          icon={FileTextIcon}
          title="บทความ"
          subtitle={`บทความทั้งหมด ${totalArticles} รายการ • เผยแพร่แล้ว ${publishedArticles}`}
        />
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-dark"
        >
          <PlusIcon className="h-4 w-4" />
          เพิ่มบทความใหม่
        </Link>
      </div>

      <ArticleFilters />

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">ชื่อบทความ</th>
              <th className="px-6 py-3 font-medium">ประเภท</th>
              <th className="px-6 py-3 font-medium">หมวดหมู่</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
              <th className="px-6 py-3 font-medium">SEO</th>
              <th className="px-6 py-3 font-medium">เผยแพร่เมื่อ</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const seo = calculateSeoAeoGeo(
                postToScoreInput({
                  titleTh: post.titleTh,
                  titleEn: post.titleEn,
                  seoTitle: post.seoTitle,
                  seoTitleEn: post.seoTitleEn,
                  seoDesc: post.seoDesc,
                  seoDescEn: post.seoDescEn,
                  excerptTh: post.excerptTh,
                  bodyTh: post.bodyTh,
                  slug: post.slug,
                  hasCoverImage: !!post.coverImageId,
                }),
              );

              return (
                <tr key={post.id} className="border-b border-slate-50 last:border-0">
                  <td className="max-w-md px-6 py-3.5">
                    <Link
                      href={`/admin/articles/${post.id}/edit`}
                      className="block truncate font-medium text-slate-800 hover:text-brand-navy"
                    >
                      {post.titleTh}
                    </Link>
                    <p className="truncate text-xs text-slate-400">
                      {post.titleEn || "+ ชื่ออังกฤษ"}
                    </p>
                  </td>
                  <td className="px-6 py-3.5">
                    <PostKindCell id={post.id} kind={post.kind} />
                  </td>
                  <td className="px-6 py-3.5">
                    <PostCategoryCell id={post.id} categoryId={post.categoryId} categories={categories} />
                  </td>
                  <td className="px-6 py-3.5">
                    <PostStatusCell id={post.id} status={post.status} />
                  </td>
                  <td className="px-6 py-3.5">
                    <SeoScoreBadge score={seo.seo.score} />
                  </td>
                  <td className="px-6 py-3.5 text-slate-400">
                    {post.publishedAt ? formatThaiDate(post.publishedAt.toISOString()) : "—"}
                  </td>
                  <td className="px-6 py-3.5">
                    <PostRowMenu id={post.id} />
                  </td>
                </tr>
              );
            })}
            {posts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  ไม่พบบทความที่ตรงกับเงื่อนไข
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} totalPages={totalPages} basePath="/admin/articles" extraParams={{ q, kind, status }} />
    </div>
  );
}
