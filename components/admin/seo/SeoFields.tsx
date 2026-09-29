"use client";

import { useState, useTransition } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { SparklesIcon } from "@/components/ui/admin-icons";
import { aiSuggestSeo } from "@/app/admin/ai/actions";
import { SITE_URL } from "@/lib/site";

export type SeoValue = {
  focusKeyword: string;
  secondaryKeywords: string[];
  seoTitle: string;
  seoTitleEn: string;
  seoDesc: string;
  seoDescEn: string;
  ogTitle: string;
  ogTitleEn: string;
  ogDesc: string;
  ogDescEn: string;
  ogImageUrl: string;
  canonicalUrl: string;
  seoNoIndex: boolean;
  marketingEligible: boolean;
};

export const EMPTY_SEO: SeoValue = {
  focusKeyword: "",
  secondaryKeywords: [],
  seoTitle: "",
  seoTitleEn: "",
  seoDesc: "",
  seoDescEn: "",
  ogTitle: "",
  ogTitleEn: "",
  ogDesc: "",
  ogDescEn: "",
  ogImageUrl: "",
  canonicalUrl: "",
  seoNoIndex: false,
  marketingEligible: false,
};

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <p className={`mt-1 text-xs ${value.length > max ? "text-red-500" : "text-slate-400"}`}>
      {value.length}/{max} ตัวอักษร
    </p>
  );
}

/**
 * SEO / social / advanced metadata block shared by the article, product, page
 * and landing-page editors (ported from the legacy SeoFields + AdvancedSeoPanel).
 */
