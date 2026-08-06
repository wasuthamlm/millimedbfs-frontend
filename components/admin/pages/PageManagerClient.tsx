"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusSelectPill } from "@/components/admin/StatusSelectPill";
import { SeoScoreBadge } from "@/components/admin/articles/SeoScoreBadge";
import { GlobeIcon, PlusIcon, ArchiveIcon, PencilIcon, TrashIcon, SearchIcon } from "@/components/ui/admin-icons";
import { setPageStatus, archivePages, restorePages, deletePage } from "@/app/admin/pages/actions";

type PageRow = {
  id: string;
  slug: string;
  titleTh: string;
  titleEn: string | null;
  status: "DRAFT" | "PUBLISHED";
  sectionsCount: number;
  seoScore: number;
};

export function PageManagerClient({
  pages,
  activeCount,
  archivedCount,
  showTrash,
}: {
  pages: PageRow[];
  activeCount: number;
  archivedCount: number;
  showTrash: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) =>
        p.titleTh.toLowerCase().includes(q) ||
        p.titleEn?.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q),
    );
  }, [pages, search]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((p) => p.id))));
  };

  const handleArchive = async (ids: string[]) => {
    if (ids.length === 0) return;
    if (!window.confirm(`ย้ายหน้า ${ids.length} รายการไปถังขยะใช่หรือไม่?`)) return;
    await archivePages(ids);
    setSelected(new Set());
    router.refresh();
  };

  const handleRestore = async (ids: string[]) => {
    if (ids.length === 0) return;
    await restorePages(ids);
    setSelected(new Set());
    router.refresh();
  };

  const handlePermanentDelete = async (id: string, titleTh: string) => {
    if (!window.confirm(`ลบหน้า "${titleTh}" อย่างถาวร ไม่สามารถกู้คืนได้ ใช่หรือไม่?`)) return;
    await deletePage(id);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          icon={GlobeIcon}
          title={showTrash ? `ถังขยะ (${archivedCount} หน้า)` : `Page Manager (${activeCount} หน้า)`}
        />
        <div className="flex items-center gap-2">
          {showTrash ? (
            <Link
              href="/admin/pages"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              กลับไป Page Manager
            </Link>
          ) : (
            <>
              <Link
                href="/admin/pages?trash=1"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <ArchiveIcon className="h-4 w-4" />
                ถังขยะ{archivedCount > 0 ? ` (${archivedCount})` : ""}
              </Link>
              <Link
                href="/admin/pages/new"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark"
              >
                <PlusIcon className="h-4 w-4" />
                สร้างหน้าใหม่
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
        />
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
          <span className="text-sm text-slate-500">เลือกแล้ว {selected.size} รายการ</span>
          {showTrash ? (
            <button
              type="button"
              onClick={() => void handleRestore(Array.from(selected))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              กู้คืน
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleArchive(Array.from(selected))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <ArchiveIcon className="h-4 w-4" />
              ย้ายไปถังขยะ
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
              <th className="w-10 px-6 py-3">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 text-brand-navy focus:ring-brand-navy"
                />
              </th>
              <th className="px-6 py-3 font-medium">หน้าเว็บ</th>
              <th className="px-6 py-3 font-medium">SLUG</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
              <th className="px-6 py-3 font-medium">SEO</th>
              <th className="px-6 py-3 font-medium">เซกชัน</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((page) => (
              <tr key={page.id} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-3.5">
                  <input
                    type="checkbox"
                    checked={selected.has(page.id)}
                    onChange={() => toggleSelect(page.id)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-navy focus:ring-brand-navy"
                  />
                </td>
                <td className="px-6 py-3.5">
                  <p className="font-semibold text-slate-800">{page.titleTh}</p>
                  {page.titleEn && <p className="text-xs text-slate-400">{page.titleEn}</p>}
                </td>
                <td className="px-6 py-3.5">
                  <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{page.slug}</code>
                </td>
                <td className="px-6 py-3.5">
                  <StatusSelectPill
                    value={page.status}
                    disabled={showTrash}
                    ariaLabel={`สถานะของ ${page.titleTh}`}
                    colorClass={
                      page.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }
                    options={[
                      { value: "PUBLISHED", label: "published" },
                      { value: "DRAFT", label: "draft" },
                    ]}
                    onChange={(value) => {
                      void setPageStatus(page.id, value).then(() => router.refresh());
                    }}
                  />
                </td>
                <td className="px-6 py-3.5">
                  <SeoScoreBadge score={page.seoScore} />
                </td>
                <td className="px-6 py-3.5 text-slate-500">{page.sectionsCount} เซกชัน</td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center justify-end gap-3">
                    {showTrash ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleRestore([page.id])}
                          aria-label={`กู้คืน ${page.titleTh}`}
                          className="text-brand-navy hover:text-brand-gold-dark"
                        >
                          <ArchiveIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handlePermanentDelete(page.id, page.titleTh)}
                          aria-label={`ลบถาวร ${page.titleTh}`}
                          className="text-red-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/admin/pages/${page.slug}`}
                          aria-label={`แก้ไข ${page.titleTh}`}
                          className="text-brand-navy hover:text-brand-gold-dark"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleArchive([page.id])}
                          aria-label={`ย้ายไปถังขยะ ${page.titleTh}`}
                          className="text-red-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  {showTrash ? "ถังขยะว่างเปล่า" : "ไม่พบหน้าเว็บที่ตรงกับเงื่อนไข"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
