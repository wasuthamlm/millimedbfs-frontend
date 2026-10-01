import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pager } from "@/components/admin/Pager";
import { Share2Icon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "การแนะนำ" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

/**
 * Overview of the related-articles / related-products each post recommends.
 * Editing happens in the article form ("เนื้อหาที่เกี่ยวข้อง").
 */
export default async function RecommendationsPage({ searchParams }: PageProps<"/admin/recommendations">) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const filter = sp.filter === "set" || sp.filter === "unset" ? sp.filter : "all";

  const where =
    filter === "set"
      ? { deletedAt: null, OR: [{ relatedPostIds: { isEmpty: false } }, { relatedProductIds: { isEmpty: false } }] }
      : filter === "unset"
        ? { deletedAt: null, relatedPostIds: { isEmpty: true }, relatedProductIds: { isEmpty: true } }
        : { deletedAt: null };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      select: { id: true, titleTh: true, status: true, relatedPostIds: true, relatedProductIds: true, articleCategory: { select: { nameTh: true } } },
    }),
    prisma.post.count({ where }),
  ]);

  const postIds = [...new Set(posts.flatMap((p) => p.relatedPostIds))];
  const productIds = [...new Set(posts.flatMap((p) => p.relatedProductIds))];
  const [relPosts, relProducts] = await Promise.all([
    prisma.post.findMany({ where: { id: { in: postIds } }, select: { id: true, titleTh: true } }),
    prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, nameTh: true } }),
  ]);
  const postName = new Map(relPosts.map((p) => [p.id, p.titleTh]));
  const productName = new Map(relProducts.map((p) => [p.id, p.nameTh]));

  const tab = (key: string, label: string) => (
    <Link
      href={key === "all" ? "/admin/recommendations" : `/admin/recommendations?filter=${key}`}
      className={`rounded-full px-4 py-1.5 text-sm font-medium ${filter === key ? "bg-brand-navy text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Share2Icon}
        title="การแนะนำ"
        subtitle="บทความและสินค้าที่แต่ละบทความแนะนำต่อ — แก้ไขได้ในหน้าแก้ไขบทความ หัวข้อ “เนื้อหาที่เกี่ยวข้อง”"
      />
      <div className="flex gap-2">
        {tab("all", "ทั้งหมด")}
        {tab("set", "กำหนดแล้ว")}
        {tab("unset", "ใช้ค่าอัตโนมัติ")}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 font-medium">บทความ</th>
              <th className="px-5 py-3 font-medium">บทความที่แนะนำ</th>
              <th className="px-5 py-3 font-medium">สินค้าที่แนะนำ</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 align-top last:border-0">
                <td className="max-w-xs px-5 py-3">
                  <Link href={`/admin/articles/${p.id}/edit`} className="font-medium text-slate-800 hover:text-brand-navy">
                    {p.titleTh}
                  </Link>
                  <p className="text-xs text-slate-400">
                    {p.articleCategory?.nameTh ?? "ไม่ระบุประเภท"} · {p.status}
                  </p>
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {p.relatedPostIds.length ? (
                    <ul className="list-disc pl-4">
                      {p.relatedPostIds.map((id) => (
                        <li key={id}>{postName.get(id) ?? "(ถูกลบแล้ว)"}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-slate-400">อัตโนมัติ: 3 บทความล่าสุดในประเภทเดียวกัน</span>
                  )}
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {p.relatedProductIds.length ? (
                    <ul className="list-disc pl-4">
                      {p.relatedProductIds.map((id) => (
                        <li key={id}>{productName.get(id) ?? "(ถูกลบแล้ว)"}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))} basePath="/admin/recommendations" extraParams={{ filter: filter === "all" ? undefined : filter }} />
    </div>
  );
}
