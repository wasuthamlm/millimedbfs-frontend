"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLinkIcon, PlusIcon, SearchIcon, XCircleIcon } from "@/components/ui/admin-icons";
import { InlineText } from "@/components/admin/list/InlineText";
import { TrashToolbar } from "@/components/admin/list/TrashToolbar";
import { TrashRowMenu } from "@/components/admin/list/TrashRowMenu";
import { StatusSelectPill } from "@/components/admin/StatusSelectPill";
import { landingSlugify } from "@/lib/landing";
import {
  createLandingPage,
  emptyLandingTrash,
  purgeLandingPages,
  renameLandingPage,
  restoreLandingPages,
  setLandingStatus,
  trashLandingPages,
} from "@/app/admin/landing/actions";

type Row = {
  id: string;
  slug: string;
  titleTh: string;
  titleEn: string;
  status: "DRAFT" | "PUBLISHED";
  sectionCount: number;
  updatedAt: string;
};

const inputClass = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-navy";

function NewLandingDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const finalSlug = landingSlugify(slug || title);

  const create = () =>
    startTransition(async () => {
      setError(null);
      const res = await createLandingPage({ titleTh: title, slug });
      if (res.error || !res.id) setError(res.error ?? "สร้างไม่สำเร็จ");
      else router.push(`/admin/landing/${res.id}`);
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="สร้าง Landing Page" className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="font-semibold text-slate-900">สร้าง Landing Page</p>
          <button type="button" onClick={onClose} aria-label="ปิด" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50">
            <XCircleIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-4 p-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">ชื่อหน้า</label>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น แคมเปญสมาชิกใหม่" className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Slug (URL)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="new-member" className={`${inputClass} font-mono`} />
            <p className="mt-1 text-xs text-slate-400">
              URL จะเป็น <span className="font-mono">/lp/{finalSlug || "your-slug"}</span>
            </p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="button"
            disabled={pending || !title.trim()}
            onClick={create}
            className="rounded-lg bg-brand-navy py-2.5 text-sm font-semibold text-white hover:bg-brand-navy/90 disabled:opacity-50"
          >
            {pending ? "กำลังสร้าง..." : "สร้างและเริ่มออกแบบ"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LandingListClient({
  rows,
  inTrash,
  trashCount,
  query,
  canCreate,
  canEdit,
  canPublish,
  canDelete,
}: {
  rows: Row[];
  inTrash: boolean;
  trashCount: number;
  query: string;
  canCreate: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [, startTransition] = useTransition();
  const basePath = "/admin/landing";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <form action={basePath} className="relative w-full max-w-sm">
          {inTrash && <input type="hidden" name="trash" value="1" />}
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input name="q" defaultValue={query} placeholder="ค้นหา Landing Page..." className={`${inputClass} pl-9`} />
        </form>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <TrashToolbar basePath={basePath} inTrash={inTrash} trashCount={trashCount} canDelete={canDelete} onEmpty={emptyLandingTrash} />
          {!inTrash && canCreate && (
            <button
              type="button"
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-navy/90"
            >
              <PlusIcon className="h-4 w-4" />
              สร้าง Landing Page
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
              <th className="px-5 py-3">ชื่อหน้า</th>
              <th className="px-5 py-3">URL</th>
              <th className="px-5 py-3">บล็อก</th>
              <th className="px-5 py-3">สถานะ</th>
              <th className="px-5 py-3">แก้ไขล่าสุด</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                  {inTrash ? "ถังขยะว่างเปล่า" : query ? "ไม่พบ Landing Page ที่ค้นหา" : "ยังไม่มี Landing Page — กด “สร้าง Landing Page”"}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-800">
                      <InlineText value={r.titleTh} disabled={!canEdit || inTrash} onSave={(v) => renameLandingPage(r.id, v)} />
                    </div>
                    {r.titleEn && <div className="text-xs text-slate-400">{r.titleEn}</div>}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/lp/${r.slug}${r.status === "PUBLISHED" ? "" : "?preview=1"}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded bg-slate-50 px-2 py-0.5 font-mono text-xs text-brand-navy hover:underline"
                    >
                      /lp/{r.slug}
                      <ExternalLinkIcon className="h-3 w-3" />
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{r.sectionCount}</td>
                  <td className="px-5 py-3">
                    <StatusSelectPill
                      value={r.status}
                      disabled={!canPublish || inTrash}
                      ariaLabel={`สถานะของ ${r.titleTh}`}
                      colorClass={r.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}
                      options={[
                        { value: "PUBLISHED", label: "Published" },
                        { value: "DRAFT", label: "Draft" },
                      ]}
                      onChange={(value) =>
                        startTransition(async () => {
                          await setLandingStatus([r.id], value);
                          router.refresh();
                        })
                      }
                    />
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400">
                    {new Date(r.updatedAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok", dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="px-5 py-3">
                    <TrashRowMenu
                      id={r.id}
                      editHref={canEdit ? `/admin/landing/${r.id}` : undefined}
                      inTrash={inTrash}
                      canDelete={canDelete}
                      onTrash={trashLandingPages}
                      onRestore={restoreLandingPages}
                      onPurge={purgeLandingPages}
                      noun="Landing Page"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showNew && <NewLandingDialog onClose={() => setShowNew(false)} />}
    </div>
  );
}
