"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SaveButton } from "@/components/admin/SaveButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { PopupCard, POPUP_ANIMATIONS } from "@/components/layout/PopupView";
import { createPopup, updatePopup, type PopupInput } from "@/app/admin/site/popup/actions";

const inputClass = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export const EMPTY_POPUP: PopupInput = {
  titleTh: "",
  titleEn: "",
  bodyTh: "",
  bodyEn: "",
  imageUrl: "",
  buttonLabelTh: "",
  buttonLabelEn: "",
  link: "",
  openInNewTab: false,
  layout: "image-top",
  animation: "zoom",
  size: "md",
  delaySeconds: 1,
  frequency: "once_per_session",
  homeOnly: true,
  status: "DRAFT",
  active: true,
  startDate: "",
  endDate: "",
};

/** Create / edit one popup with a live preview (legacy AdminPopups editor + PopupPreview). */
export function PopupForm({ id, initial, canPublish }: { id?: string; initial: PopupInput; canPublish: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"th" | "en">("th");
  const [replay, setReplay] = useState(0);
  const set = <K extends keyof PopupInput>(k: K, v: PopupInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setError(null);
    const res = id ? await updatePopup(id, form) : await createPopup(form);
    if (res.error) {
      setError(res.error);
      throw new Error(res.error);
    }
    if (!id && "id" in res && res.id) router.push(`/admin/site/popup/${res.id}`);
    else router.refresh();
  };

  const select = <K extends keyof PopupInput>(key: K, label: string, options: [string, string][]) => (
    <div>
      <label className={labelClass}>{label}</label>
      <select className={inputClass} value={String(form[key])} onChange={(e) => set(key, e.target.value as PopupInput[K])}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );

  const previewItem = {
    id: "preview",
    titleTh: form.titleTh || null,
    titleEn: form.titleEn || null,
    bodyTh: form.bodyTh || null,
    bodyEn: form.bodyEn || null,
    imageUrl: form.imageUrl || null,
    buttonLabelTh: form.buttonLabelTh || null,
    buttonLabelEn: form.buttonLabelEn || null,
    link: form.link || "#",
    openInNewTab: false,
    layout: form.layout,
    animation: form.animation,
    size: form.size,
    delaySeconds: 0,
    frequency: "always",
    homeOnly: false,
    startDate: null,
    endDate: null,
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_460px]">
      <div className="flex flex-col gap-6">
        <section className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:grid-cols-2">
          <h2 className="text-sm font-semibold text-slate-800 sm:col-span-2">เนื้อหา</h2>
          <div className="sm:col-span-2">
            <ImageUploader label="รูปภาพ" value={form.imageUrl ?? ""} onChange={(url) => set("imageUrl", url)} />
          </div>
          <div>
            <label className={labelClass}>หัวข้อ (TH)</label>
            <input className={inputClass} value={form.titleTh} onChange={(e) => set("titleTh", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>หัวข้อ (EN)</label>
            <input className={inputClass} value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>ข้อความ (TH)</label>
            <textarea rows={3} className={inputClass} value={form.bodyTh} onChange={(e) => set("bodyTh", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>ข้อความ (EN)</label>
            <textarea rows={3} className={inputClass} value={form.bodyEn} onChange={(e) => set("bodyEn", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>ข้อความปุ่ม (TH)</label>
            <input className={inputClass} value={form.buttonLabelTh} onChange={(e) => set("buttonLabelTh", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>ข้อความปุ่ม (EN)</label>
            <input className={inputClass} value={form.buttonLabelEn} onChange={(e) => set("buttonLabelEn", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>ลิงก์</label>
            <input className={inputClass} placeholder="/products หรือ https://..." value={form.link} onChange={(e) => set("link", e.target.value)} />
            <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={form.openInNewTab} onChange={(e) => set("openInNewTab", e.target.checked)} />
              เปิดในแท็บใหม่
            </label>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:grid-cols-3">
          <h2 className="text-sm font-semibold text-slate-800 sm:col-span-3">รูปแบบและการแสดงผล</h2>
          {select("layout", "การจัดวาง", [
            ["image-top", "รูปด้านบน"],
            ["image-left", "รูปด้านซ้าย"],
            ["image-only", "รูปอย่างเดียว"],
            ["text-only", "ข้อความอย่างเดียว"],
          ])}
          {select("animation", "เอฟเฟกต์", [
            ["fade", "Fade"],
            ["zoom", "Zoom"],
            ["slide-up", "Slide up"],
            ["slide-down", "Slide down"],
            ["bounce", "Bounce"],
          ])}
          {select("size", "ขนาด", [
            ["sm", "เล็ก"],
            ["md", "กลาง"],
            ["lg", "ใหญ่"],
          ])}
          {select("frequency", "ความถี่", [
            ["always", "ทุกครั้งที่เข้า"],
            ["once_per_session", "ครั้งเดียวต่อการเข้าชม"],
            ["once_per_day", "วันละครั้ง"],
          ])}
          <div>
            <label className={labelClass}>หน่วงเวลาก่อนแสดง (วินาที)</label>
            <input type="number" min={0} max={60} className={inputClass} value={form.delaySeconds} onChange={(e) => set("delaySeconds", Math.max(0, Number(e.target.value) || 0))} />
          </div>
          <div className="flex flex-col justify-end gap-2 pb-2">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={form.homeOnly} onChange={(e) => set("homeOnly", e.target.checked)} />
              แสดงเฉพาะหน้าแรก
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
              เปิดใช้งาน
            </label>
          </div>
          <div>
            <label className={labelClass}>เริ่มแสดง</label>
            <input type="date" className={inputClass} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>สิ้นสุด</label>
            <input type="date" className={inputClass} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>สถานะ</label>
            <select className={inputClass} value={canPublish ? form.status : "DRAFT"} disabled={!canPublish} onChange={(e) => set("status", e.target.value as PopupInput["status"])}>
              <option value="DRAFT">ฉบับร่าง</option>
              <option value="PUBLISHED">เผยแพร่</option>
            </select>
            {!canPublish && <p className="mt-1 text-xs text-amber-600">Contributor บันทึกได้เฉพาะฉบับร่าง</p>}
          </div>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <SaveButton label={id ? "บันทึกการเปลี่ยนแปลง" : "สร้าง Popup"} onSave={save} />
      </div>

      <div className="h-fit rounded-2xl border border-slate-100 bg-white p-4 shadow-sm xl:sticky xl:top-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">ตัวอย่าง</p>
          <div className="flex gap-1 text-xs">
            {(["th", "en"] as const).map((l) => (
              <button key={l} type="button" onClick={() => setLang(l)} className={`rounded px-2 py-1 ${lang === l ? "bg-brand-navy text-white" : "text-slate-500"}`}>
                {l.toUpperCase()}
              </button>
            ))}
            <button type="button" onClick={() => setReplay((r) => r + 1)} className="rounded px-2 py-1 text-brand-navy hover:bg-slate-100">
              เล่นเอฟเฟกต์
            </button>
          </div>
        </div>
        <div className="flex min-h-80 items-center justify-center rounded-xl bg-slate-800/60 p-4">
          <AnimatePresence mode="wait">
            <motion.div key={`${replay}-${form.animation}`} {...(POPUP_ANIMATIONS[form.animation] ?? POPUP_ANIMATIONS.zoom)} className="flex w-full justify-center">
              <PopupCard popup={previewItem} lang={lang} onClose={() => {}} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
