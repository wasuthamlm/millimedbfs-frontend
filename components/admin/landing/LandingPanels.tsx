"use client";

import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "@/components/ui/admin-icons";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { FaqEditor } from "@/components/admin/FaqEditor";
import {
  LANDING_WIDGET_ICONS,
  type LandingBackground,
  type LandingFaqItem,
  type LandingFooterConfig,
  type LandingHeaderConfig,
  type LandingLink,
  type LandingTheme,
  type LandingWidgetConfig,
  type LandingWidgetIcon,
} from "@/lib/landing";

export const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-navy";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-500";

function PanelTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-navy">{title}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-brand-navy" />
      {label}
    </label>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-slate-200" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} font-mono`} maxLength={9} />
      </div>
    </div>
  );
}

function BackgroundFields({ value, onChange, label }: { value: LandingBackground; onChange: (v: LandingBackground) => void; label: string }) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:grid-cols-2">
      <ColorField label={`สี${label}`} value={value.color} onChange={(color) => onChange({ ...value, color })} />
      <div>
        <label className={labelClass}>ความทึบรูปพื้นหลัง ({Math.round((value.imageOpacity ?? 0.35) * 100)}%)</label>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round((value.imageOpacity ?? 0.35) * 100)}
          onChange={(e) => onChange({ ...value, imageOpacity: Number(e.target.value) / 100 })}
          className="w-full accent-brand-navy"
          disabled={!value.imageUrl}
        />
      </div>
      <div className="sm:col-span-2">
        <ImageUploader label={`รูป${label} (ไม่บังคับ)`} value={value.imageUrl ?? ""} onChange={(imageUrl) => onChange({ ...value, imageUrl })} />
      </div>
    </div>
  );
}

