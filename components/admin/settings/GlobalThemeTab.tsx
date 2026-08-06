"use client";

import { useState } from "react";
import { SaveButton } from "@/components/admin/SaveButton";
import { Select } from "@/components/admin/Select";
import { saveGlobalTheme } from "@/app/admin/settings/actions";

export type GlobalThemeData = {
  fontHeader: string;
  fontBody: string;
  colorPrimary: string;
  colorPrimaryHover: string;
  colorAccent: string;
  colorBackground: string;
  colorText: string;
  buttonRadius: string;
};

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";
const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy";

const FONT_OPTIONS = [
  { value: "Prompt", label: "Prompt" },
  { value: "Sarabun", label: "Sarabun" },
  { value: "IBM Plex Sans Thai", label: "IBM Plex Sans Thai" },
  { value: "Inter", label: "Inter" },
];

export const BUTTON_RADIUS_OPTIONS = [
  { value: "sharp", label: "เหลี่ยมคม", description: "0px" },
  { value: "soft-sm", label: "เหลี่ยมมนเล็ก", description: "6px" },
  { value: "soft", label: "มนกลาง", description: "12px" },
  { value: "full", label: "กลมเต็ม", description: "9999px" },
];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-11 shrink-0 cursor-pointer rounded-md border border-slate-200 p-1"
        />
        <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export function GlobalThemeTab({ initial }: { initial: GlobalThemeData }) {
  const [form, setForm] = useState(initial);
  const update = <K extends keyof GlobalThemeData>(key: K, value: GlobalThemeData[K]) =>
    setForm((s) => ({ ...s, [key]: value }));

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Global Theme</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Font หัวข้อ / Header</label>
          <Select value={form.fontHeader} options={FONT_OPTIONS} onChange={(v) => update("fontHeader", v)} />
        </div>
        <div>
          <label className={labelClass}>Font ตัวอักษรธรรมดา / Body</label>
          <Select value={form.fontBody} options={FONT_OPTIONS} onChange={(v) => update("fontBody", v)} />
        </div>
        <ColorField label="สี Primary" value={form.colorPrimary} onChange={(v) => update("colorPrimary", v)} />
        <ColorField label="สี Primary ตอน Hover" value={form.colorPrimaryHover} onChange={(v) => update("colorPrimaryHover", v)} />
        <ColorField label="สี Accent / สีทอง" value={form.colorAccent} onChange={(v) => update("colorAccent", v)} />
        <ColorField label="สีพื้นหลังหลัก" value={form.colorBackground} onChange={(v) => update("colorBackground", v)} />
        <ColorField label="สีตัวอักษรหลัก" value={form.colorText} onChange={(v) => update("colorText", v)} />
        <div>
          <label className={labelClass}>ความโค้งของปุ่ม</label>
          <Select value={form.buttonRadius} options={BUTTON_RADIUS_OPTIONS} onChange={(v) => update("buttonRadius", v)} />
        </div>
      </div>
      <p className="text-xs text-slate-400">
        มีผลกับ: ฟอนต์หัวข้อ/เนื้อหาทั้งเว็บ, สีปุ่ม CTA หลัก (brand-navy / brand-gold), และความโค้งของปุ่ม CTA หลัก
      </p>
      <div>
        <SaveButton onSave={() => saveGlobalTheme(form).then(() => {})} />
      </div>
    </div>
  );
}
