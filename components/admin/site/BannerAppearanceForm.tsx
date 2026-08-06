"use client";

import { useState } from "react";
import { SaveButton } from "@/components/admin/SaveButton";
import { Toggle } from "@/components/admin/Toggle";
import { saveBannerConfig, type BannerConfigInput } from "@/app/admin/site/banners/actions";

const selectClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";
const labelClass = "mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700";

export function BannerAppearanceForm({ initial }: { initial: BannerConfigInput }) {
  const [form, setForm] = useState(initial);

  const update = <K extends keyof BannerConfigInput>(key: K, value: BannerConfigInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggles: { key: keyof BannerConfigInput; label: string }[] = [
    { key: "autoplay", label: "เล่นอัตโนมัติ (Autoplay)" },
    { key: "loop", label: "วนซ้ำ (Loop)" },
    { key: "pauseOnHover", label: "หยุดเมื่อชี้เมาส์" },
    { key: "showArrows", label: "แสดงปุ่มลูกศร" },
    { key: "showDots", label: "แสดงจุดนำทาง (Dots)" },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">เอฟเฟกต์และการเล่นสไลด์</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>เอฟเฟกต์การเปลี่ยนภาพ</label>
          <select
            className={selectClass}
            value={form.transitionEffect}
            onChange={(e) => update("transitionEffect", e.target.value)}
          >
            <option value="fade">จางหาย (Fade)</option>
            <option value="slide">เลื่อน (Slide)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>ทิศทาง (สำหรับ Slide)</label>
          <select
            className={selectClass}
            value={form.direction}
            onChange={(e) => update("direction", e.target.value)}
            disabled={form.transitionEffect !== "slide"}
          >
            <option value="ltr">ซ้าย → ขวา</option>
            <option value="rtl">ขวา → ซ้าย</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>ความเร็วเปลี่ยนภาพ ({form.transitionSpeedMs} ms)</label>
          <input
            type="range"
            min={200}
            max={1500}
            step={100}
            value={form.transitionSpeedMs}
            onChange={(e) => update("transitionSpeedMs", Number(e.target.value))}
            className="w-full accent-brand-navy"
          />
        </div>
        <div>
          <label className={labelClass}>เวลาแสดงต่อภาพ ({(form.displayDurationMs / 1000).toFixed(1)} วิ)</label>
          <input
            type="range"
            min={2000}
            max={10000}
            step={500}
            value={form.displayDurationMs}
            onChange={(e) => update("displayDurationMs", Number(e.target.value))}
            className="w-full accent-brand-navy"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {toggles.map((t) => (
          <div
            key={t.key}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
          >
            <span className="text-sm font-medium text-slate-700">{t.label}</span>
            <Toggle
              checked={Boolean(form[t.key])}
              onChange={(v) => update(t.key, v as never)}
              label={t.label}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <SaveButton onSave={() => saveBannerConfig(form)} />
      </div>
    </div>
  );
}