export function SeoFields({
  value,
  onChange,
  context,
  path,
  coverImageUrl,
}: {
  value: SeoValue;
  onChange: (next: SeoValue) => void;
  /** Title + HTML body the AI suggestion and SERP preview are based on. */
  context: { title: string; body: string };
  /** Canonical public path (without domain) shown in the SERP preview. */
  path: string;
  coverImageUrl?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [aiError, setAiError] = useState<string | null>(null);
  const set = <K extends keyof SeoValue>(key: K, v: SeoValue[K]) => onChange({ ...value, [key]: v });

  const suggest = () =>
    startTransition(async () => {
      setAiError(null);
      const res = await aiSuggestSeo({ title: context.title, body: context.body, focusKeyword: value.focusKeyword });
      if (res.error || !res.data) {
        setAiError(res.error ?? "AI ทำงานไม่สำเร็จ");
        return;
      }
      onChange({ ...value, ...res.data });
    });

  const serpTitle = value.seoTitle || context.title || "ชื่อหน้า";
  const serpDesc = value.seoDesc || context.body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 155);
  const serpUrl = value.canonicalUrl || `${SITE_URL}${path}`;

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:grid-cols-2">
        <div className="flex items-center justify-between sm:col-span-2">
          <h3 className="text-sm font-semibold text-slate-800">คีย์เวิร์ด & Meta</h3>
          <button
            type="button"
            onClick={suggest}
            disabled={pending || !context.title}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            <SparklesIcon className="h-3.5 w-3.5" />
            {pending ? "AI กำลังคิด..." : "แนะนำด้วย AI"}
          </button>
        </div>
        {aiError && <p className="text-xs text-red-600 sm:col-span-2">{aiError}</p>}

        <div>
          <label className={labelClass}>Focus Keyword</label>
          <input className={inputClass} value={value.focusKeyword} onChange={(e) => set("focusKeyword", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>คีย์เวิร์ดรอง (คั่นด้วย ,)</label>
          <input
            className={inputClass}
            value={value.secondaryKeywords.join(", ")}
            onChange={(e) =>
              set(
                "secondaryKeywords",
                e.target.value.split(",").map((s) => s.trimStart()).filter((s, i, arr) => s || i === arr.length - 1),
              )
            }
            onBlur={() => set("secondaryKeywords", value.secondaryKeywords.map((s) => s.trim()).filter(Boolean))}
          />
        </div>
        <div>
          <label className={labelClass}>Meta Title (TH)</label>
          <input className={inputClass} value={value.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder={context.title} />
          <Counter value={value.seoTitle} max={60} />
        </div>
        <div>
          <label className={labelClass}>Meta Title (EN)</label>
          <input className={inputClass} value={value.seoTitleEn} onChange={(e) => set("seoTitleEn", e.target.value)} />
          <Counter value={value.seoTitleEn} max={60} />
        </div>
        <div>
          <label className={labelClass}>Meta Description (TH)</label>
          <textarea rows={3} className={inputClass} value={value.seoDesc} onChange={(e) => set("seoDesc", e.target.value)} />
          <Counter value={value.seoDesc} max={155} />
        </div>
        <div>
          <label className={labelClass}>Meta Description (EN)</label>
          <textarea rows={3} className={inputClass} value={value.seoDescEn} onChange={(e) => set("seoDescEn", e.target.value)} />
          <Counter value={value.seoDescEn} max={155} />
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
          <p className="mb-2 text-xs font-semibold text-slate-500">ตัวอย่างบน Google</p>
          <p className="truncate text-xs text-emerald-700">{serpUrl}</p>
          <p className="truncate text-lg text-[#1a0dab]">{serpTitle}</p>
          <p className="line-clamp-2 text-sm text-slate-600">{serpDesc}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:grid-cols-2">
        <h3 className="text-sm font-semibold text-slate-800 sm:col-span-2">การแชร์บนโซเชียล (Open Graph)</h3>
        <div>
          <label className={labelClass}>OG Title (TH)</label>
          <input className={inputClass} value={value.ogTitle} onChange={(e) => set("ogTitle", e.target.value)} placeholder={value.seoTitle || context.title} />
        </div>
        <div>
          <label className={labelClass}>OG Title (EN)</label>
          <input className={inputClass} value={value.ogTitleEn} onChange={(e) => set("ogTitleEn", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>OG Description (TH)</label>
          <textarea rows={2} className={inputClass} value={value.ogDesc} onChange={(e) => set("ogDesc", e.target.value)} placeholder={value.seoDesc} />
        </div>
        <div>
          <label className={labelClass}>OG Description (EN)</label>
          <textarea rows={2} className={inputClass} value={value.ogDescEn} onChange={(e) => set("ogDescEn", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <ImageUploader
            label="OG Image (แนะนำ 1200×630px)"
            value={value.ogImageUrl}
            onChange={(url) => set("ogImageUrl", url)}
            hint={coverImageUrl && !value.ogImageUrl ? "เว้นว่างไว้เพื่อใช้รูปหน้าปก" : undefined}
          />
          {coverImageUrl && value.ogImageUrl !== coverImageUrl && (
            <button type="button" onClick={() => set("ogImageUrl", coverImageUrl)} className="mt-2 text-xs text-brand-navy hover:underline">
              ใช้รูปเดียวกับหน้าปก
            </button>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">Advanced SEO</h3>
        <div>
          <label className={labelClass}>Canonical URL (เว้นว่างเพื่อใช้ URL ของหน้านี้)</label>
          <input className={inputClass} value={value.canonicalUrl} onChange={(e) => set("canonicalUrl", e.target.value)} placeholder={`${SITE_URL}${path}`} />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={value.seoNoIndex} onChange={(e) => set("seoNoIndex", e.target.checked)} />
          ไม่ให้ Google จัดทำดัชนี (noindex)
        </label>
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input type="checkbox" className="mt-1" checked={value.marketingEligible} onChange={(e) => set("marketingEligible", e.target.checked)} />
          <span>
            อนุญาตให้ Meta / TikTok Pixel ทำงานบนหน้านี้
            <span className="block text-xs text-slate-400">
              เปิดเฉพาะหน้าที่ไม่ใช่เนื้อหาด้านสุขภาพเฉพาะบุคคล — ตามนโยบายข้อมูลอ่อนไหวของแพลตฟอร์มโฆษณา
            </span>
          </span>
        </label>
      </section>
    </div>
  );
}
