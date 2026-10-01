"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { FolderIcon, GripIcon, TrashIcon, UploadCloudIcon } from "@/components/ui/admin-icons";
import { MediaPickerDialog } from "@/components/admin/MediaPickerDialog";
import { uploadMedia } from "@/lib/upload-client";
import { acceptFor } from "@/lib/media-rules";

export type GalleryImage = { url: string; alt: string };

/** Ordered image gallery with drag-to-reorder (legacy GalleryDragEditor). */
export function GalleryEditor({
  value,
  onChange,
  label = "แกลเลอรีรูปภาพ",
}: {
  value: GalleryImage[];
  onChange: (next: GalleryImage[]) => void;
  label?: string;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const move = (from: number, to: number) => {
    if (from === to) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const upload = async (files: FileList) => {
    setError(null);
    setUploading(true);
    const added: GalleryImage[] = [];
    for (const file of Array.from(files)) {
      try {
        const media = await uploadMedia(file, { allowed: ["image"] });
        added.push({ url: media.url, alt: "" });
      } catch (err) {
        setError(`${file.name}: ${err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ"}`);
      }
    }
    onChange([...value, ...added]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-medium text-slate-700">
          {label} <span className="font-normal text-slate-400">({value.length} รูป — ลากเพื่อเรียงลำดับ)</span>
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            <UploadCloudIcon className="h-3.5 w-3.5" />
            {uploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
          </button>
          <button type="button" onClick={() => setPickerOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <FolderIcon className="h-3.5 w-3.5" />
            เลือกจากคลังสื่อ
          </button>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        multiple
        accept={acceptFor(["image"])}
        className="hidden"
        onChange={(e) => e.target.files?.length && void upload(e.target.files)}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">ยังไม่มีรูปในแกลเลอรี</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((img, i) => (
            <li
              key={`${img.url}-${i}`}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) move(dragIndex, i);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={cn("flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white", dragIndex === i && "opacity-40")}
            >
              <div className="relative aspect-square cursor-grab bg-slate-50 active:cursor-grabbing">
                <Image src={img.url} alt={img.alt} fill className="object-cover" unoptimized />
                <span className="absolute left-1.5 top-1.5 rounded bg-white/90 p-0.5 text-slate-500">
                  <GripIcon className="h-3.5 w-3.5" />
                </span>
                <button
                  type="button"
                  aria-label="นำรูปออก"
                  onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                  className="absolute right-1.5 top-1.5 rounded bg-white/90 p-1 text-red-500 hover:bg-white"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                value={img.alt}
                placeholder="alt text"
                onChange={(e) => onChange(value.map((g, idx) => (idx === i ? { ...g, alt: e.target.value } : g)))}
                className="border-t border-slate-100 px-2 py-1 text-xs outline-none"
              />
            </li>
          ))}
        </ul>
      )}
      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(m) => onChange([...value, { url: m.url, alt: m.altTh ?? "" }])}
      />
    </div>
  );
}