function LinkListEditor({ links, onChange, title, hint }: { links: LandingLink[]; onChange: (v: LandingLink[]) => void; title: string; hint?: string }) {
  const patch = (i: number, p: Partial<LandingLink>) => onChange(links.map((l, idx) => (idx === i ? { ...l, ...p } : l)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= links.length) return;
    const next = [...links];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-800">{title}</p>
        <button type="button" onClick={() => onChange([...links, { label: "", url: "" }])} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-brand-navy hover:bg-brand-navy/10">
          <PlusIcon className="h-3 w-3" /> เพิ่มลิงก์
        </button>
      </div>
      {links.length === 0 && <p className="py-1 text-xs text-slate-400">ยังไม่มีลิงก์</p>}
      <div className="flex flex-col gap-2">
        {links.map((l, i) => (
          <div key={i} className="grid grid-cols-1 items-center gap-2 rounded-lg border border-slate-100 bg-white p-2 sm:grid-cols-[1fr_1fr_auto]">
            <input value={l.label} onChange={(e) => patch(i, { label: e.target.value })} placeholder="ข้อความ" className={inputClass} />
            <input value={l.url} onChange={(e) => patch(i, { url: e.target.value })} placeholder="#section หรือ https://..." className={`${inputClass} font-mono`} />
            <div className="flex items-center gap-1">
              <label className="flex items-center gap-1 whitespace-nowrap text-xs text-slate-500">
                <input type="checkbox" checked={!!l.newTab} onChange={(e) => patch(i, { newTab: e.target.checked })} /> แท็บใหม่
              </label>
              <button type="button" aria-label="เลื่อนขึ้น" onClick={() => move(i, -1)} className="p-1 text-slate-400 hover:text-slate-700"><ArrowUpIcon className="h-3.5 w-3.5" /></button>
              <button type="button" aria-label="เลื่อนลง" onClick={() => move(i, 1)} className="p-1 text-slate-400 hover:text-slate-700"><ArrowDownIcon className="h-3.5 w-3.5" /></button>
              <button type="button" aria-label="ลบลิงก์" onClick={() => onChange(links.filter((_, idx) => idx !== i))} className="p-1 text-red-400 hover:text-red-600"><TrashIcon className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
      {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function HeaderPanel({ cfg, onChange }: { cfg: LandingHeaderConfig; onChange: (v: LandingHeaderConfig) => void }) {
  const set = <K extends keyof LandingHeaderConfig>(k: K, v: LandingHeaderConfig[K]) => onChange({ ...cfg, [k]: v });
  return (
    <div className="flex max-w-2xl flex-col gap-4 p-5">
      <PanelTitle title="Header เฉพาะหน้านี้" hint="ไม่ดึงจาก Header กลาง — บนมือถือจะย่อเป็นเมนูแฮมเบอร์เกอร์อัตโนมัติ" />
      <div className="flex flex-wrap gap-4">
        <Check checked={cfg.enabled} onChange={(v) => set("enabled", v)} label="แสดง Header" />
        <Check checked={cfg.sticky} onChange={(v) => set("sticky", v)} label="ตรึงไว้ด้านบนเมื่อเลื่อน" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ImageUploader label="โลโก้ Header" value={cfg.logoUrl} onChange={(v) => set("logoUrl", v)} />
        <div className="flex flex-col gap-3">
          <div>
            <label className={labelClass}>ข้อความแทนโลโก้</label>
            <input value={cfg.logoText} onChange={(e) => set("logoText", e.target.value)} placeholder="ชื่อแคมเปญ" className={inputClass} />
          </div>
          <ColorField label="สีตัวอักษร Header" value={cfg.textColor} onChange={(v) => set("textColor", v)} />
        </div>
      </div>
      <BackgroundFields label="พื้นหลัง Header" value={cfg.bg} onChange={(v) => set("bg", v)} />
      <LinkListEditor links={cfg.links} onChange={(v) => set("links", v)} title="เมนูใน Header" hint="ใส่ #anchor ของบล็อก (ตั้งได้ในแผงบล็อก) เพื่อเลื่อนภายในหน้า หรือใส่ลิงก์ภายนอก" />
      <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
        <p className="text-xs font-semibold text-slate-800">ปุ่มหลักบน Header (ไม่บังคับ)</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input value={cfg.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} placeholder="ข้อความปุ่ม เช่น สมัครเลย" className={inputClass} />
          <input value={cfg.ctaUrl} onChange={(e) => set("ctaUrl", e.target.value)} placeholder="https://... หรือ #form" className={`${inputClass} font-mono`} />
        </div>
        <Check checked={cfg.ctaNewTab} onChange={(v) => set("ctaNewTab", v)} label="เปิดในแท็บใหม่" />
        <p className="text-xs text-slate-400">ปุ่มนี้ใช้สีหลักของหน้า (ตั้งค่าที่แท็บ “ธีมสี”)</p>
      </div>
    </div>
  );
}

export function FooterPanel({ cfg, onChange }: { cfg: LandingFooterConfig; onChange: (v: LandingFooterConfig) => void }) {
  const set = <K extends keyof LandingFooterConfig>(k: K, v: LandingFooterConfig[K]) => onChange({ ...cfg, [k]: v });
  return (
    <div className="flex max-w-2xl flex-col gap-4 p-5">
      <PanelTitle title="Footer เฉพาะหน้านี้" hint="ไม่ดึงจาก Footer กลางของเว็บ" />
      <Check checked={cfg.enabled} onChange={(v) => set("enabled", v)} label="แสดง Footer" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ImageUploader label="โลโก้ Footer" value={cfg.logoUrl} onChange={(v) => set("logoUrl", v)} />
        <ColorField label="สีตัวอักษร Footer" value={cfg.textColor} onChange={(v) => set("textColor", v)} />
      </div>
      <BackgroundFields label="พื้นหลัง Footer" value={cfg.bg} onChange={(v) => set("bg", v)} />
      <div>
        <label className={labelClass}>ข้อความใน Footer</label>
        <RichTextEditor value={cfg.text} onChange={(v) => set("text", v)} placeholder="ที่อยู่ ช่องทางติดต่อ หรือข้อความสั้น ๆ" />
      </div>
      <LinkListEditor links={cfg.links} onChange={(v) => set("links", v)} title="ลิงก์ใน Footer" />
      <div>
        <label className={labelClass}>ข้อความลิขสิทธิ์</label>
        <input value={cfg.copyright} onChange={(e) => set("copyright", e.target.value)} placeholder={`© ${new Date().getFullYear()} ...`} className={inputClass} />
      </div>
    </div>
  );
}

const POSITION_OPTIONS: { value: LandingWidgetConfig["position"]; label: string }[] = [
  { value: "middle-right", label: "กึ่งกลางจอ ชิดขวา (แนะนำ)" },
  { value: "middle-left", label: "กึ่งกลางจอ ชิดซ้าย" },
  { value: "bottom-right", label: "ล่างขวา" },
  { value: "bottom-left", label: "ล่างซ้าย" },
];

export function WidgetPanel({ cfg, onChange }: { cfg: LandingWidgetConfig; onChange: (v: LandingWidgetConfig) => void }) {
  const set = <K extends keyof LandingWidgetConfig>(k: K, v: LandingWidgetConfig[K]) => onChange({ ...cfg, [k]: v });
  const patchItem = (i: number, p: Partial<LandingWidgetConfig["items"][number]>) => set("items", cfg.items.map((it, idx) => (idx === i ? { ...it, ...p } : it)));
  return (
    <div className="flex max-w-2xl flex-col gap-4 p-5">
      <PanelTitle title="Widget ลอยเฉพาะหน้านี้" hint="แยกจาก Widget กลางของเว็บ" />
      <Check checked={cfg.enabled} onChange={(v) => set("enabled", v)} label="เปิดใช้งาน Widget" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>ตำแหน่ง</label>
          <select value={cfg.position} onChange={(e) => set("position", e.target.value as LandingWidgetConfig["position"])} className={inputClass}>
            {POSITION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>รูปทรง</label>
          <select value={cfg.design} onChange={(e) => set("design", e.target.value as LandingWidgetConfig["design"])} className={inputClass}>
            <option value="pill">แคปซูล (ไอคอน + ข้อความ)</option>
            <option value="circle">วงกลม (ไอคอนเท่านั้น)</option>
            <option value="square">สี่เหลี่ยมมุมมน</option>
          </select>
        </div>
        <ColorField label="สีปุ่ม" value={cfg.color} onChange={(v) => set("color", v)} />
        <ColorField label="สีไอคอน/ตัวอักษร" value={cfg.textColor} onChange={(v) => set("textColor", v)} />
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-800">ปุ่มใน Widget</p>
          <button type="button" onClick={() => set("items", [...cfg.items, { label: "", url: "", icon: "message" }])} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-brand-navy hover:bg-brand-navy/10">
            <PlusIcon className="h-3 w-3" /> เพิ่มปุ่ม
          </button>
        </div>
        {cfg.items.length === 0 && <p className="py-1 text-xs text-slate-400">ยังไม่มีปุ่ม</p>}
        <div className="flex flex-col gap-2">
          {cfg.items.map((it, i) => (
            <div key={i} className="grid grid-cols-1 items-center gap-2 rounded-lg border border-slate-100 bg-white p-2 sm:grid-cols-[120px_1fr_1fr_auto]">
              <select value={it.icon} onChange={(e) => patchItem(i, { icon: e.target.value as LandingWidgetIcon })} className={inputClass}>
                {LANDING_WIDGET_ICONS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <input value={it.label} onChange={(e) => patchItem(i, { label: e.target.value })} placeholder="ข้อความ เช่น โทรเลย" className={inputClass} />
              <input value={it.url} onChange={(e) => patchItem(i, { url: e.target.value })} placeholder="https://... / #form / เบอร์โทร" className={`${inputClass} font-mono`} />
              <button type="button" aria-label="ลบปุ่ม" onClick={() => set("items", cfg.items.filter((_, idx) => idx !== i))} className="justify-self-end p-1.5 text-red-400 hover:text-red-600">
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">เลือกไอคอน phone แล้วใส่เบอร์โทร ปุ่มจะกดโทรออกได้ทันที · บนมือถือแสดงเป็นไอคอนอย่างเดียว</p>
      </div>
    </div>
  );
}

export function ThemePanel({ theme, onChange }: { theme: LandingTheme; onChange: (v: LandingTheme) => void }) {
  const set = <K extends keyof LandingTheme>(k: K, v: LandingTheme[K]) => onChange({ ...theme, [k]: v });
  return (
    <div className="flex max-w-2xl flex-col gap-4 p-5">
      <PanelTitle title="ธีมสีของหน้า" hint="สีหลักใช้กับปุ่มและหัวข้อ · สีพื้นหลัง/ตัวอักษรใช้ทั้งหน้า" />
      <Check checked={theme.useSiteColors} onChange={(v) => set("useSiteColors", v)} label="ใช้สีหลัก/สีเน้นเดียวกับเว็บหลัก" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {!theme.useSiteColors && (
          <>
            <ColorField label="สีหลัก (Primary)" value={theme.primaryColor} onChange={(v) => set("primaryColor", v)} />
            <ColorField label="สีเน้น (Accent)" value={theme.accentColor} onChange={(v) => set("accentColor", v)} />
          </>
        )}
        <ColorField label="สีพื้นหลังหน้า" value={theme.bgColor} onChange={(v) => set("bgColor", v)} />
        <ColorField label="สีตัวอักษร" value={theme.textColor} onChange={(v) => set("textColor", v)} />
      </div>
    </div>
  );
}

export type LandingSeoFields = {
  titleTh: string;
  titleEn: string;
  slug: string;
  coverImageUrl: string;
  seoTitle: string;
  seoTitleEn: string;
  seoDesc: string;
  seoDescEn: string;
  ogTitle: string;
  ogTitleEn: string;
  ogDesc: string;
  ogDescEn: string;
  ogImageUrl: string;
  focusKeyword: string;
  canonicalUrl: string;
  noIndex: boolean;
  geoPlaceName: string;
  geoAddress: string;
  geoLatitude: string;
  geoLongitude: string;
  marketingEligible: boolean;
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function SeoPanel({
  form,
  onChange,
  faq,
  onFaqChange,
  faqContext,
}: {
  form: LandingSeoFields;
  onChange: (patch: Partial<LandingSeoFields>) => void;
  faq: LandingFaqItem[];
  onFaqChange: (v: LandingFaqItem[]) => void;
  faqContext: { title: string; body: string };
}) {
  const text = (k: keyof LandingSeoFields, opts: { area?: boolean; mono?: boolean; placeholder?: string } = {}) =>
    opts.area ? (
      <textarea rows={3} value={form[k] as string} onChange={(e) => onChange({ [k]: e.target.value })} className={`${inputClass} resize-none`} placeholder={opts.placeholder} />
    ) : (
      <input value={form[k] as string} onChange={(e) => onChange({ [k]: e.target.value })} className={`${inputClass} ${opts.mono ? "font-mono" : ""}`} placeholder={opts.placeholder} />
    );

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-5">
      <section className="flex flex-col gap-3">
        <PanelTitle title="ข้อมูลหน้า" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="ชื่อหน้า (TH)">{text("titleTh")}</Field>
          <Field label="ชื่อหน้า (EN)">{text("titleEn")}</Field>
        </div>
        <Field label="Slug (URL)" hint={`URL: /lp/${form.slug || "..."}`}>{text("slug", { mono: true })}</Field>
      </section>

      <section className="flex flex-col gap-3">
        <PanelTitle title="รูปหน้าปก & OG Image" hint="รูปหน้าปกใช้เป็น OG Image อัตโนมัติเมื่อไม่ได้ใส่ OG Image แยก · แนะนำ 1200×630 px" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ImageUploader label="รูปหน้าปก (Cover)" value={form.coverImageUrl} onChange={(v) => onChange({ coverImageUrl: v })} />
          <ImageUploader label="OG Image (สำหรับแชร์)" value={form.ogImageUrl} onChange={(v) => onChange({ ogImageUrl: v })} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <PanelTitle title="SEO" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Meta Title (TH)">{text("seoTitle")}</Field>
          <Field label="Meta Title (EN)">{text("seoTitleEn")}</Field>
        </div>
        <Field label="Meta Description (TH)" hint={`ควรยาว 120–160 ตัวอักษร (ตอนนี้ ${form.seoDesc.length})`}>{text("seoDesc", { area: true })}</Field>
        <Field label="Meta Description (EN)">{text("seoDescEn", { area: true })}</Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="OG Title (TH)">{text("ogTitle")}</Field>
          <Field label="OG Title (EN)">{text("ogTitleEn")}</Field>
          <Field label="OG Description (TH)">{text("ogDesc", { area: true })}</Field>
          <Field label="OG Description (EN)">{text("ogDescEn", { area: true })}</Field>
          <Field label="Focus Keyword">{text("focusKeyword")}</Field>
          <Field label="Canonical URL">{text("canonicalUrl", { mono: true, placeholder: "เว้นว่าง = ใช้ URL ของหน้านี้" })}</Field>
        </div>
        <div className="flex flex-wrap gap-4">
          <Check checked={form.noIndex} onChange={(v) => onChange({ noIndex: v })} label="ไม่ให้ Search Engine เก็บหน้านี้ (noindex)" />
          <Check checked={form.marketingEligible} onChange={(v) => onChange({ marketingEligible: v })} label="ใช้กับการตลาด / Pixel ได้" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <PanelTitle title="FAQ (AEO)" hint="แสดงท้ายหน้า และสร้าง FAQPage schema ให้ Google / AI อ่านได้" />
        <FaqEditor value={faq} onChange={onFaqChange} context={faqContext} />
      </section>

      <section className="flex flex-col gap-3">
        <PanelTitle title="GEO (LocalBusiness)" hint="ใส่ชื่อสถานที่เพื่อสร้าง LocalBusiness schema — เหมาะกับแคมเปญหน้าร้าน/สาขา" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="ชื่อสถานที่">{text("geoPlaceName")}</Field>
          <Field label="ที่อยู่">{text("geoAddress")}</Field>
          <Field label="Latitude">{text("geoLatitude", { mono: true, placeholder: "13.7563" })}</Field>
          <Field label="Longitude">{text("geoLongitude", { mono: true, placeholder: "100.5018" })}</Field>
        </div>
      </section>
    </div>
  );
}
