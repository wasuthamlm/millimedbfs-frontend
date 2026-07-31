"use client";

import { useState } from "react";
import Image from "next/image";
import { Toggle } from "@/components/admin/Toggle";
import { SaveButton } from "@/components/admin/SaveButton";
import { popupConfig as initialConfig, type PopupFrequency } from "@/data/admin-popup";

const frequencyLabels: Record<PopupFrequency, string> = {
  "every-visit": "ทุกครั้งที่เข้าชม",
  "once-per-day": "วันละ 1 ครั้ง",
  "once-per-session": "ครั้งเดียวต่อเซสชัน",
};

export function PopupManager() {
  const [config, setConfig] = useState(initialConfig);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">เปิดใช้งาน Popup</p>
            <p className="text-xs text-slate-400">แสดง Popup นี้บนหน้าเว็บสาธารณะ</p>
          </div>
          <Toggle
            checked={config.enabled}
            onChange={(v) => setConfig({ ...config, enabled: v })}
            label="เปิดใช้งาน Popup"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
          <div className="relative h-32 overflow-hidden rounded-lg bg-slate-100">
            <Image src={config.image} alt={config.titleTh} fill className="object-cover" />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">หัวข้อ Popup</label>
              <input
                type="text"
                value={config.titleTh}
                onChange={(e) => setConfig({ ...config, titleTh: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">ลิงก์ปลายทาง</label>
              <input
                type="text"
                value={config.link}
                onChange={(e) => setConfig({ ...config, link: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-slate-500 outline-none focus:border-brand-navy"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">ความถี่ในการแสดง</label>
            <select
              value={config.frequency}
              onChange={(e) => setConfig({ ...config, frequency: e.target.value as PopupFrequency })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
            >
              {(Object.keys(frequencyLabels) as PopupFrequency[]).map((key) => (
                <option key={key} value={key}>
                  {frequencyLabels[key]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">วันที่เริ่มแสดง</label>
            <input
              type="date"
              value={config.startDate}
              onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">วันที่สิ้นสุด</label>
            <input
              type="date"
              value={config.endDate}
              onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton />
      </div>
    </div>
  );
}
