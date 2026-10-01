"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SaveButton } from "@/components/admin/SaveButton";
import { PlusIcon, TrashIcon } from "@/components/ui/admin-icons";
import { ContactForm } from "@/components/contact/ContactForm";
import {
  LOCKED_FIELDS,
  VALIDATION_OPTIONS,
  type ContactConfig,
  type CustomField,
  type StandardField,
  type Validation,
} from "@/lib/contact-config";
import { saveContactConfig } from "@/app/admin/site/contact-form/actions";

const inputClass = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy";

const FIELD_LABELS: Record<StandardField, string> = {
  name: "ชื่อ-นามสกุล",
  email: "อีเมล",
  phone: "เบอร์โทรศัพท์",
  subject: "หัวข้อ",
  message: "ข้อความ",
};

const LAYOUTS: { key: ContactConfig["layout"]; label: string }[] = [
  { key: "info-left", label: "ข้อมูลติดต่อซ้าย / ฟอร์มขวา" },
  { key: "info-right", label: "ฟอร์มซ้าย / ข้อมูลติดต่อขวา" },
  { key: "stacked", label: "ฟอร์มบน / ข้อมูลติดต่อล่าง" },
];

/** Contact page layout, standard field switches and custom fields (legacy ContactLayoutPanel + CustomFieldsEditor). */
export function ContactFormEditor({ initial, initialMarketingEligible = false }: { initial: ContactConfig; initialMarketingEligible?: boolean }) {
  const [config, setConfig] = useState(initial);
  const [marketingEligible, setMarketingEligible] = useState(initialMarketingEligible);
  const [error, setError] = useState<string | null>(null);

  const setField = (key: StandardField, patch: Partial<ContactConfig["fields"][StandardField]>) =>
    setConfig((c) => ({ ...c, fields: { ...c.fields, [key]: { ...c.fields[key], ...patch } } }));
  const setCustom = (i: number, patch: Partial<CustomField>) =>
    setConfig((c) => ({ ...c, customFields: c.customFields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) }));

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">รูปแบบหน้า</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {LAYOUTS.map((l) => (
              <button
                key={l.key}
                type="button"
                onClick={() => setConfig((c) => ({ ...c, layout: l.key }))}
                className={cn(
                  "rounded-xl border p-3 text-left text-sm",
                  config.layout === l.key ? "border-brand-navy ring-2 ring-brand-navy/20" : "border-slate-200 hover:border-slate-300",
                )}
              >
                <div className={cn("mb-2 flex h-12 gap-1", l.key === "stacked" && "flex-col")}>
                  <div className={cn("flex-1 rounded bg-brand-navy/70", l.key === "info-right" && "order-2")} />
                  <div className="flex-1 rounded bg-brand-navy/25" />
                </div>
                {l.label}
              </button>
            ))}
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={config.showMap} onChange={(e) => setConfig((c) => ({ ...c, showMap: e.target.checked }))} />
            แสดงแผนที่ Google Maps (จาก การตั้งค่า → ข้อมูลติดต่อ)
          </label>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">ช่องมาตรฐาน</h2>
          <div className="flex flex-col divide-y divide-slate-100">
            {(Object.keys(FIELD_LABELS) as StandardField[]).map((key) => {
              const f = config.fields[key];
              const locked = LOCKED_FIELDS.includes(key);
              return (
                <div key={key} className="flex flex-wrap items-center gap-4 py-3">
                  <span className="w-32 text-sm font-medium text-slate-700">{FIELD_LABELS[key]}</span>
                  <label className={cn("flex items-center gap-1.5 text-sm", locked && "opacity-50")}>
                    <input type="checkbox" checked={f.enabled} disabled={locked} onChange={(e) => setField(key, { enabled: e.target.checked })} />
                    แสดง
                  </label>
                  <label className={cn("flex items-center gap-1.5 text-sm", (locked || !f.enabled) && "opacity-50")}>
                    <input type="checkbox" checked={f.required} disabled={locked || !f.enabled} onChange={(e) => setField(key, { required: e.target.checked })} />
                    บังคับกรอก
                  </label>
                  {key !== "message" && (
                    <select
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={f.validation}
                      disabled={!f.enabled}
                      onChange={(e) => setField(key, { validation: e.target.value as Validation })}
                      aria-label={`รูปแบบ ${FIELD_LABELS[key]}`}
                    >
                      {VALIDATION_OPTIONS.map((v) => (
                        <option key={v.value} value={v.value}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {locked && <span className="text-xs text-slate-400">จำเป็นเสมอ</span>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">ช่องเพิ่มเติม ({config.customFields.length}/20)</h2>
            <button
              type="button"
              disabled={config.customFields.length >= 20}
              onClick={() =>
                setConfig((c) => ({
                  ...c,
                  customFields: [
                    ...c.customFields,
                    { id: crypto.randomUUID().slice(0, 8), labelTh: "", labelEn: "", type: "text", options: "", required: false, validation: "none" },
                  ],
                }))
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              เพิ่มช่อง
            </button>
          </div>
          {config.customFields.length === 0 && <p className="py-4 text-center text-sm text-slate-400">ยังไม่มีช่องเพิ่มเติม</p>}
          <div className="flex flex-col gap-3">
            {config.customFields.map((f, i) => (
              <div key={f.id} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 p-4 sm:grid-cols-2">
                <input className={inputClass} placeholder="ชื่อช่อง (ไทย)" value={f.labelTh} onChange={(e) => setCustom(i, { labelTh: e.target.value })} />
                <input className={inputClass} placeholder="Label (EN)" value={f.labelEn} onChange={(e) => setCustom(i, { labelEn: e.target.value })} />
                <select className={inputClass} value={f.type} onChange={(e) => setCustom(i, { type: e.target.value as CustomField["type"] })}>
                  <option value="text">ข้อความ</option>
                  <option value="select">ตัวเลือก (Dropdown)</option>
                  <option value="checkbox">Checkbox</option>
                </select>
                {f.type === "text" ? (
                  <select className={inputClass} value={f.validation} onChange={(e) => setCustom(i, { validation: e.target.value as Validation })}>
                    {VALIDATION_OPTIONS.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div />
                )}
                {f.type === "select" && (
                  <textarea
                    rows={3}
                    className={cn(inputClass, "sm:col-span-2")}
                    placeholder="ตัวเลือก บรรทัดละ 1 ตัวเลือก"
                    value={f.options}
                    onChange={(e) => setCustom(i, { options: e.target.value })}
                  />
                )}
                <div className="flex items-center justify-between sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-sm text-slate-700">
                    <input type="checkbox" checked={f.required} onChange={(e) => setCustom(i, { required: e.target.checked })} />
                    บังคับกรอก
                  </label>
                  <button
                    type="button"
                    aria-label="ลบช่อง"
                    onClick={() => setConfig((c) => ({ ...c, customFields: c.customFields.filter((_, idx) => idx !== i) }))}
                    className="rounded p-1.5 text-red-500 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input type="checkbox" className="mt-1" checked={marketingEligible} onChange={(e) => setMarketingEligible(e.target.checked)} />
            <span>
              <span className="font-semibold text-slate-900">ใช้หน้าติดต่อกับการตลาด / Pixel ได้ (Meta, TikTok)</span>
              <br />
              ติ๊กเมื่อยืนยันแล้วว่าฟอร์มนี้เป็นการติดต่อธุรกิจทั่วไป ไม่ได้เก็บข้อมูลสุขภาพ — ถ้าแก้ช่องในฟอร์มภายหลัง ระบบจะปิดค่านี้อัตโนมัติจนกว่าจะตรวจทานและติ๊กใหม่
            </span>
          </label>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <SaveButton
          onSave={async () => {
            setError(null);
            const res = await saveContactConfig(config, marketingEligible);
            if (res.error) {
              setError(res.error);
              throw new Error(res.error);
            }
          }}
        />
      </div>

      <div className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-sm xl:sticky xl:top-4">
        <p className="mb-4 text-sm font-medium text-slate-600">ตัวอย่างฟอร์ม (ส่งจริงไม่ได้จากหน้านี้)</p>
        <div className="pointer-events-none opacity-90">
          <ContactForm config={config} />
        </div>
      </div>
    </div>
  );
}
