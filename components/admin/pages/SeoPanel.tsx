"use client";

import { useMemo, useState } from "react";
import { SaveButton } from "@/components/admin/SaveButton";
import { SeoScorePanel } from "@/components/admin/seo/SeoScorePanel";
import { setPageSeo } from "@/app/admin/pages/actions";
import { calculateSeoAeoGeo, pageToScoreInput } from "@/lib/seo-score";
import { SITE_URL } from "@/lib/site";

export function SeoPanel({
  pageId,
  slug,
  titleTh,
  titleEn,
  sections,
  initialSeoTitle,
  initialSeoDesc,
  initialSeoTitleEn,
  initialSeoDescEn,
  initialSeoNoIndex,
}: {
  pageId: string;
  slug: string;
  titleTh: string;
  titleEn: string;
  sections: { titleTh: string; imageUrl?: string; bodyTh?: string }[];
  initialSeoTitle: string;
  initialSeoDesc: string;
  initialSeoTitleEn: string;
  initialSeoDescEn: string;
  initialSeoNoIndex: boolean;
}) {
  const [seoTitle, setSeoTitle] = useState(initialSeoTitle);
  const [seoDesc, setSeoDesc] = useState(initialSeoDesc);
  const [seoTitleEn, setSeoTitleEn] = useState(initialSeoTitleEn);
  const [seoDescEn, setSeoDescEn] = useState(initialSeoDescEn);
  const [seoNoIndex, setSeoNoIndex] = useState(initialSeoNoIndex);

  const result = useMemo(
    () =>
      calculateSeoAeoGeo(
        pageToScoreInput({
          titleTh,
          titleEn,
          seoTitle,
          seoTitleEn,
          seoDesc,
          seoDescEn,
          slug,
          sections,
        }),
      ),
    [titleTh, titleEn, seoTitle, seoTitleEn, seoDesc, seoDescEn, slug, sections],
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <SeoScorePanel result={result} />

      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Meta Title (TH)</label>
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
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Meta Description (TH)</label>
        <textarea
          value={seoDesc}
          onChange={(e) => setSeoDesc(e.target.value)}
          maxLength={160}
          rows={4}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
        />
        <p className="mt-1 text-xs text-slate-400">{seoDesc.length}/160 ตัวอักษร</p>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Meta Title (EN)</label>
        <input
          type="text"
          value={seoTitleEn}
          onChange={(e) => setSeoTitleEn(e.target.value)}
          maxLength={60}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Meta Description (EN)</label>
        <textarea
          value={seoDescEn}
          onChange={(e) => setSeoDescEn(e.target.value)}
          maxLength={160}
          rows={4}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold text-slate-600">Advanced SEO</p>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={seoNoIndex} onChange={(e) => setSeoNoIndex(e.target.checked)} />
          ซ่อนหน้านี้จาก Google (no_index)
        </label>
        <p className="text-xs text-slate-400">เปิดเมื่อไม่ต้องการให้ Search Engine เก็บหน้านี้เข้าดัชนี</p>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="mb-1 text-xs font-medium text-slate-500">Canonical URL</p>
        <p className="truncate text-sm text-slate-600">{`${SITE_URL}${slug === "home" ? "/" : `/${slug}`}`}</p>
      </div>

      <div className="flex justify-end">
        <SaveButton
          onSave={() =>
            setPageSeo(pageId, { seoTitle, seoDesc, seoTitleEn, seoDescEn, seoNoIndex }).then(() => {})
          }
        />
      </div>
    </div>
  );
}
