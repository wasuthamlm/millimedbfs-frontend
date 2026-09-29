"use client";

import { useState, useTransition } from "react";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, SparklesIcon, TrashIcon } from "@/components/ui/admin-icons";
import { aiGenerateFaq, type FaqItem } from "@/app/admin/ai/actions";

export type { FaqItem };

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

/** Editable FAQ list (TH/EN) with an AI generator — feeds the FAQPage JSON-LD. */
export function FaqEditor({
  value,
  onChange,
  context,
}: {
  value: FaqItem[];
  onChange: (next: FaqItem[]) => void;
  context: { title: string; body: string };
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const update = (i: number, key: keyof FaqItem, v: string) => onChange(value.map((f, idx) => (idx === i ? { ...f, [key]: v } : f)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const generate = () =>
    startTransition(async () => {
      setError(null);
      if (value.length && !window.confirm("แทนที่ FAQ เดิมด้วยชุดที่ AI สร้างใหม่?")) return;
      const res = await aiGenerateFaq({ title: context.title, body: context.body, count: 7 });
      if (res.error || !res.data) setError(res.error ?? "AI ทำงานไม่สำเร็จ");
      else onChange(res.data);
    });

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">คำถามที่พบบ่อย (FAQ)</h3>
          <p className="text-xs text-slate-400">แสดงท้ายบทความและส่งเป็น FAQPage schema ให้ Google / AI Search</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={generate}
            disabled={pending || !context.body.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            <SparklesIcon className="h-3.5 w-3.5" />
            {pending ? "AI กำลังสร้าง..." : "สร้าง FAQ ด้วย AI"}
          </button>
          <button
            type="button"
            onClick={() => onChange([...value, { qTh: "", aTh: "", qEn: "", aEn: "" }])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            เพิ่มคำถาม
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {value.length === 0 && <p className="py-6 text-center text-sm text-slate-400">ยังไม่มี FAQ</p>}
      {value.map((f, i) => (
        <div key={i} className="grid grid-cols-1 gap-2 rounded-xl border border-slate-100 p-4 sm:grid-cols-2">
          <div className="flex items-center justify-between sm:col-span-2">
            <span className="text-xs font-semibold text-slate-500">คำถามที่ {i + 1}</span>
            <span className="flex gap-1">
              <button type="button" aria-label="เลื่อนขึ้น" onClick={() => move(i, -1)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                <ArrowUpIcon className="h-3.5 w-3.5" />
              </button>
              <button type="button" aria-label="เลื่อนลง" onClick={() => move(i, 1)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                <ArrowDownIcon className="h-3.5 w-3.5" />
              </button>
              <button type="button" aria-label="ลบคำถาม" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="rounded p-1 text-red-500 hover:bg-red-50">
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          </div>
          <input className={inputClass} placeholder="คำถาม (ไทย)" value={f.qTh} onChange={(e) => update(i, "qTh", e.target.value)} />
          <input className={inputClass} placeholder="Question (EN)" value={f.qEn} onChange={(e) => update(i, "qEn", e.target.value)} />
          <textarea rows={3} className={inputClass} placeholder="คำตอบ (ไทย)" value={f.aTh} onChange={(e) => update(i, "aTh", e.target.value)} />
          <textarea rows={3} className={inputClass} placeholder="Answer (EN)" value={f.aEn} onChange={(e) => update(i, "aEn", e.target.value)} />
        </div>
      ))}
    </div>
  );
}
