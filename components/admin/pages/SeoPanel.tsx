"use client";

import { useState } from "react";
import { SaveButton } from "@/components/admin/SaveButton";
import { setPageSeo } from "@/app/admin/pages/actions";

export function SeoPanel({
  pageId,
  initialSeoTitle,
  initialSeoDesc,
}: {
  pageId: string;
  initialSeoTitle: string;
  initialSeoDesc: string;
}) {
  const [seoTitle, setSeoTitle] = useState(initialSeoTitle);
  const [seoDesc, setSeoDesc] = useState(initialSeoDesc);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Meta Title</label>
        <input
          type="text"
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          maxLength={60}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
        />
        <p className="mt-1 text-xs text-slate-400">{seoTitle.length}/60 ตัวอักษร</p>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Meta Description</label>
        <textarea
          value={seoDesc}
          onChange={(e) => setSeoDesc(e.target.value)}
          maxLength={160}
          rows={4}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
        />
        <p className="mt-1 text-xs text-slate-400">{seoDesc.length}/160 ตัวอักษร</p>
      </div>
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
        ตอนนี้รองรับเฉพาะ SEO (meta title/description) — การวิเคราะห์ AEO/GEO ยังไม่เปิดใช้งาน
      </p>
      <div className="flex justify-end">
        <SaveButton onSave={() => setPageSeo(pageId, seoTitle, seoDesc).then(() => {})} />
      </div>
    </div>
  );
}
