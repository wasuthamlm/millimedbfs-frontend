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
import { BulkActionBar, RowCheckbox, SelectAllCheckbox, SelectionProvider, type BulkAction } from "@/components/admin/list/Selection";
import { InlineText } from "@/components/admin/list/InlineText";
import { TrashToolbar } from "@/components/admin/list/TrashToolbar";
import { computeContentAudit } from "@/lib/content-audit";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/utils";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";
import {
  archivePosts,
  draftPosts,
  emptyPostTrash,
  publishPosts,
  purgePosts,
  renamePost,
  restorePosts,
  trashPosts,
} from "@/app/admin/articles/actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; kind?: string; status?: string; trash?: string }>;
}) {
  const { page: pageParam, q, kind, status, trash } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const inTrash = trash === "1";

  const where: Prisma.PostWhereInput = {
    deletedAt: inTrash ? { not: null } : null,
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
    ...(status && !inTrash ? { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" } : {}),
  };

  const [posts, total, publishedCount, trashCount, categories, role] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: inTrash ? { deletedAt: "desc" } : { updatedAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: { coverImage: { select: { url: true } } },
    }),
    prisma.post.count({ where }),
    prisma.post.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.post.count({ where: { deletedAt: { not: null } } }),
    prisma.articleCategory.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { nameTh: "asc" }],
      select: { id: true, nameTh: true },
    }),
    getAdminRole(),
  ]);

  const canPublish = canDo(role, "article.publish");
  const canDelete = canDo(role, "article.delete");
  const canEdit = canDo(role, "article.edit");
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const bulkActions: BulkAction[] = inTrash
    ? canDelete
      ? [
          { label: "กู้คืน", run: restorePosts },
          { label: "ลบถาวร", run: purgePosts, tone: "danger", confirm: "ลบถาวร {n} บทความ? ไม่สามารถกู้คืนได้" },
        ]
      : []
    : [
        ...(canPublish
          ? [
              { label: "เผยแพร่", run: publishPosts },
              { label: "เป็นฉบับร่าง", run: draftPosts },
              { label: "เก็บถาวร", run: archivePosts },
            ]
          : []),
        ...(canDelete ? [{ label: "ย้ายไปถังขยะ", run: trashPosts, tone: "danger" as const, confirm: "ย้าย {n} บทความไปถังขยะ?" }] : []),
      ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          icon={FileTextIcon}
          title="บทความ"
          subtitle={inTrash ? `ถังขยะ ${trashCount} รายการ` : `ทั้งหมด ${total} รายการ • เผยแพร่แล้ว ${publishedCount}`}
        />
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-dark"
        >
          <PlusIcon className="h-4 w-4" />
          เพิ่มบทความใหม่
        </Link>
      </div>

      <TrashToolbar basePath="/admin/articles" inTrash={inTrash} trashCount={trashCount} canDelete={canDelete} onEmpty={emptyPostTrash} />
      <ArticleFilters />

      <SelectionProvider>
        <BulkActionBar actions={bulkActions} />
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="w-10 px-4 py-3">
                  <SelectAllCheckbox ids={posts.map((p) => p.id)} />
                </th>
                <th className="px-4 py-3 font-medium">ชื่อบทความ</th>
                <th className="px-4 py-3 font-medium">ประเภท</th>
                <th className="px-4 py-3 font-medium">หมวดหมู่</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">SEO</th>
                <th className="px-4 py-3 font-medium">{inTrash ? "ลบเมื่อ" : "เผยแพร่เมื่อ"}</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const audit = computeContentAudit({
                  title: post.titleTh,
                  metaTitle: post.seoTitle,
                  metaDesc: post.seoDesc,
                  focusKeyword: post.focusKeyword,
                  bodyHtml: post.bodyTh,
                  images: [post.coverImage?.url],
                  faq: Array.isArray(post.faq) ? post.faq : [],
                });
                const editable = canEdit && !inTrash;
                return (
                  <tr key={post.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3.5">
                      <RowCheckbox id={post.id} label={`เลือก ${post.titleTh}`} />
                    </td>
                    <td className="max-w-md px-4 py-3.5">
                      <InlineText
                        value={post.titleTh}
                        disabled={!editable}
                        onSave={renamePost.bind(null, post.id, "titleTh")}
                        className="font-medium text-slate-800"
                      />
                      <InlineText
                        value={post.titleEn ?? ""}
                        placeholder="+ ชื่ออังกฤษ"
                        disabled={!editable}
                        onSave={renamePost.bind(null, post.id, "titleEn")}
                        className="text-xs text-slate-400"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <PostKindCell id={post.id} kind={post.kind} />
                    </td>
                    <td className="px-4 py-3.5">
                      <PostCategoryCell id={post.id} categoryId={post.categoryId} categories={categories} />
                    </td>
                    <td className="px-4 py-3.5">
                      {inTrash || !canPublish ? (
                        <span className="text-xs text-slate-500">{inTrash ? `เดิม: ${post.deletedPrevStatus ?? "-"}` : post.status}</span>
                      ) : (
                        <PostStatusCell id={post.id} status={post.status} />
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <SeoScoreBadge score={audit.overall} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">
                      {inTrash
                        ? post.deletedAt
                          ? formatThaiDate(post.deletedAt.toISOString())
                          : "—"
                        : post.publishedAt
                          ? formatThaiDate(post.publishedAt.toISOString())
                          : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <PostRowMenu id={post.id} inTrash={inTrash} canDelete={canDelete} />
                    </td>
                  </tr>
                );
              })}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                    {inTrash ? "ถังขยะว่างเปล่า" : "ไม่พบบทความที่ตรงกับเงื่อนไข"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SelectionProvider>

      <Pager page={page} totalPages={totalPages} basePath="/admin/articles" extraParams={{ q, kind, status, trash }} />
    </div>
  );
}
