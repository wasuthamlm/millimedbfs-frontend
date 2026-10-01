"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SaveButton } from "@/components/admin/SaveButton";
import { PlusIcon, TrashIcon } from "@/components/ui/admin-icons";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { ALL_LOCALES } from "@/lib/i18n/locales";
import {
  COOKIE_TEXT_GROUPS,
  getCookieStrings,
  resolveCookieStrings,
  type CookieConsentConfig,
  type CookieStrings,
} from "@/lib/i18n/cookie-strings";
import { saveCookieConfig } from "@/app/admin/site/cookie/actions";

const inputClass = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy";

/** Per-language cookie banner copy + policy links, with a live preview (legacy AdminCookieConsent). */
export function CookieConsentEditor({ initial }: { initial: CookieConsentConfig }) {
  const [config, setConfig] = useState(initial);
  const [lang, setLang] = useState("th");
  const [error, setError] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const defaults = getCookieStrings(lang);
  const overrides = config.texts[lang] ?? {};

  const setText = (key: keyof CookieStrings, value: string) =>
    setConfig((c) => ({ ...c, texts: { ...c.texts, [lang]: { ...(c.texts[lang] ?? {}), [key]: value } } }));
  const setLink = (i: number, patch: Partial<CookieConsentConfig["policyLinks"][number]>) =>
    setConfig((c) => ({ ...c, policyLinks: c.policyLinks.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) }));

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-1">
          {ALL_LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className={cn("rounded-lg px-3 py-1.5 text-sm", lang === l.code ? "bg-brand-navy text-white" : "text-slate-600 hover:bg-slate-100")}
            >
              {l.flag} {l.label}
              {Object.keys(config.texts[l.code] ?? {}).some((k) => (config.texts[l.code] as Record<string, string>)[k]?.trim()) && " •"}
            </button>
          ))}
        </div>
        <p className="mb-4 text-xs text-slate-400">เว้นว่างเพื่อใช้ข้อความมาตรฐาน (แสดงเป็นตัวอย่างสีเทาในช่อง)</p>
        <div className="flex flex-col gap-6">
          {COOKIE_TEXT_GROUPS.map((group) => (
            <div key={group.label}>
              <h3 className="mb-3 text-sm font-semibold text-slate-800">{group.label}</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {group.fields.map((f) => (
                  <div key={f.key} className={cn(f.multiline && "md:col-span-2")}>
                    <label className="mb-1 block text-xs font-medium text-slate-500">{f.label}</label>
                    {f.multiline ? (
                      <textarea rows={3} className={inputClass} value={overrides[f.key] ?? ""} placeholder={defaults[f.key]} onChange={(e) => setText(f.key, e.target.value)} />
                    ) : (
                      <input className={inputClass} value={overrides[f.key] ?? ""} placeholder={defaults[f.key]} onChange={(e) => setText(f.key, e.target.value)} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">ลิงก์นโยบาย</h3>
            <p className="text-xs text-slate-400">แสดงในแบนเนอร์คุกกี้และแถบล่างของ Footer — ใส่เฉพาะลิงก์ที่ผ่านการอนุมัติจากฝ่ายกฎหมายแล้ว</p>
          </div>
          <button
            type="button"
            disabled={config.policyLinks.length >= 6}
            onClick={() => setConfig((c) => ({ ...c, policyLinks: [...c.policyLinks, { labelTh: "", labelEn: "", url: "" }] }))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            เพิ่มลิงก์
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {config.policyLinks.map((link, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1.2fr_auto]">
              <input className={inputClass} placeholder="ชื่อ (TH)" value={link.labelTh} onChange={(e) => setLink(i, { labelTh: e.target.value })} />
              <input className={inputClass} placeholder="Label (EN)" value={link.labelEn} onChange={(e) => setLink(i, { labelEn: e.target.value })} />
              <input className={inputClass} placeholder="/privacy-policy" value={link.url} onChange={(e) => setLink(i, { url: e.target.value })} />
              <button type="button" aria-label="ลบลิงก์" onClick={() => setConfig((c) => ({ ...c, policyLinks: c.policyLinks.filter((_, idx) => idx !== i) }))} className="rounded p-2 text-red-500 hover:bg-red-50">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <SaveButton
          onSave={async () => {
            setError(null);
            const res = await saveCookieConfig(config);
            if (res.error) {
              setError(res.error);
              throw new Error(res.error);
            }
          }}
        />
        <button type="button" onClick={() => setPreviewKey((k) => k + 1)} className="text-sm text-brand-navy hover:underline">
          แสดงตัวอย่างอีกครั้ง
        </button>
      </div>

      {/* Live preview — the real banner component, pinned to the bottom of the screen. */}
      <CookieConsent key={`${lang}-${previewKey}`} preview strings={resolveCookieStrings(lang, config)} policyLinks={config.policyLinks} lang={lang} />
    </div>
  );
}
