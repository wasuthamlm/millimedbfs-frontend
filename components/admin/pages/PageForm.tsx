"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SaveButton } from "@/components/admin/SaveButton";
import { slugify } from "@/lib/slugify";
import { createPage, type PageFormInput } from "@/app/admin/pages/actions";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export function PageForm() {
  const router = useRouter();
  const [status, setStatus] = useState<PageFormInput["status"]>("DRAFT");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [titleTh, setTitleTh] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (value: string) => {
    setTitleTh(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSave = async () => {
    setError(null);
    const result = await createPage({ status, slug, titleTh, titleEn });
    if (result.error) {
      setError(result.error);
      throw new Error(result.error);
    }
    router.push(`/admin/pages/${slug}`);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:grid-cols-2">
        <div>
          <label className={labelClass}>สถานะ</label>
          <select
            className={inputClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as PageFormInput["status"])}
          >
            <option value="DRAFT">ฉบับร่าง</option>
            <option value="PUBLISHED">เผยแพร่แล้ว</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>สลัก (URL)</label>
          <input
            className={inputClass}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>ชื่อหน้า (ไทย)</label>
          <input
            className={inputClass}
            value={titleTh}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>ชื่อหน้า (อังกฤษ)</label>
          <input className={inputClass} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
        </div>
      </div>

      <div>
        <SaveButton label="สร้างหน้า" onSave={handleSave} />
      </div>
    </div>
  );
}
