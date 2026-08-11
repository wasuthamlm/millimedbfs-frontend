"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, XCircleIcon } from "@/components/ui/admin-icons";
import { SaveButton } from "@/components/admin/SaveButton";
import { Toggle } from "@/components/admin/Toggle";
import type { Banner } from "@/data/admin-banners";
import { saveBanners } from "@/app/admin/site/banners/actions";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-navy";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-500";

function BannerImagePicker({ image, onChange }: { image: string; onChange: (url: string) => void }) {
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
    <div>
      <label className={labelClass}>Banner Image (แนะนำ: 1920x800px)</label>
      <div className="flex items-start gap-4">
        <div className="relative h-24 w-44 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {image ? (
            <>
              <Image src={image} alt="" fill className="object-cover" unoptimized />
              <button
                type="button"
                aria-label="ลบรูปภาพ"
                onClick={() => onChange("")}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
              >
                <XCircleIcon className="h-3 w-3" />
              </button>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-300">ไม่มีรูปภาพ</div>
          )}
        </div>
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-full bg-brand-gold px-5 py-2 text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-gold-dark disabled:opacity-60"
        >
          {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพ"}
        </button>
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
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function BannersManager({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);

  const move = (index: number, direction: -1 | 1) => {
    setBanners((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((b, i) => ({ ...b, order: i + 1 }));
    });
  };

  const update = (id: string, patch: Partial<Banner>) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const remove = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  const add = () => {
    setBanners((prev) => [
      ...prev,
      {
        id: `b${Date.now()}`,
        titleTh: "",
        titleEn: "",
        altTextTh: "",
        altTextEn: "",
        captionTh: "",
        captionEn: "",
        image: "",
        link: "",
        order: prev.length + 1,
        active: true,
      },
    ]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">รายการแบนเนอร์</h2>

        <div className="flex flex-col gap-4">
          {banners.map((banner, index) => (
            <div key={banner.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Banner {index + 1}</span>
                <button
                  type="button"
                  onClick={() => remove(banner.id)}
                  className="text-sm font-medium text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelClass}>Type</label>
                  <select disabled className={`${inputClass} bg-slate-50 text-slate-500`} value="image">
                    <option value="image">รูปภาพ</option>
                  </select>
                </div>

                <BannerImagePicker image={banner.image} onChange={(url) => update(banner.id, { image: url })} />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Alt Text (TH)</label>
                    <input
                      className={inputClass}
                      value={banner.altTextTh}
                      onChange={(e) => update(banner.id, { altTextTh: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Alt Text (EN)</label>
                    <input
                      className={inputClass}
                      value={banner.altTextEn}
                      onChange={(e) => update(banner.id, { altTextEn: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Title (TH)</label>
                    <input
                      className={inputClass}
                      value={banner.titleTh}
                      onChange={(e) => update(banner.id, { titleTh: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Title (EN)</label>
                    <input
                      className={inputClass}
                      value={banner.titleEn}
                      onChange={(e) => update(banner.id, { titleEn: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Caption (TH)</label>
                    <input
                      className={inputClass}
                      value={banner.captionTh}
                      onChange={(e) => update(banner.id, { captionTh: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Caption (EN)</label>
                    <input
                      className={inputClass}
                      value={banner.captionEn}
                      onChange={(e) => update(banner.id, { captionEn: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Link URL (optional)</label>
                  <input
                    className={inputClass}
                    value={banner.link}
                    onChange={(e) => update(banner.id, { link: e.target.value })}
                    placeholder="พิมพ์ชื่อหน้า เช่น /about หรือเลือกจากรายการ"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={banner.active}
                      onChange={(v) => update(banner.id, { active: v })}
                      label="เปิดใช้งาน Banner"
                    />
                    <span className="text-sm text-slate-500">{banner.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="เลื่อนขึ้น"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="เลื่อนลง"
                      disabled={index === banners.length - 1}
                      onClick={() => move(index, 1)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowDownIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="ลบ Banner"
                      onClick={() => remove(banner.id)}
                      className="rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={add}
          className="mt-4 flex w-full items-center justify-center rounded-lg border border-dashed border-slate-300 py-3 text-sm font-medium text-brand-navy transition-colors hover:bg-slate-50"
        >
          <PlusIcon className="mr-1.5 h-4 w-4" />
          Add Banner
        </button>
      </div>

      <div className="flex justify-end">
        <SaveButton onSave={() => saveBanners(banners)} />
      </div>
    </div>
  );
}
