import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DeletePageButton } from "@/components/admin/pages/DeletePageButton";
import { GlobeIcon, PlusIcon, PencilIcon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PageManagerPage() {
  const pages = await prisma.page.findMany({
    include: { _count: { select: { sections: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader icon={GlobeIcon} title={`Page Manager (${pages.length} หน้า)`} />
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark"
        >
          <PlusIcon className="h-4 w-4" />
          สร้างหน้าใหม่
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">หน้าเว็บ</th>
              <th className="px-6 py-3 font-medium">Slug</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
              <th className="px-6 py-3 font-medium">เซกชัน</th>
              <th className="px-6 py-3 font-medium text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-3.5">
                  <p className="font-semibold text-slate-800">{page.titleTh}</p>
                  {page.titleEn && <p className="text-xs text-slate-400">{page.titleEn}</p>}
                </td>
                <td className="px-6 py-3.5">
                  <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {page.slug}
                  </code>
                </td>
                <td className="px-6 py-3.5">
                  <StatusBadge status={page.status} />
                </td>
                <td className="px-6 py-3.5 text-slate-500">{page._count.sections} เซกชัน</td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/pages/${page.slug}`}
                      aria-label={`แก้ไข ${page.titleTh}`}
                      className="text-brand-navy hover:text-brand-gold-dark"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <DeletePageButton id={page.id} titleTh={page.titleTh} />
                  </div>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  ยังไม่มีหน้าเว็บ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
