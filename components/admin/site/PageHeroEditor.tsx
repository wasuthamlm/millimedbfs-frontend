"use client";

import { useState } from "react";
import { SaveButton } from "@/components/admin/SaveButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { PageHeroView } from "@/components/site/PageHeroView";
import { HERO_DEFAULTS, HERO_MODES, type PageHeroConfig } from "@/lib/page-hero";
import { savePageHeroConfig } from "@/app/admin/site/page-hero/actions";

const inputClass = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-500";

function ColorInput({ label, value, onChange, allowEmpty }: { label: string; value: string; onChange: (v: string) => void; allowEmpty?: boolean }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#ffffff"} onChange={(e) => onChange(e.target.value)} className="h-9 w-11 rounded border border-slate-200 p-1" />
        <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} placeholder={allowEmpty ? "เว้นว่าง = ตามสีหัวข้อ" : undefined} />
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, max = 600 }: { label: string; value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div>
      <label className={labelClass}>
        {label}: {value}
        {max === 100 ? "%" : "px"}
      </label>
      <input type="range" min={0} max={max} step={max === 100 ? 5 : 4} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </div>
  );
}

/** Global page-hero controls with live preview (legacy PageHeroControls + PageHeroPreview). */
export function PageHeroEditor({ initial }: { initial: PageHeroConfig }) {
  const [cfg, setCfg] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof PageHeroConfig>(k: K, v: PageHeroConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div>
          <label className={labelClass}>รูปแบบพื้นหลัง</label>
          <select className={inputClass} value={cfg.mode} onChange={(e) => set("mode", e.target.value as PageHeroConfig["mode"])}>
            {HERO_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {cfg.mode !== "none" && (
          <>
            <ColorInput label={cfg.mode === "gradient" ? "สีเริ่มต้น" : "สีพื้นหลัง"} value={cfg.bgColor} onChange={(v) => set("bgColor", v)} />
            {cfg.mode === "gradient" && <ColorInput label="สีปลายทาง" value={cfg.bgColorTo} onChange={(v) => set("bgColorTo", v)} />}
            {cfg.mode === "pattern" && (
              <>
                <div>
                  <label className={labelClass}>ลวดลาย</label>
                  <select className={inputClass} value={cfg.pattern} onChange={(e) => set("pattern", e.target.value as PageHeroConfig["pattern"])}>
                    <option value="dots">จุด</option>
                    <option value="grid">ตาราง</option>
                    <option value="diagonal">เส้นทแยง</option>
                    <option value="waves">ลายคลื่น</option>
                  </select>
                </div>
                <ColorInput label="สีลวดลาย" value={cfg.patternColor} onChange={(v) => set("patternColor", v)} />
                <NumberInput label="ความเข้มลวดลาย" value={cfg.patternOpacity} onChange={(v) => set("patternOpacity", v)} max={100} />
              </>
            )}
            {cfg.mode === "image" && (
              <>
                <ImageUploader label="รูปพื้นหลัง" value={cfg.imageUrl} onChange={(url) => set("imageUrl", url)} />
                <ColorInput label="สี overlay" value={cfg.overlayColor} onChange={(v) => set("overlayColor", v)} />
                <NumberInput label="ความทึบ overlay" value={cfg.overlayOpacity} onChange={(v) => set("overlayOpacity", v)} max={100} />
              </>
            )}
            <div>
              <label className={labelClass}>ขอบจางหาย (fade)</label>
              <select className={inputClass} value={cfg.fadeEdge} onChange={(e) => set("fadeEdge", e.target.value as PageHeroConfig["fadeEdge"])}>
                <option value="none">ไม่มี</option>
                <option value="top">ด้านบน</option>
                <option value="bottom">ด้านล่าง</option>
                <option value="both">บน + ล่าง</option>
              </select>
            </div>
            {cfg.fadeEdge !== "none" && <ColorInput label="สีที่จางเข้าไป" value={cfg.fadeColor} onChange={(v) => set("fadeColor", v)} />}
            <ColorInput label="สีหัวข้อ" value={cfg.titleColor} onChange={(v) => set("titleColor", v)} />
            <ColorInput label="สีคำอธิบาย" value={cfg.subtitleColor} onChange={(v) => set("subtitleColor", v)} allowEmpty />
            <div>
              <label className={labelClass}>จัดตำแหน่ง</label>
              <select className={inputClass} value={cfg.align} onChange={(e) => set("align", e.target.value as PageHeroConfig["align"])}>
                <option value="center">กลาง</option>
                <option value="left">ซ้าย</option>
              </select>
            </div>
            <NumberInput label="ความสูงขั้นต่ำ" value={cfg.minHeight} onChange={(v) => set("minHeight", v)} />
            <NumberInput label="ระยะบน-ล่าง" value={cfg.paddingY} onChange={(v) => set("paddingY", v)} max={200} />
            <NumberInput label="ระยะซ้าย-ขวา" value={cfg.paddingX} onChange={(v) => set("paddingX", v)} max={200} />
            <NumberInput label="ขอบนอกด้านบน" value={cfg.marginTop} onChange={(v) => set("marginTop", v)} max={200} />
            <NumberInput label="ขอบนอกด้านล่าง" value={cfg.marginBottom} onChange={(v) => set("marginBottom", v)} max={200} />
          </>
        )}

        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex items-center gap-3">
          <SaveButton
            onSave={async () => {
              setError(null);
              const res = await savePageHeroConfig(cfg);
              if (res.error) {
                setError(res.error);
                throw new Error(res.error);
              }
            }}
          />
          <button type="button" onClick={() => setCfg(HERO_DEFAULTS)} className="text-sm text-slate-500 hover:text-slate-700">
            คืนค่าเริ่มต้น
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-slate-600">ตัวอย่าง</p>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {cfg.mode === "none" ? (
            <p className="py-16 text-center text-sm text-slate-400">ส่วนหัวถูกซ่อนในทุกหน้า</p>
          ) : (
            <PageHeroView config={cfg} title="เกี่ยวกับเรา" subtitle="มิลลิเมด บีเอฟเอส — ผู้ผลิตยาและผลิตภัณฑ์ดูแลดวงตา" />
          )}
          <div className="space-y-2 p-6">
            <div className="h-3 w-3/4 rounded bg-slate-100" />
            <div className="h-3 w-2/3 rounded bg-slate-100" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
