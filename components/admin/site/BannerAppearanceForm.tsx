"use client";

import { useState } from "react";
import { SaveButton } from "@/components/admin/SaveButton";
import { Toggle } from "@/components/admin/Toggle";
import { saveBannerConfig, type BannerConfigInput } from "@/app/admin/site/banners/actions";

const labelClass = "mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700";

type ToggleKey = "autoplay" | "loop" | "pauseOnHover" | "showArrows" | "showDots";

export function BannerAppearanceForm({ initial }: { initial: BannerConfigInput }) {
  const [form, setForm] = useState(initial);

  const update = <K extends keyof BannerConfigInput>(key: K, value: BannerConfigInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleRow = (key: ToggleKey, label: string, hint?: string) => (
    <div key={key} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="flex flex-col">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </span>
      <Toggle checked={form[key]} onChange={(v) => update(key, v)} label={label} />
    </div>
  );

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">การแสดงผลแบนเนอร์</h2>
        <p className="mt-1 text-xs text-slate-500">
          ผู้เข้าชมกดลูกศรหรือรูปย่อด้านล่างเพื่อเปลี่ยนภาพ รูปที่ไม่ได้เลือกจะแสดงเป็นรูปย่อจางๆ
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {toggleRow("showDots", "แสดงรูปย่อด้านล่าง (Thumbnails)")}
        {toggleRow("showArrows", "แสดงปุ่มลูกศร")}
        {toggleRow("loop", "วนซ้ำ (Loop)", "กดถัดไปที่ภาพสุดท้ายแล้วกลับไปภาพแรก")}
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
          className="w-full accent-brand-navy sm:w-1/2"
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
        {toggleRow("autoplay", "เปลี่ยนภาพอัตโนมัติ (Autoplay)", "ปิดไว้ = ผู้เข้าชมกดเปลี่ยนภาพเอง")}
        {form.autoplay && (
          <div className="grid gap-3 sm:grid-cols-2">
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
            {toggleRow("pauseOnHover", "หยุดเมื่อชี้เมาส์")}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <SaveButton onSave={() => saveBannerConfig({ ...form, transitionEffect: "fade" })} />
      </div>
    </div>
  );
}
