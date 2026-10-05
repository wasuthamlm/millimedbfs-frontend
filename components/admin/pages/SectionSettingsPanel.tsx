"use client";

import { useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, CheckIcon, DatabaseIcon, PlusIcon, TrashIcon } from "@/components/ui/admin-icons";
import { SaveButton } from "@/components/admin/SaveButton";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { GalleryEditor } from "@/components/admin/GalleryEditor";
import { RelatedPicker, type RelatedOption } from "@/components/admin/RelatedPicker";
import { cn } from "@/lib/utils";
import {
  BLOCK_TYPES,
  sanitizeAnchorId,
  type AboutCard,
  type AnchorLink,
  type CtaButtons,
  type DeviceVisibility,
  type LayoutColumn,
  type PageSection,
  type SectionConfig,
} from "@/lib/sections";

const inputClass = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-500";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Group({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800">
        {title}
        <span className="text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4">{children}</div>}
    </div>
  );
}

function CtaFields({ value, onChange }: { value: CtaButtons; onChange: (v: CtaButtons) => void }) {
  const set = (k: keyof CtaButtons, v: string | boolean) => onChange({ ...value, [k]: v });
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="ปุ่มหลัก (TH)">
        <input className={inputClass} value={value.primaryLabelTh ?? ""} onChange={(e) => set("primaryLabelTh", e.target.value)} />
      </Field>
      <Field label="ปุ่มหลัก (EN)">
        <input className={inputClass} value={value.primaryLabelEn ?? ""} onChange={(e) => set("primaryLabelEn", e.target.value)} />
      </Field>
      <div className="col-span-2">
        <Field label="ลิงก์ปุ่มหลัก" hint="เช่น /contact, https://…, tel:021234567">
          <input className={inputClass} value={value.primaryUrl ?? ""} onChange={(e) => set("primaryUrl", e.target.value)} />
        </Field>
      </div>
      <Field label="ปุ่มรอง (TH)">
        <input className={inputClass} value={value.secondaryLabelTh ?? ""} onChange={(e) => set("secondaryLabelTh", e.target.value)} />
      </Field>
      <Field label="ปุ่มรอง (EN)">
        <input className={inputClass} value={value.secondaryLabelEn ?? ""} onChange={(e) => set("secondaryLabelEn", e.target.value)} />
      </Field>
      <div className="col-span-2">
        <Field label="ลิงก์ปุ่มรอง">
          <input className={inputClass} value={value.secondaryUrl ?? ""} onChange={(e) => set("secondaryUrl", e.target.value)} />
        </Field>
      </div>
      <label className="col-span-2 flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={!!value.newTab} onChange={(e) => set("newTab", e.target.checked)} />
        เปิดลิงก์ในแท็บใหม่
      </label>
    </div>
  );
}

const blockName = (s: PageSection) => s.customLabel || s.titleTh || BLOCK_TYPES[s.type]?.label || "บล็อก";

