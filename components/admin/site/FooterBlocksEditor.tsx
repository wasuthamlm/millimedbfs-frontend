"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SaveButton } from "@/components/admin/SaveButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ArrowDownIcon, ArrowUpIcon, EyeIcon, PlusIcon, TrashIcon } from "@/components/ui/admin-icons";
import {
  createFooterBlock,
  FOOTER_BLOCK_TYPES,
  type FooterAlign,
  type FooterBlock,
  type FooterBlocksConfig,
  type FooterBlockType,
} from "@/lib/footer-blocks";
import { saveFooterBlocks } from "@/app/admin/site/footer/actions";

const inputClass = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy";

/** Column/block builder for the footer (legacy AdminFooter + FooterBlockCard + AlignmentPicker). */
export function FooterBlocksEditor({ initial }: { initial: FooterBlocksConfig }) {
  const [config, setConfig] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  const updateBlock = (colId: string, blockId: string, patch: Partial<FooterBlock>) =>
    setConfig((c) => ({
      columns: c.columns.map((col) =>
        col.id !== colId ? col : { ...col, blocks: col.blocks.map((b) => (b.id === blockId ? ({ ...b, ...patch } as FooterBlock) : b)) },
      ),
    }));
  const setBlocks = (colId: string, fn: (blocks: FooterBlock[]) => FooterBlock[]) =>
    setConfig((c) => ({ columns: c.columns.map((col) => (col.id === colId ? { ...col, blocks: fn(col.blocks) } : col)) }));
  const moveBlock = (colId: string, i: number, dir: -1 | 1) =>
    setBlocks(colId, (blocks) => {
      const j = i + dir;
      if (j < 0 || j >= blocks.length) return blocks;
      const next = [...blocks];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const setColumnCount = (n: number) =>
    setConfig((c) => ({
      columns:
        n > c.columns.length
          ? [...c.columns, ...Array.from({ length: n - c.columns.length }, (_, k) => ({ id: `col-${c.columns.length + k + 1}`, blocks: [] }))]
          : c.columns.slice(0, n),
    }));

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">บล็อก Footer</h2>
          <p className="text-xs text-slate-400">ถ้ายังไม่มีบล็อก footer จะใช้คอลัมน์ลิงก์ด้านบนแทน — ที่อยู่/เบอร์/โซเชียล มาจากการตั้งค่า</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          จำนวนคอลัมน์
          <select className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={config.columns.length} onChange={(e) => setColumnCount(Number(e.target.value))}>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={cn("grid gap-4", config.columns.length >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2", config.columns.length === 4 && "xl:grid-cols-4")}>
        {config.columns.map((col, ci) => (
          <div key={col.id} className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3">
            <p className="text-xs font-semibold text-slate-500">คอลัมน์ {ci + 1}</p>
            {col.blocks.map((block, bi) => (
              <div key={block.id} className={cn("flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3", !block.visible && "opacity-60")}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-brand-navy">{FOOTER_BLOCK_TYPES.find((t) => t.type === block.type)?.label}</span>
                  <span className="flex gap-0.5">
                    <button type="button" aria-label={block.visible ? "ซ่อน" : "แสดง"} onClick={() => updateBlock(col.id, block.id, { visible: !block.visible })} className={cn("rounded p-1 hover:bg-slate-100", block.visible ? "text-slate-500" : "text-slate-300")}>
                      <EyeIcon className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" aria-label="เลื่อนขึ้น" onClick={() => moveBlock(col.id, bi, -1)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                      <ArrowUpIcon className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" aria-label="เลื่อนลง" onClick={() => moveBlock(col.id, bi, 1)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                      <ArrowDownIcon className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" aria-label="ลบบล็อก" onClick={() => setBlocks(col.id, (bs) => bs.filter((b) => b.id !== block.id))} className="rounded p-1 text-red-500 hover:bg-red-50">
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </div>
                <div className="flex gap-1">
                  {(["left", "center", "right"] as FooterAlign[]).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => updateBlock(col.id, block.id, { alignment: a })}
                      className={cn("flex-1 rounded border px-1 py-0.5 text-xs", block.alignment === a ? "border-brand-navy bg-brand-navy/5 text-brand-navy" : "border-slate-200 text-slate-500")}
                    >
                      {a === "left" ? "ซ้าย" : a === "center" ? "กลาง" : "ขวา"}
                    </button>
                  ))}
                </div>
                {block.type !== "logo_text" && (
                  <div className="grid grid-cols-2 gap-2">
                    <input className={inputClass} placeholder="หัวข้อ (TH)" value={block.titleTh} onChange={(e) => updateBlock(col.id, block.id, { titleTh: e.target.value })} />
                    <input className={inputClass} placeholder="Title (EN)" value={block.titleEn} onChange={(e) => updateBlock(col.id, block.id, { titleEn: e.target.value })} />
                  </div>
                )}
                {block.type === "logo_text" && (
                  <>
                    <ImageUploader label="โลโก้ (เว้นว่าง = โลโก้เว็บไซต์)" value={block.logoUrl} onChange={(url) => updateBlock(col.id, block.id, { logoUrl: url })} />
                    <textarea rows={2} className={inputClass} placeholder="คำอธิบาย (TH)" value={block.textTh} onChange={(e) => updateBlock(col.id, block.id, { textTh: e.target.value })} />
                    <textarea rows={2} className={inputClass} placeholder="Description (EN)" value={block.textEn} onChange={(e) => updateBlock(col.id, block.id, { textEn: e.target.value })} />
                  </>
                )}
                {block.type === "custom_text" && (
                  <>
                    <textarea rows={3} className={inputClass} placeholder="ข้อความ (TH)" value={block.textTh} onChange={(e) => updateBlock(col.id, block.id, { textTh: e.target.value })} />
                    <textarea rows={3} className={inputClass} placeholder="Text (EN)" value={block.textEn} onChange={(e) => updateBlock(col.id, block.id, { textEn: e.target.value })} />
                  </>
                )}
                {block.type === "contact" && (
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input type="checkbox" checked={block.showSocial} onChange={(e) => updateBlock(col.id, block.id, { showSocial: e.target.checked })} />
                    แสดงไอคอนโซเชียลด้วย
                  </label>
                )}
                {block.type === "social" && (
                  <select className={inputClass} value={block.iconSize} onChange={(e) => updateBlock(col.id, block.id, { iconSize: e.target.value as "sm" | "md" | "lg" })}>
                    <option value="sm">ไอคอนเล็ก</option>
                    <option value="md">ไอคอนกลาง</option>
                    <option value="lg">ไอคอนใหญ่</option>
                  </select>
                )}
                {block.type === "links" && (
                  <div className="flex flex-col gap-2">
                    {block.items.map((item, ii) => (
                      <div key={ii} className="grid grid-cols-[1fr_1fr_auto] gap-1">
                        <input className={inputClass} placeholder="ชื่อ (TH)" value={item.labelTh} onChange={(e) => updateBlock(col.id, block.id, { items: block.items.map((x, k) => (k === ii ? { ...x, labelTh: e.target.value } : x)) })} />
                        <input className={inputClass} placeholder="/path" value={item.url} onChange={(e) => updateBlock(col.id, block.id, { items: block.items.map((x, k) => (k === ii ? { ...x, url: e.target.value } : x)) })} />
                        <button type="button" aria-label="ลบลิงก์" onClick={() => updateBlock(col.id, block.id, { items: block.items.filter((_, k) => k !== ii) })} className="rounded p-1 text-red-500 hover:bg-red-50">
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                        <input className={cn(inputClass, "col-span-2")} placeholder="Label (EN)" value={item.labelEn} onChange={(e) => updateBlock(col.id, block.id, { items: block.items.map((x, k) => (k === ii ? { ...x, labelEn: e.target.value } : x)) })} />
                      </div>
                    ))}
                    <button type="button" onClick={() => updateBlock(col.id, block.id, { items: [...block.items, { labelTh: "", labelEn: "", url: "" }] })} className="text-left text-xs text-brand-navy hover:underline">
                      + เพิ่มลิงก์
                    </button>
                  </div>
                )}
              </div>
            ))}
            {adding === col.id ? (
              <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-2">
                {FOOTER_BLOCK_TYPES.map((t) => (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => {
                      setBlocks(col.id, (bs) => [...bs, createFooterBlock(t.type as FooterBlockType)]);
                      setAdding(null);
                    }}
                    className="rounded px-2 py-1.5 text-left text-sm hover:bg-slate-50"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            ) : (
              <button type="button" onClick={() => setAdding(col.id)} className="inline-flex items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 py-2 text-xs text-slate-600 hover:bg-white">
                <PlusIcon className="h-3.5 w-3.5" />
                เพิ่มบล็อก
              </button>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <SaveButton
        label="บันทึกบล็อก Footer"
        onSave={async () => {
          setError(null);
          const res = await saveFooterBlocks(config);
          if (res.error) {
            setError(res.error);
            throw new Error(res.error);
          }
        }}
      />
    </section>
  );
}
