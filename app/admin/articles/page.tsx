import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Pager } from "@/components/admin/Pager";
import { FileTextIcon, PlusIcon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [posts, totalArticles, publishedArticles] = await Promise.all([
    prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
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

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">ชื่อบทความ</th>
              <th className="px-6 py-3 font-medium">ประเภท</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
              <th className="px-6 py-3 font-medium">แก้ไขล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-slate-50 last:border-0">
                <td className="max-w-md truncate px-6 py-3.5 font-medium text-slate-800">
                  <Link href={`/admin/articles/${post.id}/edit`} className="hover:text-brand-navy">
                    {post.titleTh}
                  </Link>
                </td>
                <td className="px-6 py-3.5">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                    {post.kind === "ARTICLE" ? "article" : "news"}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <StatusBadge status={post.status} />
                </td>
                <td className="px-6 py-3.5 text-slate-400">
                  {formatThaiDate(post.updatedAt.toISOString())}
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  ยังไม่มีบทความ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} totalPages={totalPages} basePath="/admin/articles" />
    </div>
  );
}
