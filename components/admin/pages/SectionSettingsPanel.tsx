"use client";

import { DatabaseIcon, CheckIcon } from "@/components/ui/admin-icons";
import { SaveButton } from "@/components/admin/SaveButton";
import type { PageSection, DeviceVisibility } from "@/data/admin-pages";
import { articles } from "@/data/articles";
import { newsItems } from "@/data/news";

function matchedCountFor(section: PageSection) {
  if (section.type === "articles") return articles.length;
  if (section.type === "latest-news") return newsItems.length;
  return section.matchedCount ?? 0;
}

export function SectionSettingsPanel({
  section,
  onChange,
}: {
  section: PageSection;
  onChange: (patch: Partial<PageSection>) => void;
}) {
  const hasDataBinding = section.type === "articles" || section.type === "latest-news";
  const matched = matchedCountFor(section);

  const toggleVisibility = (key: keyof DeviceVisibility) => {
    onChange({ visibility: { ...section.visibility, [key]: !section.visibility[key] } });
  };

  return (
    <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-6">
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">การแสดงผลตามอุปกรณ์</p>
          <p className="text-xs text-slate-400">เลือกว่าจะให้ section นี้แสดงบนหน้าจอแบบไหน</p>
        </div>
        <div className="flex items-center gap-4">
          {(
            [
              ["desktop", "Desktop"],
              ["tablet", "Tablet"],
              ["mobile", "Mobile"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={section.visibility[key]}
                onChange={() => toggleVisibility(key)}
                className="h-4 w-4 rounded border-slate-300 text-brand-navy focus:ring-brand-navy"
              />
              {label}
            </label>
          ))}
          <SaveButton label="บันทึกการแสดงผล" />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <p className="text-base font-semibold text-slate-800">{section.titleTh}</p>
          {hasDataBinding && (
            <p className="text-xs text-slate-400">ดึงข้อมูลจาก {section.sourceLabel} มาแสดงอัตโนมัติ</p>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-brand-navy/30 bg-brand-navy/5 px-4 py-2.5 text-sm font-medium text-brand-navy">
          <DatabaseIcon className="h-4 w-4" />
          แหล่งข้อมูล: {section.sourceLabel}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">หัวข้อ Section (TH)</label>
            <input
              type="text"
              value={section.titleTh}
              onChange={(e) => onChange({ titleTh: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">หัวข้อ Section (EN)</label>
            <input
              type="text"
              value={section.titleEn}
              onChange={(e) => onChange({ titleEn: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
            />
          </div>
        </div>

        {hasDataBinding && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">เงื่อนไขการดึงข้อมูล</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy sm:max-w-xs"
                defaultValue={section.type === "articles" ? "articles" : "news"}
              >
                <option value="articles">บทความ</option>
                <option value="news">ข่าวสาร</option>
              </select>
            </div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckIcon className="h-4 w-4" />
              พบ {matched} รายการตรงเงื่อนไข
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">จำนวนรายการที่แสดง</label>
                <input
                  type="number"
                  min={1}
                  max={matched}
                  value={section.itemsToShow ?? matched}
                  onChange={(e) => onChange({ itemsToShow: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
                />
              </div>
              {section.columns !== undefined && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">คอลัมน์ต่อแถว</label>
                  <select
                    value={section.columns}
                    onChange={(e) => onChange({ columns: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} คอลัมน์
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <p className="text-sm font-medium text-slate-600">
              ตัวอย่างรายการที่จะแสดงจริง ({section.itemsToShow ?? matched} รายการ)
            </p>
          </>
        )}

        <div className="flex justify-end">
          <SaveButton />
        </div>
      </div>
    </div>
  );
}