/** ANCHOR_NAV links. Picking a target block gives it an Anchor ID if it has none. */
function AnchorLinksEditor({
  self,
  links,
  onChange,
  sections,
  onPatchSection,
}: {
  self: PageSection;
  links: AnchorLink[];
  onChange: (links: AnchorLink[]) => void;
  sections: PageSection[];
  onPatchSection?: (id: string, patch: Partial<PageSection>) => void;
}) {
  const targets = sections.filter((s) => s.id !== self.id && s.type !== "anchor-nav");
  const update = (i: number, patch: Partial<AnchorLink>) => onChange(links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= links.length) return;
    const next = [...links];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  // Hands out unused "section-N" ids; `used` is shared across one batch so new ids don't collide.
  const takenIds = () => new Set(sections.map((s) => s.config.anchorId).filter(Boolean) as string[]);
  const ensureAnchor = (target: PageSection, used: Set<string>) => {
    if (target.config.anchorId) return target.config.anchorId;
    let n = sections.indexOf(target) + 1;
    while (used.has(`section-${n}`)) n++;
    const id = `section-${n}`;
    used.add(id);
    onPatchSection?.(target.id, { config: { ...target.config, anchorId: id } });
    return id;
  };

  const pickTarget = (i: number, targetId: string) => {
    const target = targets.find((s) => s.id === targetId);
    if (!target) return;
    const link = links[i];
    update(i, {
      anchorId: ensureAnchor(target, takenIds()),
      labelTh: link.labelTh || target.titleTh,
      labelEn: link.labelEn || target.titleEn || undefined,
    });
  };

  const fillFromBlocks = () => {
    if (links.length && !window.confirm("แทนที่ลิงก์ทั้งหมดด้วยบล็อกที่มีหัวข้อด้านล่าง?")) return;
    const used = takenIds();
    const below = sections.slice(sections.findIndex((s) => s.id === self.id) + 1);
    onChange(
      below
        .filter((s) => s.type !== "anchor-nav" && s.titleTh.trim())
        .map((s) => ({ labelTh: s.titleTh, labelEn: s.titleEn || undefined, anchorId: ensureAnchor(s, used) })),
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-slate-500">เลือกบล็อกปลายทาง ระบบจะตั้ง Anchor ID ให้บล็อกนั้นอัตโนมัติ (แก้ได้ที่ ขั้นสูง → Anchor ID ของบล็อกนั้น)</p>
      {links.map((link, i) => {
        const target = targets.find((s) => s.config.anchorId && s.config.anchorId === link.anchorId);
        return (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">ลิงก์ที่ {i + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" aria-label="เลื่อนขึ้น" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                  <ArrowUpIcon className="h-4 w-4" />
                </button>
                <button type="button" aria-label="เลื่อนลง" disabled={i === links.length - 1} onClick={() => move(i, 1)} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                  <ArrowDownIcon className="h-4 w-4" />
                </button>
                <button type="button" aria-label="ลบลิงก์" onClick={() => onChange(links.filter((_, idx) => idx !== i))} className="rounded p-1 text-red-500 hover:bg-red-50">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <Field label="ไปที่บล็อก">
              <select className={inputClass} value={target?.id ?? ""} onChange={(e) => pickTarget(i, e.target.value)}>
                <option value="">{link.anchorId ? `#${link.anchorId} (ไม่พบบล็อกนี้ในหน้า)` : "— เลือกบล็อก —"}</option>
                {targets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {blockName(s)}
                    {s.config.anchorId ? ` (#${s.config.anchorId})` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <input className={inputClass} placeholder="ข้อความลิงก์ (TH)" value={link.labelTh} onChange={(e) => update(i, { labelTh: e.target.value })} />
              <input className={inputClass} placeholder="Link text (EN)" value={link.labelEn ?? ""} onChange={(e) => update(i, { labelEn: e.target.value })} />
            </div>
            <input
              className={inputClass}
              placeholder="หรือพิมพ์ Anchor ID เอง เช่น about"
              value={link.anchorId}
              onChange={(e) => update(i, { anchorId: sanitizeAnchorId(e.target.value) })}
            />
          </div>
        );
      })}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange([...links, { labelTh: "", anchorId: "" }])}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <PlusIcon className="h-4 w-4" />
          เพิ่มลิงก์
        </button>
        <button type="button" onClick={fillFromBlocks} className="rounded-lg border border-brand-navy/30 py-2 text-sm text-brand-navy hover:bg-brand-navy/5">
          สร้างจากบล็อกด้านล่างทั้งหมด
        </button>
      </div>
    </div>
  );
}

export function SectionSettingsPanel({
  section,
  onChange,
  onSave,
  articleCount,
  newsCount,
  productCategories,
  articleTypes,
  productOptions,
  sections = [],
  onPatchSection,
}: {
  section: PageSection;
  onChange: (patch: Partial<PageSection>) => void;
  onSave: () => Promise<void>;
  articleCount: number;
  newsCount: number;
  productCategories: { id: string; nameTh: string; parentId: string | null }[];
  articleTypes: { id: string; nameTh: string }[];
  productOptions: RelatedOption[];
  /** Every block on the page — the anchor-nav block links to these. */
  sections?: PageSection[];
  /** Patches another block (gives a link target its Anchor ID). */
  onPatchSection?: (id: string, patch: Partial<PageSection>) => void;
}) {
  const config = section.config;
  const setConfig = (patch: Partial<SectionConfig>) => onChange({ config: { ...config, ...patch } });
  const meta = BLOCK_TYPES[section.type];
  const t = section.type;
  const hasBody = ["text", "columns", "text-image", "video", "cta", "download", "about-teaser", "company-intro"].includes(t);
  const isData = ["articles", "latest-news", "data-articles", "data-products"].includes(t);

  const toggleVisibility = (key: keyof DeviceVisibility) => onChange({ visibility: { ...section.visibility, [key]: !section.visibility[key] } });
  const bg = config.background ?? { type: "none" as const };
  const spacing = config.spacing ?? {};

  const updateColumn = (i: number, patch: Partial<LayoutColumn>) =>
    setConfig({ layoutColumns: (config.layoutColumns ?? []).map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });
  const updateCard = (i: number, patch: Partial<AboutCard>) =>
    setConfig({ cards: (config.cards ?? []).map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });

  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/60 px-4 py-5">
      <div>
        <p className="text-base font-semibold text-slate-800">{meta.label}</p>
        <p className="text-xs text-slate-400">{meta.description}</p>
      </div>

      <Group title="เนื้อหา">
        <Field label="ชื่อบล็อก (ใช้ในหลังบ้านเท่านั้น)">
          <input className={inputClass} value={section.customLabel ?? ""} onChange={(e) => onChange({ customLabel: e.target.value })} placeholder={meta.label} />
        </Field>
        {t !== "hero-banners" && t !== "cta-bar" && (
          <>
            <Field label="หัวข้อ (TH)">
              <input className={inputClass} value={section.titleTh} onChange={(e) => onChange({ titleTh: e.target.value })} />
            </Field>
            <Field label="หัวข้อ (EN)">
              <input className={inputClass} value={section.titleEn} onChange={(e) => onChange({ titleEn: e.target.value })} />
            </Field>
          </>
        )}

        {hasBody && (
          <>
            <Field label="เนื้อหา (TH)">
              <RichTextEditor value={config.bodyTh ?? ""} onChange={(html) => setConfig({ bodyTh: html })} />
            </Field>
            <Field label="เนื้อหา (EN)">
              <RichTextEditor value={config.bodyEn ?? ""} onChange={(html) => setConfig({ bodyEn: html })} />
            </Field>
          </>
        )}

        {(t === "text-image" || t === "company-intro") && (
          <>
            <ImageUploader label="รูปภาพ" value={config.imageUrl ?? ""} onChange={(url) => setConfig({ imageUrl: url })} />
            <Field label="Alt text รูปภาพ">
              <input className={inputClass} value={config.imageAlt ?? ""} onChange={(e) => setConfig({ imageAlt: e.target.value })} />
            </Field>
            {t === "text-image" ? (
              <Field label="ตำแหน่งรูป">
                <select className={inputClass} value={config.imagePosition ?? "left"} onChange={(e) => setConfig({ imagePosition: e.target.value as SectionConfig["imagePosition"] })}>
                  <option value="left">รูปซ้าย ข้อความขวา</option>
                  <option value="right">ข้อความซ้าย รูปขวา</option>
                  <option value="top">รูปด้านบน</option>
                </select>
              </Field>
            ) : (
              <Field label="การจัดวางรูปกับข้อความ">
                <select className={inputClass} value={section.columns === 2 ? 2 : 1} onChange={(e) => onChange({ columns: Number(e.target.value) })}>
                  <option value={1}>รูปด้านบน ข้อความด้านล่าง</option>
                  <option value={2}>รูปด้านซ้าย ข้อความด้านขวา</option>
                </select>
              </Field>
            )}
          </>
        )}

        {(t === "columns" || t === "gallery" || t === "about-teaser" || isData) && t !== "latest-news" && (
          <Field label="จำนวนคอลัมน์">
            <select className={inputClass} value={section.columns ?? 3} onChange={(e) => onChange({ columns: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} คอลัมน์
                </option>
              ))}
            </select>
          </Field>
        )}

        {t === "video" && (
          <>
            <Field label="ลิงก์วิดีโอ" hint="YouTube, Vimeo หรือไฟล์ .mp4 จากคลังสื่อ">
              <input className={inputClass} value={config.videoUrl ?? ""} onChange={(e) => setConfig({ videoUrl: e.target.value })} />
            </Field>
            <ImageUploader label="หรืออัปโหลดไฟล์วิดีโอ" kind="video" value={config.videoUrl ?? ""} onChange={(url) => setConfig({ videoUrl: url })} />
            <Field label={`ความกว้างวิดีโอ ${config.videoWidth ?? 100}%`}>
              <input type="range" min={30} max={100} step={5} value={config.videoWidth ?? 100} onChange={(e) => setConfig({ videoWidth: Number(e.target.value) })} className="w-full" />
            </Field>
          </>
        )}

        {t === "youtube" && <p className="text-xs text-slate-500">บล็อกนี้แสดงวิดีโอจาก การตั้งค่า → Site Settings → YouTube URL</p>}
        {t === "contact-info" && <p className="text-xs text-slate-500">บล็อกนี้แสดงที่อยู่ เบอร์โทร อีเมล และแผนที่ จาก การตั้งค่า → ข้อมูลติดต่อ</p>}
        {t === "hero-banners" && <p className="text-xs text-slate-500">สไลด์มาจากเมนู หน้าเว็บ → จัดการ Banners</p>}

        {t === "gallery" && <GalleryEditor value={(config.galleryUrls ?? []).map((url) => ({ url, alt: "" }))} onChange={(g) => setConfig({ galleryUrls: g.map((x) => x.url) })} />}

        {t === "anchor-nav" && (
          <AnchorLinksEditor self={section} links={config.navLinks ?? []} onChange={(navLinks) => setConfig({ navLinks })} sections={sections} onPatchSection={onPatchSection} />
        )}

        {t === "cta" && <CtaFields value={config.cta ?? {}} onChange={(cta) => setConfig({ cta })} />}

        {t === "download" && (
          <>
            <ImageUploader label="ไฟล์ PDF" kind="document" value={config.fileUrl ?? ""} onChange={(url) => setConfig({ fileUrl: url })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="ข้อความปุ่ม (TH)">
                <input className={inputClass} value={config.fileLabelTh ?? ""} onChange={(e) => setConfig({ fileLabelTh: e.target.value })} />
              </Field>
              <Field label="ข้อความปุ่ม (EN)">
                <input className={inputClass} value={config.fileLabelEn ?? ""} onChange={(e) => setConfig({ fileLabelEn: e.target.value })} />
              </Field>
            </div>
          </>
        )}

        {t === "layout" && (
          <div className="flex flex-col gap-3">
            {(config.layoutColumns ?? []).map((col, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-2">
                  <select className={inputClass} value={col.kind} onChange={(e) => updateColumn(i, { kind: e.target.value as LayoutColumn["kind"] })}>
                    <option value="text">ข้อความ</option>
                    <option value="image">รูปภาพ</option>
                    <option value="video">วิดีโอ</option>
                    <option value="cta">ปุ่ม</option>
                  </select>
                  <select className="w-28 rounded-lg border border-slate-200 px-2 py-2 text-sm" value={col.width} onChange={(e) => updateColumn(i, { width: Number(e.target.value) })} aria-label="ความกว้าง">
                    {[1, 2, 3, 4].map((w) => (
                      <option key={w} value={w}>
                        กว้าง ×{w}
                      </option>
                    ))}
                  </select>
                  <button type="button" aria-label="ลบคอลัมน์" onClick={() => setConfig({ layoutColumns: (config.layoutColumns ?? []).filter((_, idx) => idx !== i) })} className="rounded p-1.5 text-red-500 hover:bg-red-50">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                {col.kind === "text" && (
                  <>
                    <RichTextEditor value={col.bodyTh ?? ""} onChange={(html) => updateColumn(i, { bodyTh: html })} />
                    <RichTextEditor value={col.bodyEn ?? ""} onChange={(html) => updateColumn(i, { bodyEn: html })} placeholder="English (optional)" />
                  </>
                )}
                {col.kind === "image" && <ImageUploader label="รูปภาพ" value={col.imageUrl ?? ""} onChange={(url) => updateColumn(i, { imageUrl: url })} />}
                {col.kind === "video" && <input className={inputClass} placeholder="ลิงก์ YouTube / Vimeo / .mp4" value={col.videoUrl ?? ""} onChange={(e) => updateColumn(i, { videoUrl: e.target.value })} />}
                {col.kind === "cta" && <CtaFields value={col.cta ?? {}} onChange={(cta) => updateColumn(i, { cta })} />}
              </div>
            ))}
            {(config.layoutColumns ?? []).length < 4 && (
              <button
                type="button"
                onClick={() => setConfig({ layoutColumns: [...(config.layoutColumns ?? []), { kind: "text", width: 1 }] })}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <PlusIcon className="h-4 w-4" />
                เพิ่มคอลัมน์
              </button>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="ระยะห่างคอลัมน์">
                <select className={inputClass} value={config.layoutGap ?? "md"} onChange={(e) => setConfig({ layoutGap: e.target.value as SectionConfig["layoutGap"] })}>
                  <option value="sm">แคบ</option>
                  <option value="md">กลาง</option>
                  <option value="lg">กว้าง</option>
                </select>
              </Field>
              <Field label="จัดแนวตั้ง">
                <select className={inputClass} value={config.layoutAlign ?? "center"} onChange={(e) => setConfig({ layoutAlign: e.target.value as SectionConfig["layoutAlign"] })}>
                  <option value="start">บน</option>
                  <option value="center">กลาง</option>
                  <option value="end">ล่าง</option>
                </select>
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={config.stackOnMobile !== false} onChange={(e) => setConfig({ stackOnMobile: e.target.checked })} />
              เรียงซ้อนกันบนมือถือ
            </label>
          </div>
        )}

        {t === "about-teaser" && (
          <div className="flex flex-col gap-3">
            {(config.cards ?? []).map((card, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">การ์ดที่ {i + 1}</span>
                  <button type="button" aria-label="ลบการ์ด" onClick={() => setConfig({ cards: (config.cards ?? []).filter((_, idx) => idx !== i) })} className="rounded p-1 text-red-500 hover:bg-red-50">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <input className={inputClass} placeholder="หัวข้อ (TH)" value={card.titleTh} onChange={(e) => updateCard(i, { titleTh: e.target.value })} />
                <input className={inputClass} placeholder="Title (EN)" value={card.titleEn ?? ""} onChange={(e) => updateCard(i, { titleEn: e.target.value })} />
                <textarea rows={3} className={inputClass} placeholder="ข้อความ (TH)" value={card.bodyTh} onChange={(e) => updateCard(i, { bodyTh: e.target.value })} />
                <textarea rows={2} className={inputClass} placeholder="Text (EN)" value={card.bodyEn ?? ""} onChange={(e) => updateCard(i, { bodyEn: e.target.value })} />
                <input className={inputClass} placeholder="ลิงก์ (ไม่บังคับ) เช่น /about" value={card.href ?? ""} onChange={(e) => updateCard(i, { href: e.target.value })} />
                <ImageUploader label="รูป" value={card.imageUrl ?? ""} onChange={(url) => updateCard(i, { imageUrl: url })} />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setConfig({ cards: [...(config.cards ?? []), { titleTh: "", bodyTh: "" }] })}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <PlusIcon className="h-4 w-4" />
              เพิ่มการ์ด
            </button>
          </div>
        )}
      </Group>

      {isData && (
        <Group title="แหล่งข้อมูล">
          <div className="flex items-center gap-2 rounded-lg border border-brand-navy/30 bg-brand-navy/5 px-4 py-2.5 text-sm font-medium text-brand-navy">
            <DatabaseIcon className="h-4 w-4" />
            {section.sourceLabel}
          </div>
          {t !== "data-products" && (
            <>
              <Field label="กรองตามประเภทบทความ">
                <select className={inputClass} value={config.articleTypeId ?? ""} onChange={(e) => setConfig({ articleTypeId: e.target.value || undefined })}>
                  <option value="">ทุกประเภท</option>
                  {articleTypes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nameTh}
                    </option>
                  ))}
                </select>
              </Field>
              {!config.articleTypeId && (
                <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <CheckIcon className="h-4 w-4" />
                  พบ {t === "latest-news" ? newsCount : articleCount} รายการ
                </p>
              )}
            </>
          )}
          {t === "data-products" && (
            <>
              <Field label="เรียงลำดับ">
                <select className={inputClass} value={config.productSort ?? "newest"} onChange={(e) => setConfig({ productSort: e.target.value as SectionConfig["productSort"] })}>
                  <option value="newest">ใหม่ล่าสุด</option>
                  <option value="name">ตามชื่อ</option>
                  <option value="price-asc">ราคาต่ำ → สูง</option>
                  <option value="price-desc">ราคาสูง → ต่ำ</option>
                  <option value="manual">เลือกสินค้าเอง</option>
                </select>
              </Field>
              {config.productSort === "manual" ? (
                <RelatedPicker label="สินค้าที่แสดง (เรียงตามลำดับที่เลือก)" options={productOptions} value={config.productIds ?? []} onChange={(ids) => setConfig({ productIds: ids })} limit={24} />
              ) : (
                <Field label="หมวดหมู่">
                  <select className={inputClass} value={config.productCategoryId ?? ""} onChange={(e) => setConfig({ productCategoryId: e.target.value || undefined })}>
                    <option value="">ทุกหมวดหมู่</option>
                    {productCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.parentId ? "— " : ""}
                        {c.nameTh}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </>
          )}
          <Field label="จำนวนที่แสดง">
            <input type="number" min={1} max={48} className={inputClass} value={section.itemsToShow ?? 6} onChange={(e) => onChange({ itemsToShow: Math.max(1, Number(e.target.value) || 1) })} />
          </Field>
        </Group>
      )}

      <Group title="รูปแบบ (พื้นหลัง / ระยะห่าง)" defaultOpen={false}>
        <Field label="พื้นหลัง">
          <select className={inputClass} value={bg.type} onChange={(e) => setConfig({ background: { ...bg, type: e.target.value as "none" | "color" | "image" } })}>
            <option value="none">ไม่มี</option>
            <option value="color">สี</option>
            <option value="image">รูปภาพ</option>
          </select>
        </Field>
        {bg.type === "color" && (
          <Field label="สีพื้นหลัง">
            <input type="color" value={bg.color ?? "#f1f5f9"} onChange={(e) => setConfig({ background: { ...bg, color: e.target.value } })} className="h-9 w-16 rounded border border-slate-200" />
          </Field>
        )}
        {bg.type === "image" && (
          <>
            <ImageUploader label="รูปพื้นหลัง" value={bg.imageUrl ?? ""} onChange={(url) => setConfig({ background: { ...bg, imageUrl: url } })} />
            <Field label={`ความมืดของ overlay ${bg.overlay ?? 0}%`}>
              <input type="range" min={0} max={80} step={5} value={bg.overlay ?? 0} onChange={(e) => setConfig({ background: { ...bg, overlay: Number(e.target.value) } })} className="w-full" />
            </Field>
          </>
        )}
        {bg.type !== "none" && (
          <Field label="สีตัวอักษร">
            <select className={inputClass} value={bg.textColor ?? "dark"} onChange={(e) => setConfig({ background: { ...bg, textColor: e.target.value as "dark" | "light" } })}>
              <option value="dark">เข้ม</option>
              <option value="light">ขาว</option>
            </select>
          </Field>
        )}
        <div className="grid grid-cols-3 gap-3">
          <Field label="ระยะบน-ล่าง">
            <select className={inputClass} value={spacing.paddingY ?? "md"} onChange={(e) => setConfig({ spacing: { ...spacing, paddingY: e.target.value as never } })}>
              <option value="none">ไม่มี</option>
              <option value="sm">เล็ก</option>
              <option value="md">กลาง</option>
              <option value="lg">ใหญ่</option>
              <option value="xl">ใหญ่มาก</option>
            </select>
          </Field>
          <Field label="ความกว้าง">
            <select className={inputClass} value={spacing.maxWidth ?? ""} onChange={(e) => setConfig({ spacing: { ...spacing, maxWidth: (e.target.value || undefined) as never } })}>
              <option value="">ค่าเริ่มต้น</option>
              <option value="sm">แคบ</option>
              <option value="md">กลาง</option>
              <option value="lg">กว้าง</option>
              <option value="xl">กว้างมาก</option>
              <option value="full">เต็มจอ</option>
            </select>
          </Field>
          <Field label="จัดข้อความ">
            <select className={inputClass} value={spacing.textAlign ?? "left"} onChange={(e) => setConfig({ spacing: { ...spacing, textAlign: e.target.value as never } })}>
              <option value="left">ซ้าย</option>
              <option value="center">กลาง</option>
              <option value="right">ขวา</option>
            </select>
          </Field>
        </div>
      </Group>

      <Group title="ขั้นสูง" defaultOpen={false}>
        <Field label="Anchor ID (ลิงก์กระโดด)" hint="เมนูลิงก์มาได้ด้วย #anchor-id">
          <input className={inputClass} value={config.anchorId ?? ""} onChange={(e) => setConfig({ anchorId: e.target.value })} placeholder="เช่น about-us" />
        </Field>
        <div>
          <p className={labelClass}>แสดงบนอุปกรณ์</p>
          <div className="flex flex-wrap gap-4">
            {(
              [
                ["desktop", "Desktop"],
                ["tablet", "Tablet"],
                ["mobile", "Mobile"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className={cn("flex items-center gap-2 text-sm text-slate-600")}>
                <input type="checkbox" checked={section.visibility[key]} onChange={() => toggleVisibility(key)} />
                {label}
              </label>
            ))}
          </div>
        </div>
      </Group>

      <div className="flex justify-end">
        <SaveButton onSave={onSave} />
      </div>
    </div>
  );
}
