"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageIcon, TrashIcon } from "@/components/ui/admin-icons";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

export function ImageUploader({
  value,
  onChange,
  label = "รูปภาพ",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "อัปโหลดไม่สำเร็จ");
        return;
      }
      onChange(data.url);
    } catch {
      setError("อัปโหลดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
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
            value && "border-solid"
          )}
        >
          {value ? (
            <Image src={value} alt="" fill className="object-cover" unoptimized />
          ) : (
            <ImageIcon className="h-6 w-6 text-slate-300" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพ"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
                ลบรูปภาพ
              </button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <input
            className={inputClass}
            placeholder="หรือวาง URL รูปภาพที่นี่"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
