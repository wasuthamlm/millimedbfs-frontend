"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CopyIcon, TrashIcon, XCircleIcon } from "@/components/ui/admin-icons";
import { MediaPreview } from "@/components/admin/media/MediaPreview";
import { updateMediaMeta } from "@/app/admin/media/actions";

export type MediaDetail = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  altTh: string | null;
  altEn: string | null;
  captionTh: string | null;
  captionEn: string | null;
  usedIn: string[];
  createdAt: string;
};

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

function formatSize(bytes: number) {
  if (!bytes) return "-";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Side panel for one media file: preview, rename, alt/caption (TH/EN), usage, copy/delete. */
export function MediaDetailPanel({
  item,
  onClose,
  onDelete,
  canDelete,
}: {
  item: MediaDetail;
  onClose: () => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    filename: item.filename,
    altTh: item.altTh ?? "",
    altEn: item.altEn ?? "",
    captionTh: item.captionTh ?? "",
    captionEn: item.captionEn ?? "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const save = () =>
    startTransition(async () => {
      const res = await updateMediaMeta(item.id, form);
      setMessage(res.error ?? "บันทึกแล้ว");
      if (!res.error) router.refresh();
    });

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        aria-label="รายละเอียดไฟล์"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="truncate text-base font-bold text-slate-900">{item.filename}</h2>
          <button type="button" onClick={onClose} aria-label="ปิด" className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="relative aspect-video bg-slate-100">
          <MediaPreview url={item.url} mimeType={item.mimeType} alt={item.altTh ?? item.filename} controls />
        </div>

        <div className="flex flex-col gap-4 p-5">
          <dl className="grid grid-cols-2 gap-2 text-xs text-slate-500">
            <dt>ประเภท</dt>
            <dd className="text-slate-700">{item.mimeType}</dd>
            <dt>ขนาดไฟล์</dt>
            <dd className="text-slate-700">{formatSize(item.size)}</dd>
            {item.width && item.height && (
              <>
                <dt>ขนาดภาพ</dt>
                <dd className="text-slate-700">
                  {item.width} × {item.height}px
                </dd>
              </>
            )}
            <dt>อัปโหลดเมื่อ</dt>
            <dd className="text-slate-700">{new Date(item.createdAt).toLocaleString("th-TH")}</dd>
          </dl>

          <div>
            <p className="mb-1 text-xs font-semibold text-slate-600">ใช้งานอยู่ที่</p>
            {item.usedIn.length ? (
              <ul className="list-disc pl-5 text-xs text-slate-600">
                {item.usedIn.map((place) => (
                  <li key={place}>{place}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">ยังไม่ได้ใช้</p>
            )}
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            ชื่อไฟล์
            <input className={inputClass} value={form.filename} onChange={(e) => set("filename", e.target.value)} />
          </label>
          {item.mimeType.startsWith("image/") && (
            <>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Alt text (ไทย)
                <input className={inputClass} value={form.altTh} onChange={(e) => set("altTh", e.target.value)} />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Alt text (English)
                <input className={inputClass} value={form.altEn} onChange={(e) => set("altEn", e.target.value)} />
              </label>
            </>
          )}
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            คำบรรยาย (ไทย)
            <textarea rows={2} className={inputClass} value={form.captionTh} onChange={(e) => set("captionTh", e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            คำบรรยาย (English)
            <textarea rows={2} className={inputClass} value={form.captionEn} onChange={(e) => set("captionEn", e.target.value)} />
          </label>

          {message && <p className="text-xs text-slate-500">{message}</p>}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={save}
              className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button
              type="button"
              onClick={() => void navigator.clipboard.writeText(item.url).then(() => setMessage("คัดลอก URL แล้ว"))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <CopyIcon className="h-4 w-4" />
              Copy URL
            </button>
            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
                ลบไฟล์
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
