"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FolderIcon, ImageIcon, TrashIcon, UploadCloudIcon } from "@/components/ui/admin-icons";
import { MediaPickerDialog } from "@/components/admin/MediaPickerDialog";
import { MediaPreview } from "@/components/admin/media/MediaPreview";
import { uploadMedia } from "@/lib/upload-client";
import { acceptFor, type MediaKind } from "@/lib/media-rules";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

const KIND_TEXT: Record<MediaKind, { noun: string; mime: string }> = {
  image: { noun: "รูปภาพ", mime: "image/jpeg" },
  video: { noun: "วิดีโอ", mime: "video/mp4" },
  document: { noun: "ไฟล์ PDF", mime: "application/pdf" },
};

/**
 * Single media field: upload a new file, pick one from the media library, or
 * paste a URL. The value is the file's public URL.
 */
export function ImageUploader({
  value,
  onChange,
  label = "รูปภาพ",
  kind = "image",
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  kind?: MediaKind;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const text = KIND_TEXT[kind];

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const media = await uploadMedia(file, { allowed: [kind] });
      onChange(media.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>

      <div className="flex items-start gap-4">
        <div
          className={cn(
            "relative flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50",
            value && "border-solid",
          )}
        >
          {value ? (
            <MediaPreview url={value} mimeType={text.mime} alt="" />
          ) : (
            <ImageIcon className="h-6 w-6 text-slate-300" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              <UploadCloudIcon className="h-4 w-4" />
              {uploading ? "กำลังอัปโหลด..." : `อัปโหลด${text.noun}`}
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <FolderIcon className="h-4 w-4" />
              เลือกจากคลังสื่อ
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
                ลบ
              </button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={acceptFor([kind])}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <input
            className={inputClass}
            placeholder={`หรือวาง URL ${text.noun}ที่นี่`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {hint && <p className="text-xs text-slate-400">{hint}</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>

      <MediaPickerDialog open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(m) => onChange(m.url)} kind={kind} />
    </div>
  );
}
