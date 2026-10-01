"use client";

import { useMemo, useState, useTransition } from "react";
import { SaveButton } from "@/components/admin/SaveButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { SeoScorePanel } from "@/components/admin/seo/SeoScorePanel";
import { SparklesIcon } from "@/components/ui/admin-icons";
import { setPageSeo, type PageSeoInput } from "@/app/admin/pages/actions";
import { aiSuggestSeo } from "@/app/admin/ai/actions";
import { calculateSeoAeoGeo, pageToScoreInput } from "@/lib/seo-score";
import { SITE_URL } from "@/lib/site";

const inputClass = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-500";

/** Page-level SEO / AEO / GEO, social and advanced settings (legacy PageSeoPanel + AdvancedSeoPanel + PageHeaderStylePanel). */
export function SeoPanel({
  pageId,
  slug,
  titleTh,
  titleEn,
  sections,
  initial,
}: {
  pageId: string;
  slug: string;
  titleTh: string;
  titleEn: string;
  sections: { titleTh: string; imageUrl?: string; bodyTh?: string }[];
  initial: PageSeoInput;
}) {
  const [form, setForm] = useState<PageSeoInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const [aiPending, startAi] = useTransition();
  const set = <K extends keyof PageSeoInput>(k: K, v: PageSeoInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const path = slug === "home" ? "/" : `/${slug}`;
  const bodyHtml = sections.map((s) => `${s.titleTh ? `<h2>${s.titleTh}</h2>` : ""}${s.bodyTh ?? ""}`).join("");

  const result = useMemo(
    () =>
      calculateSeoAeoGeo(
        pageToScoreInput({
          titleTh,
          titleEn,
          seoTitle: form.seoTitle,
          seoTitleEn: form.seoTitleEn,
          seoDesc: form.seoDesc,
          seoDescEn: form.seoDescEn,
          slug,
          sections,
        }),
      ),
    [titleTh, titleEn, form.seoTitle, form.seoTitleEn, form.seoDesc, form.seoDescEn, slug, sections],
  );

  const suggest = () =>
    startAi(async () => {
      setError(null);
      const res = await aiSuggestSeo({ title: titleTh, body: bodyHtml });
      if (res.error || !res.data) {
        setError(res.error ?? "AI ทำงานไม่สำเร็จ");
        return;
      }
      setForm((f) => ({ ...f, seoTitle: res.data.seoTitle, seoDesc: res.data.seoDesc, seoTitleEn: res.data.seoTitleEn, seoDescEn: res.data.seoDescEn }));
    });

  const text = (key: keyof PageSeoInput, label: string, max?: number, rows?: number) => {
    const value = form[key] as string;
    return (
      <div>
        <label className={labelClass}>{label}</label>
        {rows ? (
          <textarea rows={rows} className={inputClass} value={value} onChange={(e) => set(key, e.target.value as never)} />
        ) : (
          <input className={inputClass} value={value} onChange={(e) => set(key, e.target.value as never)} />
        )}
        {max && <p className={`mt-1 text-xs ${value.length > max ? "text-red-500" : "text-slate-400"}`}>{value.length}/{max} ตัวอักษร</p>}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <SeoScorePanel result={result} />

      <button
        type="button"
        onClick={suggest}
        disabled={aiPending}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
      >
        <SparklesIcon className="h-3.5 w-3.5" />
        {aiPending ? "AI กำลังคิด..." : "แนะนำ Meta ด้วย AI"}
      </button>

      {text("seoTitle", "Meta Title (TH)", 60)}
      {text("seoDesc", "Meta Description (TH)", 155, 3)}
      {text("seoTitleEn", "Meta Title (EN)", 60)}
      {text("seoDescEn", "Meta Description (EN)", 155, 3)}

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold text-slate-600">การแชร์บนโซเชียล (Open Graph)</p>
        {text("ogTitle", "OG Title (TH)")}
        {text("ogDesc", "OG Description (TH)", undefined, 2)}
        {text("ogTitleEn", "OG Title (EN)")}
        {text("ogDescEn", "OG Description (EN)", undefined, 2)}
        <ImageUploader label="OG Image (1200×630)" value={form.ogImageUrl} onChange={(url) => set("ogImageUrl", url)} />
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold text-slate-600">ส่วนหัวหน้า (Page Hero)</p>
        <div>
          <label className={labelClass}>รูปแบบ</label>
          <select className={inputClass} value={form.heroStyle} onChange={(e) => set("heroStyle", e.target.value)}>
            <option value="">ตามค่าเริ่มต้นของเว็บไซต์</option>
            <option value="none">ไม่แสดงส่วนหัว</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>จัดตำแหน่งหัวข้อ</label>
          <select className={inputClass} value={form.heroAlignment} onChange={(e) => set("heroAlignment", e.target.value)}>
            <option value="">ตามค่าเริ่มต้น</option>
            <option value="left">ซ้าย</option>
            <option value="center">กลาง</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold text-slate-600">Advanced SEO</p>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.seoNoIndex} onChange={(e) => set("seoNoIndex", e.target.checked)} />
          ซ่อนหน้านี้จาก Google (noindex)
        </label>
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input type="checkbox" className="mt-1" checked={form.marketingEligible} onChange={(e) => set("marketingEligible", e.target.checked)} />
          อนุญาตให้ Meta / TikTok Pixel ทำงานบนหน้านี้
        </label>
        <div>
          <label className={labelClass}>Canonical URL</label>
          <input className={inputClass} value={form.canonicalUrl} onChange={(e) => set("canonicalUrl", e.target.value)} placeholder={`${SITE_URL}${path}`} />
        </div>
        <div>
          <label className={labelClass}>Custom JSON-LD (Schema.org)</label>
          <textarea
            rows={5}
            className={`${inputClass} font-mono text-xs`}
            value={form.schemaCustom}
            onChange={(e) => set("schemaCustom", e.target.value)}
            placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "AboutPage"\n}'}
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex justify-end">
        <SaveButton
          onSave={async () => {
            setError(null);
            const res = await setPageSeo(pageId, form);
            if (res.error) {
              setError(res.error);
              throw new Error(res.error);
            }
          }}
        />
      </div>
    </div>
  );
}
