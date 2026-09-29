"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { SearchIcon, UploadCloudIcon, XCircleIcon } from "@/components/ui/admin-icons";
import { MediaPreview } from "@/components/admin/media/MediaPreview";
import { listMediaForPicker, type PickerMedia } from "@/app/admin/media/actions";
import { uploadMedia } from "@/lib/upload-client";
import { acceptFor, type MediaKind } from "@/lib/media-rules";

/**
 * "Choose from media library" dialog (ported from the legacy MediaPickerDialog).
 * Lists existing files with search + folder filter, and can upload new ones
 * in place. Calls onSelect with the chosen file.
 */
export function MediaPickerDialog({
  open,
  onClose,
  onSelect,
  kind = "image",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (media: PickerMedia) => void;
  kind?: MediaKind;
}) {
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [folderId, setFolderId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Results are tagged with the request they answer, so "loading" is derived
  // (no synchronous setState inside the effect).
  const requestKey = JSON.stringify({ query, folderId, kind, page });
  const [result, setResult] = useState<{
    key: string;
    items: PickerMedia[];
    folders: { id: string; name: string }[];
    totalPages: number;
    failed?: boolean;
  } | null>(null);
  const loading = open && result?.key !== requestKey;
  const items = result?.items ?? [];
  const folders = result?.folders ?? [];
  const totalPages = result?.totalPages ?? 1;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listMediaForPicker({ q: query, folderId: folderId || null, kind, page })
      .then((res) => !cancelled && setResult({ key: requestKey, ...res }))
      .catch(() => !cancelled && setResult({ key: requestKey, items: [], folders: [], totalPages: 1, failed: true }));
    return () => {
      cancelled = true;
    };
  }, [open, requestKey, query, folderId, kind, page]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const uploaded = await uploadMedia(file, {
        allowed: [kind],
        folderId: folderId && folderId !== "uncategorized" ? folderId : null,
      });
      onSelect({
        id: uploaded.id,
        url: uploaded.url,
        filename: file.name,
        mimeType: file.type,
        altTh: null,
        width: null,
        height: null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="เลือกไฟล์จากคลังสื่อ"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">เลือกจากคลังสื่อ</h2>
          <button type="button" onClick={onClose} aria-label="ปิด" className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  setQuery(q);
                }
              }}
              placeholder="ค้นหาชื่อไฟล์... (Enter)"
              className="w-full rounded-full border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-navy"
            />
          </div>
          <select
            value={folderId}
            onChange={(e) => {
              setPage(1);
              setFolderId(e.target.value);
            }}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">ทุกโฟลเดอร์</option>
            <option value="uncategorized">ยังไม่จัดหมวด</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            <UploadCloudIcon className="h-4 w-4" />
            {uploading ? "กำลังอัปโหลด..." : "อัปโหลดใหม่"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={acceptFor([kind])}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
            }}
          />
        </div>
        {(error || result?.failed) && (
          <p className="px-5 pt-3 text-xs text-red-600">{error ?? "โหลดคลังสื่อไม่สำเร็จ"}</p>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="py-12 text-center text-sm text-slate-400">กำลังโหลด...</p>
          ) : items.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">ไม่พบไฟล์</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="group flex flex-col overflow-hidden rounded-xl border border-slate-100 text-left transition-shadow hover:border-brand-navy hover:shadow-md"
                  title={item.filename}
                >
                  <div className="relative aspect-square bg-slate-50">
                    <MediaPreview url={item.url} mimeType={item.mimeType} alt={item.altTh ?? item.filename} />
                  </div>
                  <span className="truncate px-2 py-1.5 text-xs text-slate-600">{item.filename}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm">
            <span className="text-slate-500">
              หน้า {page} จาก {totalPages}
            </span>
            <div className="flex gap-2">
              {[
                { label: "ก่อนหน้า", to: page - 1, disabled: page <= 1 },
                { label: "ถัดไป", to: page + 1, disabled: page >= totalPages },
              ].map((b) => (
                <button
                  key={b.label}
                  type="button"
                  disabled={b.disabled}
                  onClick={() => setPage(b.to)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5",
                    b.disabled ? "border-slate-100 text-slate-300" : "border-slate-200 text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
