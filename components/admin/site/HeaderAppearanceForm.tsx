"use client";

import { useState } from "react";
import { SaveButton } from "@/components/admin/SaveButton";
import { Toggle } from "@/components/admin/Toggle";
import { ChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { saveHeaderConfig, type HeaderConfigInput } from "@/app/admin/site/header/actions";
import type { NavLink } from "@/data/nav";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
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

const SUBMENU_CHILD_OPTIONS = [
  { value: "below-parent", label: "ต่อลงมาใต้หัวข้อ", desc: "แสดงเมนูลูกแบบย่ออยู่ใต้หัวข้อแม่" },
  { value: "open-right", label: "คลิกแล้วเปิดด้านขวา", desc: "คลิกหัวข้อแล้วเปิดเมนูลูกออกด้านขวา" },
  { value: "full-vertical", label: "เปิดยาวตรงลงมา", desc: "แสดงเมนูลูกเป็นรายการเต็มแนวตั้ง" },
];

export function HeaderAppearanceForm({
  initial,
  navLinks,
}: {
  initial: HeaderConfigInput;
  navLinks: NavLink[];
}) {
  const [form, setForm] = useState(initial);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [activePreview, setActivePreview] = useState(0);

  const update = <K extends keyof HeaderConfigInput>(key: K, value: HeaderConfigInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const heightPx = form.height === "compact" ? 56 : form.height === "tall" ? 88 : 72;
  const shadowClass = form.shadow === "none" ? "" : form.shadow === "soft" ? "shadow-sm" : "shadow-md";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">รูปแบบ Header / Menu</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>รูปแบบการวาง</label>
            <select className={inputClass} value={form.layout} onChange={(e) => update("layout", e.target.value)}>
              <option value="logo-left-menu-center">Logo ซ้าย / Menu กลาง</option>
              <option value="logo-left-menu-right">Logo ซ้าย / Menu ขวา</option>
              <option value="logo-center-menu-below">Logo กลาง / Menu ด้านล่าง</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>ความสูง</label>
            <select className={inputClass} value={form.height} onChange={(e) => update("height", e.target.value)}>
              <option value="compact">Compact</option>
              <option value="standard">Standard</option>
              <option value="tall">Tall</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>เงา</label>
            <select className={inputClass} value={form.shadow} onChange={(e) => update("shadow", e.target.value)}>
              <option value="none">ไม่มี</option>
              <option value="soft">นุ่ม</option>
              <option value="strong">ชัด</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>ตำแหน่ง</label>
            <select className={inputClass} value={form.position} onChange={(e) => update("position", e.target.value)}>
              <option value="fixed-top">Fixed ติดด้านบน</option>
              <option value="static">อยู่กับที่ (เลื่อนตามหน้า)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">สี Header และสถานะเมนู</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField label="พื้นหลัง Header" value={form.bgColor} onChange={(v) => update("bgColor", v)} />
          <ColorField label="ตัวอักษร Header" value={form.textColor} onChange={(v) => update("textColor", v)} />
          <ColorField label="พื้นหลัง Hover" value={form.hoverBgColor} onChange={(v) => update("hoverBgColor", v)} />
          <ColorField label="ตัวอักษร Hover" value={form.hoverTextColor} onChange={(v) => update("hoverTextColor", v)} />
          <ColorField label="พื้นหลัง Active" value={form.activeBgColor} onChange={(v) => update("activeBgColor", v)} />
          <ColorField label="ตัวอักษร Active" value={form.activeTextColor} onChange={(v) => update("activeTextColor", v)} />
          <ColorField label="Icon / Logo Text" value={form.iconTextColor} onChange={(v) => update("iconTextColor", v)} />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Logo</h2>
        <div>
          <label className={labelClass}>รูปแบบ Logo</label>
          <select className={inputClass} value={form.logoMode} onChange={(e) => update("logoMode", e.target.value)}>
            <option value="site-settings">ใช้รูป Logo จาก Site Settings</option>
            <option value="text-only">แสดงเฉพาะ Logo Text</option>
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Logo Text (TH)</label>
            <input className={inputClass} value={form.logoTextTh} onChange={(e) => update("logoTextTh", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Logo Text (EN)</label>
            <input className={inputClass} value={form.logoTextEn} onChange={(e) => update("logoTextEn", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Menu และ Sub-menu</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>การตัดบรรทัด</label>
            <select className={inputClass} value={form.menuWrap} onChange={(e) => update("menuWrap", e.target.value)}>
              <option value="single-line">บรรทัดเดียว (เลื่อนได้)</option>
              <option value="wrap">ตัดบรรทัดอัตโนมัติ</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>ขนาดตัวอักษร</label>
            <select className={inputClass} value={form.menuFontSize} onChange={(e) => update("menuFontSize", e.target.value)}>
              <option value="small">เล็ก</option>
              <option value="normal">ปกติ</option>
              <option value="large">ใหญ่</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>จำนวนลำดับ</label>
            <select
              className={inputClass}
              value={form.menuLevels}
              onChange={(e) => update("menuLevels", Number(e.target.value))}
            >
              <option value={1}>1 ลำดับ</option>
              <option value={2}>2 ลำดับ</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>รูปแบบ Sub-menu หลัก</label>
            <select
              className={inputClass}
              value={form.submenuStyle}
              onChange={(e) => update("submenuStyle", e.target.value)}
            >
              <option value="click-open">คลิกแล้วเปิด</option>
              <option value="hover-open">ชี้เมาส์แล้วเปิด</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 p-4">
          <p className="mb-3 text-sm font-medium text-slate-700">เมนูลำดับที่ 2 / เมนูลูกของ Sub-menu</p>
          <div className="flex flex-col gap-2">
            {SUBMENU_CHILD_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "cursor-pointer rounded-lg border px-4 py-3 transition-colors",
                  form.submenuChildBehavior === opt.value
                    ? "border-brand-navy bg-brand-navy/5"
                    : "border-slate-200 hover:bg-slate-50"
                )}
              >
                <input
                  type="radio"
                  name="submenuChildBehavior"
                  className="sr-only"
                  checked={form.submenuChildBehavior === opt.value}
                  onChange={() => update("submenuChildBehavior", opt.value)}
                />
                <span className="block text-sm font-medium text-slate-800">{opt.label}</span>
                <span className="block text-xs text-slate-400">{opt.desc}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">สิ่งที่แสดงใน Header</h2>
        <p className="-mt-2 text-xs text-slate-400">
          หมายเหตุ: Search / Account / Cart เป็นสวิตช์เตรียมไว้สำหรับเมื่อฟีเจอร์เหล่านั้นถูกสร้างขึ้นจริงในเว็บไซต์
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              { key: "showSearch", label: "Search" },
              { key: "showLanguage", label: "ภาษา" },
              { key: "showAccount", label: "Account" },
              { key: "showCart", label: "Cart" },
            ] as const
          ).map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3"
            >
              <input
                type="checkbox"
                checked={form[item.key]}
                onChange={(e) => update(item.key, e.target.checked)}
                className="h-4 w-4 accent-brand-navy"
              />
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Live Preview</p>
            <p className="text-xs text-slate-400">คลิกเมนูเพื่อทดสอบ active / submenu</p>
          </div>
          <div className="flex overflow-hidden rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setPreviewMode("desktop")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium",
                previewMode === "desktop" ? "bg-brand-navy text-white" : "bg-white text-slate-600"
              )}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("mobile")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium",
                previewMode === "mobile" ? "bg-brand-navy text-white" : "bg-white text-slate-600"
              )}
            >
              Mobile
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 text-xs text-slate-400">yourdomain.com</span>
          </div>
          <div
            className={cn("overflow-x-auto bg-white transition-all", previewMode === "mobile" ? "max-w-[380px]" : "w-full")}
          >
            <div
              className={cn("flex items-center justify-between gap-4 px-4", shadowClass)}
              style={{ height: heightPx, backgroundColor: form.bgColor, color: form.textColor }}
            >
              <span className="shrink-0 whitespace-nowrap text-sm font-bold" style={{ color: form.iconTextColor }}>
                {form.logoTextTh || "Millimed BFS"}
              </span>
              <nav
                className={cn(
                  "flex items-center gap-1",
                  form.menuWrap === "wrap" ? "flex-wrap justify-end" : "flex-nowrap overflow-x-auto"
                )}
              >
                {navLinks.map((link, i) => {
                  const active = i === activePreview;
                  return (
                    <button
                      key={link.href}
                      type="button"
                      onClick={() => setActivePreview(i)}
                      className={cn(
                        "flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 transition-colors",
                        form.menuFontSize === "small" && "text-xs",
                        form.menuFontSize === "normal" && "text-sm",
                        form.menuFontSize === "large" && "text-base"
                      )}
                      style={
                        active
                          ? { backgroundColor: form.activeBgColor, color: form.activeTextColor }
                          : { color: form.textColor }
                      }
                      onMouseEnter={(e) => {
                        if (active) return;
                        e.currentTarget.style.backgroundColor = form.hoverBgColor;
                        e.currentTarget.style.color = form.hoverTextColor;
                      }}
                      onMouseLeave={(e) => {
                        if (active) return;
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = form.textColor;
                      }}
                    >
                      {link.label}
                      {link.children && <ChevronDown className="h-3 w-3" />}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="flex min-h-[60px] items-center justify-center text-xs text-slate-300">
              พื้นที่เนื้อหาหน้าเว็บ
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton label="บันทึก" onSave={() => saveHeaderConfig(form)} />
      </div>
    </div>
  );
}
