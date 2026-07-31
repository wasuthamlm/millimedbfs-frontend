import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { GlobeIcon, PlusIcon, TrashIcon, PencilIcon, SearchIcon } from "@/components/ui/admin-icons";
import { adminPages } from "@/data/admin-pages";

export default function PageManagerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader icon={GlobeIcon} title={`Page Manager (${adminPages.length} หน้า)`} />
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark"
          >
            <PlusIcon className="h-4 w-4" />
            สร้างหน้าใหม่
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <TrashIcon className="h-4 w-4" />
            ถังขยะ
          </button>
        </div>
      </div>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search pages..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-brand-navy"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">หน้าเว็บ</th>
              <th className="px-6 py-3 font-medium">Slug</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
              <th className="px-6 py-3 font-medium">SEO</th>
              <th className="px-6 py-3 font-medium">เซกชัน</th>
              <th className="px-6 py-3 font-medium text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {adminPages.map((page) => (
              <tr key={page.id} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-3.5">
                  <p className="font-semibold text-slate-800">{page.titleTh}</p>
                  <p className="text-xs text-slate-400">{page.titleEn}</p>
                </td>
                <td className="px-6 py-3.5">
                  <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{page.slug}</code>
                </td>
                <td className="px-6 py-3.5">
                  <StatusBadge status={page.status} />
                </td>
                <td className="px-6 py-3.5">
                  <span
                    className={
                      page.seo >= 40
                        ? "rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                        : "rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600"
                    }
                  >
                    {page.seo}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-slate-500">{page.sectionsCount} เซกชัน</td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/pages/${page.slug}`}
                      aria-label={`แก้ไข ${page.titleTh}`}
                      className="text-brand-navy hover:text-brand-gold-dark"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      aria-label={`ลบ ${page.titleTh}`}
                      className="text-red-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
